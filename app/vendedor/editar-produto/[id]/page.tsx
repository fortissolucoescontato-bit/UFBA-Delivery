import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { EditProductForm } from './EditProductForm'

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const { id } = params
    const supabase = await createClient()

    const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

    if (!product) {
        return notFound()
    }

    async function updateProduct(formData: FormData) {
        'use server'

        const name = formData.get('name') as string
        const price = parseFloat((formData.get('price') as string || '').replace(',', '.'))
        const description = formData.get('description') as string
        const category = formData.get('category') as string
        const subcategory = formData.get('subcategory') as string
        const image = formData.get('image') as File

        const supabase = await createClient()
        const updateData: any = { name, price, description: description || null, category, subcategory }

        if (image && image.size > 0) {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
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
                }
            }
        }

        const { error: dbError } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', id)

        if (dbError) {
            console.error('DB Error:', dbError)
            return redirect(`/vendedor/editar-produto/${id}?error=db_failed`)
        }

        redirect('/vendedor/dashboard')
    }

    return (
        <EditProductForm product={product} updateProduct={updateProduct} />
    )
}
