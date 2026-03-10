import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import { ProductCard } from "@/components/ProductCard"
import { ArrowLeft, MapPin, Store, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function StorefrontPage({ params }: { params: { id: string } }) {
    const { id } = await params
    const supabase = await createClient()

    // Buscando os dados do perfil do vendedor
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single()

    if (!profile) return notFound()

    // Registrar visualização (Page View) - ECLIPSE V10
    supabase.from('page_views').insert({
        seller_id: id,
        page_path: `/loja/${id}`
    }).then(({ error }) => {
        if (error) console.error("Page view error:", error)
    })

    // Buscando os itens da loja do vendedor
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', id)
        .order('created_at', { ascending: false })

    // Sanitização rigorosa da cor para previnir XSS Injection na tag <style>
    const rawColor = profile.brand_color || '#635BFF'
    const safeBrandColor = /^#[0-9A-F]{6}$/i.test(rawColor) ? rawColor : '#635BFF'

    return (
        <div className="min-h-screen bg-white pb-24 font-sans selection:bg-black selection:text-white">
            {/* Dynamic CSS for Brand Color - XSS Protegido */}
            <style dangerouslySetInnerHTML={{
                __html: `
                :root {
                    --brand-primary: ${safeBrandColor};
                    --brand-glow: ${safeBrandColor}33;
                }
                .bg-brand { background-color: var(--brand-primary) !important; }
                .text-brand { color: var(--brand-primary) !important; }
                .border-brand { border-color: var(--brand-primary) !important; }
                .shadow-brand { box-shadow: 0 4px 20px -10px var(--brand-glow); }
            `}} />

            {/* Premium Hero Section */}
            <div className="relative overflow-hidden bg-white border-b border-slate-200/60 pb-8">
                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-48 bg-brand opacity-5 pointer-events-none" />
                <div className="absolute top-48 left-0 w-full h-32 bg-gradient-to-t from-transparent to-brand/5 pointer-events-none" />

                <header className="relative z-30 p-4 max-w-5xl mx-auto flex items-center justify-between">
                    <Button variant="outline" size="icon" className="rounded-2xl bg-white/80 backdrop-blur-md border-slate-200/50 shadow-sm" asChild>
                        <Link href="/">
                            <ArrowLeft className="h-5 w-5 text-[#0A2540]" />
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${profile.is_online
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                            : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${profile.is_online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                            {profile.is_online ? 'Aberto' : 'Fechado'}
                        </span>
                    </div>
                </header>

                <div className="max-w-5xl mx-auto px-6 mt-6 flex flex-col md:flex-row items-center md:items-end gap-6 relative z-10">
                    <div className="relative animate-in-up">
                        <div className="absolute -inset-1 bg-brand/10 blur-xl rounded-full opacity-50" />
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="relative w-32 h-32 rounded-3xl border border-slate-100 object-cover bg-white shadow-sm" />
                        ) : (
                            <div className="relative w-32 h-32 rounded-3xl border border-slate-100 bg-[#FAFAFA] flex items-center justify-center shadow-sm">
                                <Store className="h-10 w-10 text-slate-500" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-2 animate-in-up" style={{ animationDelay: '100ms' }}>
                        <div className="flex flex-col md:flex-row items-center gap-2 mb-1">
                            <h1 className="text-3xl md:text-4xl font-black text-black tracking-tighter">{profile.full_name}</h1>
                            <div className="flex gap-2">
                                <span className="bg-black text-white px-2 py-0.5 rounded-md text-[11px] font-bold tracking-widest uppercase">PRO</span>
                                <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md text-[11px] font-bold tracking-widest uppercase border border-slate-200">VERIFICADO</span>
                            </div>
                        </div>

                        {profile.store_description && (
                            <p className="text-sm text-slate-500 font-medium max-w-xl mx-auto md:mx-0 leading-relaxed">
                                {profile.store_description}
                            </p>
                        )}

                        <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4 pt-2">
                            {profile.current_location && (
                                <div className="flex items-center gap-1.5 bg-slate-50 text-slate-600 px-3 py-2 rounded-full border border-slate-100 text-xs font-bold tracking-widest uppercase">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {profile.current_location}
                                </div>
                            )}
                            {profile.instagram_handle && (
                                <Link
                                    href={`https://instagram.com/${profile.instagram_handle.replace('@', '')}`}
                                    target="_blank"
                                    className="flex items-center gap-1.5 bg-slate-50 text-slate-600 px-3 py-2 rounded-full border border-slate-100 text-xs font-bold hover:bg-slate-100 transition-all tracking-widest uppercase"
                                >
                                    <Instagram className="h-3.5 w-3.5" />
                                    @{profile.instagram_handle.replace('@', '')}
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Store Catalog */}
            <main className="max-w-5xl mx-auto px-4 mt-12 animate-in-up" style={{ animationDelay: '200ms' }}>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-black tracking-tighter flex items-center gap-3 decoration-slate-200 underline-offset-4 mb-1">
                            Catálogo
                        </h2>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">ITENS DISPONÍVEIS</p>
                    </div>
                </div>

                {products && products.length > 0 ? (
                    <div className={profile.compact_layout
                        ? "flex flex-col gap-4"
                        : "grid grid-cols-2 lg:grid-cols-4 gap-6"
                    }>
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                name={product.name}
                                price={Number(product.price)}
                                image={product.image || product.image_url}
                                vendorName={profile.full_name || "Vendedor"}
                                sellerId={product.seller_id}
                                sellerWhatsapp={profile.whatsapp || ""}
                                sellerLocation={profile.current_location}
                                variant={profile.compact_layout ? "list" : "grid"}
                                brandColor={profile.brand_color}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white/50 rounded-[3rem] border-2 border-dashed border-slate-200">
                        <div className="bg-slate-100 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <Store className="h-8 w-8 text-slate-500" />
                        </div>
                        <h3 className="text-xl font-black text-[#0A2540] tracking-tight">Vitrínis em Manutenção</h3>
                        <p className="text-slate-400 text-sm mt-1 font-bold">VOLTE EM BREVE PARA VER AS NOVIDADES!</p>
                    </div>
                )}
            </main>
        </div>
    )
}
