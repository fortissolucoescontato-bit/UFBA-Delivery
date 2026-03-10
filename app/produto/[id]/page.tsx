import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, MessageCircle, MapPin, BadgeCheck, Sparkles, ShieldCheck, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ProductReviews } from "@/components/ProductReviews"
import { UserMenu } from "@/components/UserMenu"

export default async function ProductPage({ params }: { params: { id: string } }) {
    const resolvedParams = await params
    const supabase = await createClient()
    
    // 1. Buscamos o produto trazendo também a pix_key do perfil do vendedor
    const { data: product } = await supabase
        .from('products')
        .select('*, profiles(id, full_name, whatsapp, current_location, brand_color, is_online, pix_key)')
        .eq('id', resolvedParams.id)
        .single()

    if (!product) return notFound()

    // Registrar visualização (Page View)
    supabase.from('page_views').insert({
        seller_id: product.seller_id,
        page_path: `/produto/${product.id}`
    }).then(({ error }) => {
        if (error) console.error("Page view error:", error)
    })

    // 2. Lógica da Mensagem do WhatsApp
    const seller = product.profiles
    const whatsappLink = (p: any, s: any) => {
        const cleanPhone = s.whatsapp.replace(/\D/g, "")
        const baseMsg = `Olá ${s.full_name}! Vi seu produto "${p.name}" (R$ ${Number(p.price).toFixed(2)}) no UFBA Delivery.`
        
        // Se tiver PIX, adiciona a chamada para pagamento
        const finalMsg = s.pix_key 
            ? `${baseMsg} Quero comprar! Vi que sua chave PIX é ${s.pix_key}. Onde podemos nos encontrar no campus?`
            : `${baseMsg} Quero comprar! Como podemos combinar a entrega no campus?`
        
        return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(finalMsg)}`
    }

    return (
        <div className="min-h-screen bg-background pb-32 font-sans selection:bg-brand-primary selection:text-white">
            {/* Header Premium */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 px-6 py-4 flex items-center justify-between max-w-5xl mx-auto md:top-4 md:rounded-full md:border md:shadow-2xl">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="rounded-xl hover:bg-brand-primary/10" asChild>
                        <Link href="/">
                            <ArrowLeft className="h-5 w-5 text-brand-secondary" />
                        </Link>
                    </Button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-sm font-black text-brand-secondary tracking-tighter truncate leading-tight">{product.name}</h1>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest truncate">Visualizando agora</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <UserMenu />
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 pt-32 space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                    {/* Imagem do Produto */}
                    <div className="relative aspect-square w-full bg-white border border-slate-100/80 shadow-2xl shadow-slate-200/40 rounded-[3rem] overflow-hidden animate-reveal p-10 group">
                        <Image
                            src={product.image || product.image_url}
                            alt={product.name}
                            fill
                            className="object-contain p-8 group-hover:scale-105 transition-transform duration-1000"
                            priority
                        />
                        <div className="absolute top-8 right-8 bg-brand-secondary text-white px-6 py-3 rounded-2xl shadow-2xl animate-reveal [animation-delay:200ms]">
                            <p className="text-2xl font-black tracking-tighter">
                                <span className="text-xs mr-1 text-white/50 font-bold uppercase">R$</span>
                                {Number(product.price).toFixed(2).replace('.', ',')}
                            </p>
                        </div>
                    </div>

                    {/* Conteúdo Editorial */}
                    <div className="space-y-10 animate-reveal [animation-delay:300ms]">
                        <div className="space-y-6">
                            <div className="flex flex-wrap gap-3">
                                <span className="bg-brand-primary/10 px-4 py-1.5 rounded-full text-xs font-black text-brand-primary border border-brand-primary/10 flex items-center gap-2 uppercase tracking-widest">
                                    <Sparkles className="h-3 w-3" />
                                    PRODUTO DISPONÍVEL
                                </span>
                                {seller?.is_online && (
                                    <span className="bg-emerald-500/10 text-emerald-600 px-4 py-1.5 rounded-full text-xs font-black border border-emerald-500/20 uppercase tracking-widest flex items-center gap-2">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        VENDEDOR ATIVO
                                    </span>
                                )}
                            </div>

                            <h2 className="text-5xl md:text-6xl font-black text-brand-secondary tracking-tighter leading-[0.85]">
                                {product.name}
                            </h2>

                            <Link href={`/loja/${product.seller_id}`} className="group flex items-center gap-4 bg-white border border-slate-100 shadow-xl shadow-slate-200/40 p-4 rounded-[2rem] hover-lift">
                                <div className="h-14 w-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-brand-primary text-xl font-black border border-brand-primary/5">
                                    {seller?.full_name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">Vendedor Verificado</p>
                                    <p className="font-black text-brand-secondary text-lg tracking-tight group-hover:text-brand-primary transition-colors">{seller?.full_name}</p>
                                </div>
                                <div className="text-brand-primary opacity-30 group-hover:opacity-100 transition-all pr-2">
                                    <BadgeCheck className="h-7 w-7" />
                                </div>
                            </Link>
                        </div>

                        {product.description && (
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">DESCRIÇÃO</h4>
                                <p className="text-base text-slate-600 font-medium leading-relaxed bg-white/40 p-6 rounded-[2rem] border border-slate-50 italic">
                                    "{product.description}"
                                </p>
                            </div>
                        )}

                        <div className="p-8 rounded-[2.5rem] bg-brand-secondary text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-[-20%] right-[-20%] w-40 h-40 bg-brand-primary/10 blur-[60px] rounded-full"></div>
                            <div className="flex items-start gap-4 relative z-10">
                                <ShieldCheck className="h-8 w-8 text-brand-primary" />
                                <div className="space-y-1">
                                    <h4 className="font-black text-white text-sm uppercase tracking-widest">Protocolo de Segurança</h4>
                                    <p className="text-[11px] text-white/50 font-bold leading-relaxed">
                                        Combine a entrega em pontos movimentados (ex: Biblioteca, PAF ou RU). O pagamento é feito diretamente ao vendedor via PIX ou dinheiro.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-20">
                    <div className="flex items-center gap-4 mb-10">
                        <h2 className="text-3xl font-black text-brand-secondary tracking-tighter">Avaliações</h2>
                        <div className="h-[1px] flex-1 bg-slate-100"></div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-[3rem] p-8">
                        <ProductReviews productId={product.id} />
                    </div>
                </div>
            </main>

            {/* CTA Flutuante Inteligente */}
            <div className="fixed bottom-8 left-0 right-0 px-6 z-50 pointer-events-none">
                <div className="max-w-md mx-auto pointer-events-auto">
                    <a 
                        href={whatsappLink(product, seller)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full bg-brand-primary text-white p-2 pl-6 rounded-full shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all group"
                    >
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70 leading-none">
                                {seller?.pix_key ? "Pagamento via PIX" : "Entrega no Campus"}
                            </span>
                            <span className="text-lg font-black tracking-tight">Comprar Agora</span>
                        </div>
                        <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                            {seller?.pix_key ? <Wallet className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
                        </div>
                    </a>
                </div>
            </div>
        </div>
    )
}