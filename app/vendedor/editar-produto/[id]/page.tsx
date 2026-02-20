import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { SubmitButton } from '@/components/SubmitButton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { editProduct } from '@/app/vendedor/actions'
import Image from 'next/image'

export default async function EditProductPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/auth/login')
    }

    const { id } = await params

    const { data: product } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .eq('seller_id', user.id)
        .single()

    if (!product) {
        return notFound()
    }

    return (
        <div className="min-h-screen bg-background p-4 flex flex-col items-center">
            <div className="w-full max-w-xl">
                <header className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/vendedor/dashboard">
                            <ArrowLeft className="h-6 w-6" />
                        </Link>
                    </Button>
                    <h1 className="text-xl font-bold">Editar Produto</h1>
                </header>

                <Card>
                    <CardHeader>
                        <CardTitle>Detalhes do Produto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form action={editProduct} className="space-y-4">
                            <input type="hidden" name="productId" value={product.id} />

                            <div className="space-y-2">
                                <Label htmlFor="name">Nome do Produto</Label>
                                <Input id="name" name="name" defaultValue={product.name} placeholder="Ex: Coxinha de Frango" required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="price">Preço (R$)</Label>
                                    <Input id="price" name="price" defaultValue={product.price} type="number" step="0.50" min="0" placeholder="0.00" required />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="category">Categoria</Label>
                                    <Select name="category" defaultValue={product.category}>
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

                            <div className="space-y-3">
                                <Label htmlFor="image">Foto Atual</Label>
                                <div className="relative h-32 w-32 rounded-xl overflow-hidden shadow-sm border border-border">
                                    <Image src={product.image || product.image_url} alt={product.name} fill className="object-cover" />
                                </div>

                                <Label htmlFor="image" className="text-muted-foreground mt-4 block">Alterar Foto (Opcional)</Label>
                                <Input id="image" name="image" type="file" accept="image/*" />
                            </div>

                            <div className="pt-4">
                                <SubmitButton className="w-full">
                                    Atualizar Produto
                                </SubmitButton>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
