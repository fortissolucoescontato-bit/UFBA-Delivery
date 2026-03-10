'use server'

import { createClient } from "@/utils/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { productSchema, profileSchema } from "./schemas"

export async function deleteProduct(formData: FormData) {
    const productId = formData.get('productId') as string

    if (!productId) return

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/auth/login')

    // Hardening: Verify if user is actually a seller or admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    // Accept both 'seller' and 'admin' roles; redirect silently on failure (no throw = no 500)
    const allowedRoles = ['seller', 'admin', 'vendor']
    if (profile?.role && !allowedRoles.includes(profile.role)) {
        return redirect('/vendedor/dashboard?error=acesso_negado')
    }

    // RLS policies already check if user is owner, but good to be explicit
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('seller_id', user.id)

    if (error) {
        console.error('Error deleting product:', error)
        return redirect('/vendedor/dashboard?error=delete_failed')
    }

    revalidatePath('/vendedor/dashboard')
    revalidatePath('/') // Update home feed too
    redirect('/vendedor/dashboard')
}

export async function updateProfile(formData: FormData) {
    const whatsapp = formData.get('whatsapp') as string
    const location = formData.get('location') as string
    const fullName = formData.get('fullName') as string
    const description = formData.get('description') as string
    const pixKey = formData.get('pix_key') as string
    const avatar = formData.get('avatar') as File | null
    const banner = formData.get('banner') as File | null
    const brandColor = formData.get('brandColor') as string
    const instagram = formData.get('instagram') as string

    // Validate hex color (prevent XSS/Injection)
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    const safeBrandColor = hexRegex.test(brandColor) ? brandColor : '#f97316'

    const compactLayout = formData.get('compactLayout') === 'true'
    const fontStyle = formData.get('fontStyle') as string

    const mpPublicKey = formData.get('mpPublicKey') as string
    const mpAccessToken = formData.get('mpAccessToken') as string

    // Image removal signals
    const removeAvatar = formData.get('remove_avatar') === 'true'
    const removeBanner = formData.get('remove_banner') === 'true'

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/auth/login')

    // 1. Fetch existing profile for safety and authorization (ECLIPSE V10 Hardening)
    const { data: existingProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    const allowedRoles = ['seller', 'admin', 'vendor']
    if (existingProfile?.role && !allowedRoles.includes(existingProfile.role)) {
        return redirect('/vendedor/dashboard?error=acesso_negado')
    }

    // 2. Initial clean data (common fields)
    const cleanData: any = {
        whatsapp: (whatsapp || '').toString(),
        current_location: (location || '').toString(),
        full_name: (fullName || '').toString(),
        store_description: (description || '').toString(),
        brand_color: safeBrandColor,
        instagram_handle: (instagram || '').toString(),
        compact_layout: !!compactLayout,
        font_style: (fontStyle || 'modern').toString(),
    }

    // 3. MP: flag de conexão depende apenas dos valores efetivamente enviados
    const finalMpPublicKey = mpPublicKey || ''
    const finalMpAccessToken = mpAccessToken || ''

    cleanData.mp_connected = !!(finalMpPublicKey && finalMpAccessToken)

    if (pixKey) {
        cleanData.pix_key = pixKey.toString()
    }

    // Handle Image Logic (Upload or Remove)
    const downloadUrl = (fileName: string, bucket: string) => {
        const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
        return data.publicUrl
    }

    const uploadImage = async (file: File, bucket: string, prefix: string) => {
        if (!file?.size) return null

        if (file.size > 5 * 1024 * 1024) {
            console.error(`[SECURITY] File too large: ${file.size} bytes`)
            return null
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        if (!file.type || !allowedMimeTypes.includes(file.type)) {
            console.error(`[SECURITY] Invalid file type: ${file.type}`)
            return null
        }

        const magicNumbers: { [key: string]: number[] } = {
            'image/jpeg': [0xFF, 0xD8, 0xFF],
            'image/png': [0x89, 0x50, 0x4E, 0x47],
            'image/webp': [0x52, 0x49, 0x46, 0x46],
            'image/gif': [0x47, 0x49, 0x46]
        }

        const magic = magicNumbers[file.type]
        if (magic && !magic.every((byte, i) => buffer[i] === byte)) {
            console.error(`[SECURITY] Magic bytes mismatch for ${file.type}`)
            return null
        }

        const ext = file.type.split('/')[1]
        const fileName = `${user.id}/${prefix}-${Date.now()}.${ext}`
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(fileName, buffer, { 
                upsert: true,
                contentType: file.type
            })

        if (uploadError) {
            console.error(`Upload error to ${bucket}:`, { code: uploadError.message })
            return null
        }
        return downloadUrl(fileName, bucket)
    }

    // Process Avatar
    if (removeAvatar) {
        cleanData.avatar_url = null
    } else {
        const avatarUrl = avatar && avatar.size > 0 ? await uploadImage(avatar, 'profiles', 'avatar') : null
        if (avatarUrl) cleanData.avatar_url = avatarUrl
    }

    // Process Banner
    if (removeBanner) {
        cleanData.store_banner_url = null
    } else {
        const bannerUrl = banner && banner.size > 0 ? await uploadImage(banner, 'profiles', 'banner') : null
        if (bannerUrl) cleanData.store_banner_url = bannerUrl
    }

    const { error } = await supabase
        .from('profiles')
        .update(cleanData)
        .eq('id', user.id)

    if (error) {
        console.error('Error updating profile:', error)
        return redirect('/vendedor/perfil?error=db_error')
    }

    // 8. Atualizar credenciais sensíveis na tabela dedicada usando service_role
    if (finalMpPublicKey && finalMpAccessToken) {
        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        await supabaseAdmin.from('profile_mp_credentials').upsert({
            profile_id: user.id,
            mp_access_token: finalMpAccessToken,
            mp_public_key: finalMpPublicKey,
        })
    }

    revalidatePath('/vendedor/perfil')
    revalidatePath(`/loja/${user.id}`)
    redirect('/vendedor/perfil?success=true')
}

export async function toggleOnlineStatus(isOnline: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase
        .from('profiles')
        .update({ is_online: isOnline })
        .eq('id', user.id)

    if (error) {
        console.error('Error toggling online status:', error)
        return
    }

    revalidatePath('/vendedor/dashboard')
    revalidatePath('/')
}

export async function updateLocation(location: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase
        .from('profiles')
        .update({ current_location: location })
        .eq('id', user.id)

    if (error) {
        console.error('Error updating location:', error)
        return
    }

    revalidatePath('/vendedor/perfil')
    revalidatePath('/vendedor/dashboard')
    revalidatePath('/')
}

export async function editProduct(formData: FormData) {
    const productId = formData.get('productId') as string
    const name = formData.get('name') as string
    const price = parseFloat((formData.get('price') as string || '').replace(',', '.'))
    const category = formData.get('category') as string || 'Outros'
    const image = formData.get('image') as File | null

    // Validate with Zod
    const validated = productSchema.safeParse({ name, price, category })
    if (!validated.success) {
        const message = validated.error.issues[0].message
        return redirect(`/vendedor/dashboard?error=validation&message=${encodeURIComponent(message)}`)
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/auth/login')

    const updateData: { name: string; price: number; category: string; image?: string; image_url?: string } = {
        name,
        price,
        category,
        // Hardening: is_boosted e boost_expires_at NUNCA são atualizados via formulário
    }

    // Handle optional image upload securely
    if (image && image.size > 0) {

        if (image.size > 5 * 1024 * 1024) {
            return redirect('/vendedor/dashboard?error=upload_blocked_size')
        }

        const buffer = Buffer.from(await image.arrayBuffer())
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        
        if (!image.type || !allowedMimeTypes.includes(image.type)) {
            return redirect('/vendedor/dashboard?error=upload_blocked_type')
        }

        const magicNumbers: { [key: string]: number[] } = {
            'image/jpeg': [0xFF, 0xD8, 0xFF],
            'image/png': [0x89, 0x50, 0x4E, 0x47],
            'image/webp': [0x52, 0x49, 0x46, 0x46],
            'image/gif': [0x47, 0x49, 0x46]
        }

        const magic = magicNumbers[image.type]
        if (magic && !magic.every((byte, i) => buffer[i] === byte)) {
            return redirect('/vendedor/dashboard?error=upload_blocked_invalid')
        }

        const fileExt = image.type.split('/')[1]
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(fileName, buffer, {
                contentType: image.type
            })

        if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
                .from('products')
                .getPublicUrl(fileName)
            updateData.image = publicUrl
            updateData.image_url = publicUrl
        }
    }

    const { error: dbError } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', productId)
        .eq('seller_id', user.id)

    if (dbError) {
        console.error('DB Update Error:', dbError)
        return redirect('/vendedor/dashboard?error=db_failed')
    }

    revalidatePath('/vendedor/dashboard')
    revalidatePath('/')
    redirect('/vendedor/dashboard')
}

export async function createElitePlanPreference() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/auth/login')

    const { createAdminPreference } = await import('@/lib/mercadopago')

    try {
        const initPoint = await createAdminPreference({
            title: "Assinatura Mensal UFBA Delivery ELITE",
            unit_price: 9.90,
            quantity: 1,
            metadata: {
                payment_type: 'elite_plan',
                seller_id: user.id
            }
        })
        return { url: initPoint }
    } catch (error) {
        console.error("Erro ao criar plano elite:", error)
        return { error: "Falha ao gerar pagamento" }
    }
}

export async function createBoostPreference(productId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/auth/login')

    const { createAdminPreference } = await import('@/lib/mercadopago')

    try {
        const initPoint = await createAdminPreference({
            title: "Boost Spotlight 24h - Destaque de Produto",
            unit_price: 1.99,
            quantity: 1,
            metadata: {
                payment_type: 'boost_spotlight',
                seller_id: user.id,
                product_id: productId
            }
        })
        return { url: initPoint }
    } catch (error) {
        console.error("Erro ao criar boost:", error)
        return { error: "Falha ao gerar pagamento" }
    }
}
