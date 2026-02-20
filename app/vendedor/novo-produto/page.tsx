import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { SubmitButton } from '@/components/SubmitButton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function AddProductPage() {
    async function createProduct(formData: FormData) {
        'use server'

        const name = formData.get('name') as string
        const price = parseFloat(formData.get('price') as string)
        const category = formData.get('category') as string || 'Outros'
        const image = formData.get('image') as File

        if (!name || !price || !image) {
            return // Handle validation error
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return redirect('/auth/login')
        }

        // 1. Upload Image
        const fileExt = image.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(fileName, image)

        if (uploadError) {
            console.error('Upload Error:', uploadError)
            return redirect('/vendedor/novo-produto?error=upload_failed')
        }

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(fileName)

        // 3. Insert Product
        const { error: dbError } = await supabase
            .from('products')
            .insert({
                name,
                price,
                category,
                image: publicUrl, // Compatibility with existing schema
                image_url: publicUrl, // New schema field if added
                seller_id: user.id
            })

        if (dbError) {
            console.error('DB Error:', dbError)
            return redirect('/vendedor/novo-produto?error=db_failed')
        }

        redirect('/vendedor/dashboard')
    }

    return (
        <div className="min-h-screen bg-background p-4">
            <header className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/vendedor/dashboard">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                </Button>
                <h1 className="text-xl font-bold">Adicionar Produto</h1>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Detalhes do Produto</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={createProduct} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nome do Produto</Label>
                            <Input id="name" name="name" placeholder="Ex: Coxinha de Frango" required />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Preço (R$)</Label>
                                <Input id="price" name="price" type="number" step="0.50" min="0" placeholder="0.00" required />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Categoria</Label>
                                <Select name="category" defaultValue="Outros">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Lanches">🍔 Lanches</SelectItem>
                                        <SelectItem value="Doces">🍰 Doces</SelectItem>
                                        <SelectItem value="Bebidas">🥤 Bebidas</SelectItem>
                                        <SelectItem value="Almoço">🍱 Almoço</SelectItem>
                                        <SelectItem value="Saudável">🥗 Saudável</SelectItem>
                                        <SelectItem value="Outros">🍟 Outros</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="image">Foto</Label>
                            <Input id="image" name="image" type="file" accept="image/*" required />
                        </div>

                        <SubmitButton className="w-full">
                            Salvar Produto
                        </SubmitButton>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
