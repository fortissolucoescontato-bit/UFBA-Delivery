import { Button } from "@/components/ui/button"
import { VendorBadge } from "@/components/VendorBadge"
import Link from "next/link"
import { ArrowLeft, Plus, Pencil, DollarSign, ShoppingCart, Eye, TrendingUp } from "lucide-react"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Image from "next/image"
import { UserMenu } from "@/components/UserMenu"
import { deleteProduct } from "../actions"
import { StoreStatusCard } from "./StoreStatusCard"
import { StorefrontActionsCard } from "./StorefrontActionsCard"
import { DeleteProductButton } from "@/components/DeleteProductButton"
import { SubscriptionPanel } from "@/components/vendedor/SubscriptionPanel"
import { StatsCard } from "./StatsCard"
// 1. Importação do Alerta que criamos
import { SellerPixAlert } from "@/components/SellerPixAlert"

export default async function VendorDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/auth/login')
    }

    // 2. Adicionamos 'pix_key' na busca do perfil
    const [
        { data: profile },
        { data: products },
        { count: orderCount },
        { count: viewCount }
    ] = await Promise.all([
        supabase.from('profiles')
            .select('is_online, current_location, avatar_url, subscription_tier, pix_key')
            .eq('id', user?.id)
            .single(),
        supabase.from('products').select('*').eq('seller_id', user?.id).order('created_at', { ascending: false }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('seller_id', user?.id),
        supabase.from('page_views').select('*', { count: 'exact', head: true }).eq('seller_id', user?.id)
    ])

    const { data: orders } = await supabase.from('orders').select('total_price').eq('seller_id', user?.id)
    const totalSales = orders?.reduce((acc, order) => acc + Number(order.total_price), 0) || 0
    const conversionRate = (viewCount && viewCount > 0) ? ((orderCount || 0) / viewCount) * 100 : 0

    return (
        <div className="min-h-screen bg-background pb-32 font-sans selection:bg-brand-primary selection:text-white">
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 px-6 py-4 flex items-center justify-between max-w-5xl mx-auto md:top-4 md:rounded-full md:border md:shadow-2xl">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-brand-primary/10" asChild>
                        <Link href="/">
                            <ArrowLeft className="h-5 w-5 text-brand-secondary" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-xl font-black text-brand-secondary tracking-tighter leading-none">Dashboard</h1>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-brand-primary opacity-80">Operações</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <UserMenu />
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 pt-32 space-y-12">
                
                {/* 3. ALERTA CRÍTICO: Se não houver pix_key, o banner aparece no topo */}
                {!profile?.pix_key && (
                    <div className="animate-reveal">
                        <SellerPixAlert />
                    </div>
                )}

                {/* Stats Grid */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-reveal">
                    <StatsCard
                        title="Vendas"
                        value={`R$ ${totalSales.toFixed(2)}`}
                        icon={<DollarSign className="w-5 h-5" />}
                        trend={{ value: 'Tempo Real', isPositive: true }}
                    />
                    <StatsCard
                        title="Pedidos"
                        value={orderCount || 0}
                        icon={<ShoppingCart className="w-5 h-5" />}
                        trend={{ value: 'Total', isPositive: true }}
                    />
                    <StatsCard
                        title="Visitas"
                        value={viewCount || 0}
                        icon={<Eye className="w-5 h-5" />}
                        trend={{ value: 'Total', isPositive: true }}
                    />
                    <StatsCard
                        title="Conversão"
                        value={`${(conversionRate || 0).toFixed(1)}%`}
                        icon={<TrendingUp className="w-5 h-5" />}
                        trend={{ value: 'Saudável', isPositive: conversionRate > 0 }}
                    />
                </section>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    <div className="md:col-span-2 space-y-10">
                        <div className="grid grid-cols-1 gap-6 animate-reveal [animation-delay:200ms]">
                            <StoreStatusCard
                                initialOnline={profile?.is_online ?? true}
                                currentLocation={profile?.current_location || null}
                            />
                            <StorefrontActionsCard sellerId={user.id} avatarUrl={profile?.avatar_url} />
                        </div>

                        {/* Meus Produtos */}
                        <section className="space-y-6 animate-reveal [animation-delay:400ms]">
                            <div className="flex items-end justify-between px-2 pt-4">
                                <div className="space-y-1">
                                    <p className="text-brand-primary text-xs font-black tracking-widest uppercase">VITRINE ATIVA</p>
                                    <h2 className="text-2xl md:text-3xl font-black text-brand-secondary tracking-tighter">
                                        Gerenciar Produtos
                                        <span className="ml-3 text-sm bg-brand-primary/10 text-brand-primary px-3 py-1 rounded-full">{products?.length || 0}</span>
                                    </h2>
                                </div>
                                <Button size="sm" className="rounded-2xl font-black text-xs h-11 bg-brand-primary shadow-lg shadow-brand-primary/20 hover-lift" asChild>
                                    <Link href="/vendedor/novo-produto">
                                        <Plus className="h-4 w-4 mr-2" />
                                        NOVO ITEM
                                    </Link>
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {products?.length === 0 && (
                                    <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200/60 shadow-xl shadow-slate-200/20">
                                        <div className="bg-slate-50 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                                            <Plus className="w-8 h-8 text-brand-primary opacity-40" />
                                        </div>
                                        <h3 className="font-black text-brand-secondary text-xl tracking-tight">Sua vitrine está vazia</h3>
                                        <p className="text-slate-400 text-sm mt-3 font-medium">Os melhores negócios começam com o primeiro item.</p>
                                    </div>
                                )}

                                {products?.map((product, idx) => (
                                    <div key={product.id} className="bg-white rounded-[2rem] flex items-center p-3 gap-5 group hover-lift animate-reveal border border-slate-100/80 shadow-xl shadow-slate-200/40 relative overflow-hidden" style={{ animationDelay: `${500 + (idx * 50)}ms` }}>
                                        <div className="relative w-28 h-28 flex-shrink-0 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100/50">
                                            <Image
                                                src={product.image || product.image_url}
                                                alt={product.name}
                                                fill
                                                sizes="112px"
                                                className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0 pr-4">
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{product.category}</p>
                                            <h3 className="font-black text-brand-secondary text-lg leading-tight truncate mb-1.5">{product.name}</h3>
                                            <p className="font-black text-brand-primary text-xl tracking-tighter">
                                                <span className="text-xs text-slate-400 mr-1">R$</span>
                                                {Number(product.price).toFixed(2)}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-2 shrink-0 pr-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-10 px-4 rounded-xl bg-white border-slate-100 text-brand-secondary hover:bg-brand-secondary hover:text-white shadow-sm transition-all"
                                                asChild
                                            >
                                                <Link href={`/vendedor/editar-produto/${product.id}`}>
                                                    <Pencil className="h-3.5 w-3.5 mr-2 opacity-80" />
                                                    <span className="text-xs font-black uppercase tracking-wider">Editar</span>
                                                </Link>
                                            </Button>
                                            <form action={deleteProduct}>
                                                <input type="hidden" name="productId" value={product.id} />
                                                <DeleteProductButton showLabel />
                                            </form>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <aside className="space-y-8 animate-reveal [animation-delay:600ms]">
                        <SubscriptionPanel
                            currentTier={profile?.subscription_tier || 'basic'}
                        />

                        <div className="p-8 rounded-[3rem] bg-gradient-to-br from-brand-secondary to-indigo-950 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-[-20%] right-[-20%] w-40 h-40 bg-brand-primary/20 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
                            <h3 className="font-black text-xl mb-3 tracking-tighter relative z-10">Dica de Ouro</h3>
                            <p className="text-xs text-indigo-100/70 leading-relaxed font-bold relative z-10">
                                Vendedores **ELITE** ganham badges verificadas e prioridade no radar dos compradores. Ative agora para decolar!
                            </p>
                            <Button className="mt-6 w-full rounded-2xl bg-white text-brand-secondary font-black text-xs hover:bg-brand-primary hover:text-white transition-all shadow-xl">
                                SAIBA MAIS
                            </Button>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    )
}