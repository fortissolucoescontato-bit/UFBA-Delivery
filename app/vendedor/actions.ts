'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function deleteProduct(formData: FormData) {
    const productId = formData.get('productId') as string

    if (!productId) return

    const supabase = await createClient()
    if (!user) return redirect('/auth/login')

    // Hardening: Verify if user is actually a seller
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'seller') {
        throw new Error('Acesso negado: Apenas vendedores podem excluir produtos.')
    }

    // RLS policies already check if user is owner, but good to be explicit
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)
        .eq('seller_id', user.id)

    if (error) {
        console.error('Error deleting product:', error)
        return
    }

    revalidatePath('/vendedor/dashboard')
    revalidatePath('/vendedor/dashboard')
    revalidatePath('/') // Update home feed too
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

    // Basic validation
    if (!whatsapp || !fullName) return redirect('/vendedor/perfil?error=missing_fields')

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/auth/login')

    const updateData: any = {
        whatsapp,
        current_location: location,
        full_name: fullName,
        store_description: description,
        ...(pixKey && { pix_key: pixKey }),
        brand_color: safeBrandColor,
        instagram_handle: instagram,
        compact_layout: compactLayout,
        font_style: fontStyle || 'modern'
    }

    const downloadUrl = (fileName: string, bucket: string) => {
        const { data } = supabase.storage.from(bucket).getPublicUrl(fileName)
        return data.publicUrl
    }

    const uploadImage = async (file: File, bucket: string) => {
        if (!file || file.size === 0) return null
        const prefix = bucket === 'avatars' ? 'avatar' : 'banner'
        const fileName = `${user.id}/${prefix}-${Date.now()}.${file.name.split('.').pop()}`
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, { upsert: true })

        if (uploadError) {
            console.error(`Upload error to ${bucket}:`, uploadError)
            return null
        }
        return downloadUrl(fileName, bucket)
    }

    const avatarUrl = avatar && avatar.size > 0 ? await uploadImage(avatar, 'avatars') : null
    const bannerUrl = banner && banner.size > 0 ? await uploadImage(banner, 'store-banners') : null

    if (avatarUrl) updateData.avatar_url = avatarUrl
    if (bannerUrl) updateData.store_banner_url = bannerUrl

    const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)

    if (error) {
        console.error('Error updating profile:', error)
        return redirect('/vendedor/perfil?error=db_error')
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
    const price = parseFloat(formData.get('price') as string)
    const category = formData.get('category') as string || 'Outros'
    const image = formData.get('image') as File | null

    if (!productId || !name || !price) {
        return redirect('/vendedor/dashboard?error=missing_fields')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/auth/login')

    const updateData: { name: string; price: number; category: string; image?: string; image_url?: string } = {
        name,
        price,
        category,
    }

    // Handle optional image upload
    if (image && image.size > 0) {
        const fileExt = image.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(fileName, image)

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
