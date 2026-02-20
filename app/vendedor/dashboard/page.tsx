import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VendorBadge } from "@/components/VendorBadge"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2, Pencil } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Image from "next/image"
import { UserMenu } from "@/components/UserMenu"
import { deleteProduct } from "../actions"
import { StoreStatusCard } from "./StoreStatusCard"
import { StorefrontActionsCard } from "./StorefrontActionsCard"

export default async function VendorDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/auth/login')
    }

    // Fetch profile and products
    const [{ data: profile }, { data: products }] = await Promise.all([
        supabase.from('profiles').select('is_online, current_location, avatar_url').eq('id', user?.id).single(),
        supabase.from('products').select('*').eq('seller_id', user?.id).order('created_at', { ascending: false })
    ])

    return (
        <div className="min-h-screen bg-background p-4 pb-20">
            <header className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                </Button>
                <h1 className="text-xl font-bold">Painel do Vendedor</h1>
                <div className="ml-auto">
                    <UserMenu />
                </div>
            </header>

            <div className="space-y-6">
                {/* Status Card */}
                <StoreStatusCard
                    initialOnline={profile?.is_online ?? true}
                    currentLocation={profile?.current_location || null}
                />

                {/* Public Storefront Actions */}
                <StorefrontActionsCard sellerId={user.id} avatarUrl={profile?.avatar_url} />

                {/* My Products Section */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Meus Produtos</h2>
                        <Button size="sm" asChild>
                            <Link href="/vendedor/novo-produto">
                                <Plus className="h-4 w-4 mr-1" />
                                Novo
                            </Link>
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {products?.length === 0 && (
                            <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                                Você ainda não tem produtos.
                            </div>
                        )}

                        {products?.map((product) => (
                            <Card key={product.id} className="flex flex-row overflow-hidden h-24">
                                <div className="relative w-24 h-full bg-muted shrink-0">
                                    <Image
                                        src={product.image || product.image_url}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 p-3 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-medium line-clamp-1">{product.name}</h3>
                                        <p className="text-sm text-green-600 font-bold">
                                            R$ {Number(product.price).toFixed(2)}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-primary hover:bg-primary/10" asChild>
                                            <Link href={`/vendedor/editar-produto/${product.id}`}>
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <form action={deleteProduct}>
                                            <input type="hidden" name="productId" value={product.id} />
                                            <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive/90 hover:bg-destructive/10" type="submit">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </form>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Plan Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Seu Plano</CardTitle>
                        <VendorBadge />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Vendedor Pro</div>
                        <p className="text-xs text-muted-foreground mb-4">
                            Produtos ilimitados • Destaque
                        </p>
                        <Button variant="outline" className="w-full">
                            Gerenciar Assinatura
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
