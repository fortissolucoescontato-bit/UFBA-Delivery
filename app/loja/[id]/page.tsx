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

    // Buscando os itens da loja do vendedor
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', id)
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Dynamic CSS for Brand Color */}
            <style dangerouslySetInnerHTML={{
                __html: `
                :root {
                    --brand-primary: ${profile.brand_color || '#f97316'};
                    --store-font: ${profile.font_style === 'classic' ? '"Times New Roman", serif' :
                        profile.font_style === 'bold' ? '"Arial Black", sans-serif' :
                            profile.font_style === 'playful' ? '"Comic Sans MS", "Chalkboard SE", cursive' :
                                'inherit'
                    };
                    --store-weight: ${profile.font_style === 'bold' ? '900' : 'normal'};
                }
                .bg-brand { background-color: var(--brand-primary) !important; }
                .text-brand { color: var(--brand-primary) !important; }
                .border-brand { border-color: var(--brand-primary) !important; }
                .hover\\:bg-brand-dark:hover { filter: brightness(0.9); }
                .store-font-family { 
                    font-family: var(--store-font); 
                    font-weight: var(--store-weight);
                }
            `}} />

            {/* Header da Loja com Capa */}
            <div className="relative store-font-family">
                {profile.store_banner_url ? (
                    <div className="h-48 w-full relative">
                        <img src={profile.store_banner_url} alt="Cover" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                ) : (
                    <div className="h-32 w-full bg-gradient-to-r from-primary/20 to-primary/5" />
                )}

                <header className="absolute top-0 w-full z-10 p-4 flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="bg-background/20 backdrop-blur-md hover:bg-background/40 text-black dark:text-white border border-white/20" asChild>
                        <Link href="/">
                            <ArrowLeft className="h-6 w-6" />
                        </Link>
                    </Button>
                </header>

                <div className="px-5 relative -mt-12">
                    <div className="flex justify-between items-end mb-3">
                        {profile.avatar_url ? (
                            <img src={profile.avatar_url} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-background object-cover bg-background shadow-md" />
                        ) : (
                            <div className="w-24 h-24 rounded-full border-4 border-background bg-muted flex items-center justify-center shadow-md">
                                <Store className="h-10 w-10 text-muted-foreground" />
                            </div>
                        )}

                        <span className={`shadow-sm inline-flex items-center gap-1.5 px-3 py-1 mb-2 rounded-full text-xs font-bold uppercase tracking-wider ${profile.is_online ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-zinc-100 text-zinc-600 border border-zinc-200'}`}>
                            {profile.is_online ? (
                                <>
                                    <span className="relative flex h-2 w-2">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    Aberta
                                </>
                            ) : ("Fechada")}
                        </span>
                    </div>

                    <h1 className="text-2xl font-extrabold tracking-tight">{profile.full_name}</h1>

                    {profile.store_description && (
                        <p className="text-sm text-foreground/80 mt-1 whitespace-pre-wrap">{profile.store_description}</p>
                    )}

                    {profile.current_location && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            <p className="text-sm font-semibold flex items-center gap-1.5 bg-orange-50 text-orange-700 w-fit px-3 py-1.5 rounded-xl border border-orange-100">
                                <MapPin className="h-4 w-4" />
                                {profile.current_location}
                            </p>

                            {profile.instagram_handle && (
                                <Link
                                    href={`https://instagram.com/${profile.instagram_handle.replace('@', '')}`}
                                    target="_blank"
                                    className="text-sm font-semibold flex items-center gap-1.5 bg-pink-50 text-pink-700 w-fit px-3 py-1.5 rounded-xl border border-pink-100 hover:bg-pink-100 transition-colors"
                                >
                                    <Instagram className="h-4 w-4" />
                                    @{profile.instagram_handle.replace('@', '')}
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Grid de Produtos */}
            <main className="px-4 mt-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Store className="h-5 w-5 text-brand" />
                    Catálogo
                </h3>

                {products && products.length > 0 ? (
                    <div className={profile.compact_layout
                        ? "flex flex-col gap-3"
                        : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
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
                    <div className="text-center p-12 border border-dashed rounded-3xl text-muted-foreground bg-muted/20">
                        <Store className="h-10 w-10 mx-auto mb-3 opacity-20" />
                        <p>Nenhum produto cadastrado<br />nesta loja no momento.</p>
                    </div>
                )}
            </main>
        </div>
    )
}
