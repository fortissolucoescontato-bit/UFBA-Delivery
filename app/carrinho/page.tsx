'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, MessageCircle, Trash2, Store, Zap, Loader2, ShieldCheck } from "lucide-react"
import { UserMenu } from "@/components/UserMenu"
import { useCart } from "@/context/CartContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Image from "next/image"
import { initiateChatCheckout } from "./actions"
import { useState } from "react"
import { toast } from "sonner"
import { config } from "@/lib/config"

export default function CartPage() {
    const { items, removeFromCart } = useCart()
    const [isCreatingChat, setIsCreatingChat] = useState<string | null>(null)

    // Agrupamento inteligente por vendedor (Escudo ECLIPSE V10)
    const groupedItems = items.reduce((acc, item) => {
        if (!item.sellerId || item.sellerId === "undefined" || item.sellerId === "[object Object]") {
            return acc;
        }

        if (!acc[item.sellerId]) {
            acc[item.sellerId] = {
                sellerName: item.sellerName,
                sellerWhatsapp: item.sellerWhatsapp,
                items: [],
                subtotal: 0
            }
        }
        acc[item.sellerId].items.push(item)
        acc[item.sellerId].subtotal += item.price * item.quantity
        return acc
    }, {} as Record<string, { sellerName: string, sellerWhatsapp: string, items: typeof items, subtotal: number }>)

    return (
        <div className="min-h-screen bg-[#F6F9FC] p-4 flex flex-col pb-24 font-sans selection:bg-brand-primary/10">
            {/* 🚀 Header de Checkout Interno */}
            <header className="flex items-center gap-4 mb-8 max-w-2xl mx-auto w-full pt-4">
                <Button variant="outline" size="icon" className="rounded-2xl bg-white shadow-sm border-slate-200/60 hover-lift" asChild>
                    <Link href="/">
                        <ArrowLeft className="h-5 w-5 text-[#0A2540]" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-black text-[#0A2540] tracking-tighter">Carrinho</h1>
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-3 w-3 text-emerald-500" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ambiente Seguro UFBA</p>
                    </div>
                </div>
                <div className="ml-auto">
                    <UserMenu />
                </div>
            </header>

            {items.length === 0 ? (
                /* 🛒 Estado Vazio */
                <div className="flex flex-col items-center justify-center flex-1 text-center animate-reveal">
                    <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl shadow-slate-200/50 mb-8 border border-slate-50">
                        <Store className="h-20 w-20 text-slate-100" />
                    </div>
                    <h2 className="text-2xl font-black text-[#0A2540] tracking-tight">Sua sacola está vazia</h2>
                    <p className="text-slate-400 font-bold text-sm mt-2 mb-8 max-w-[240px]">Adicione produtos de vendedores do campus para começar!</p>
                    <Button variant="default" className="rounded-2xl px-10 py-7 font-black tracking-tight shadow-xl bg-brand-primary hover:bg-brand-primary/90 transition-all" asChild>
                        <Link href="/">EXPLORAR PRODUTOS</Link>
                    </Button>
                </div>
            ) : (
                /* 📦 Lista de Pedidos por Vendedor */
                <div className="flex-1 space-y-8 max-w-2xl mx-auto w-full pb-12">
                    {Object.entries(groupedItems).map(([sellerId, group], index) => {
                        const messageText = `*🛍️ NOVO PEDIDO - ${config.siteName.toUpperCase()}*\n` +
                            `----------------------------------\n\n` +
                            `Olá *${group.sellerName}*! 👋\n` +
                            `Quero comprar estes itens:\n\n` +
                            group.items.map(i => `✅ *${i.quantity}x* ${i.name} (R$ ${i.price.toFixed(2)})`).join('\n') +
                            `\n\n💰 *TOTAL: R$ ${group.subtotal.toFixed(2)}*\n` +
                            `----------------------------------\n\n` +
                            `📍 *Entrega:* A combinar no campus\n` +
                            `_Pedido gerado via UFBA Delivery_`;

                        return (
                            <Card key={sellerId} className="border-none shadow-2xl shadow-slate-200/60 rounded-[3rem] overflow-hidden animate-reveal" style={{ animationDelay: `${index * 100}ms` }}>
                                <CardHeader className="bg-white pb-4 pt-8 px-8 border-b border-slate-50/50">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-brand-primary/5 flex items-center justify-center text-brand-primary border border-brand-primary/10">
                                            <Store className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-black text-[#0A2540] tracking-tight">{group.sellerName}</CardTitle>
                                            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Loja Verificada no Campus</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="bg-white/40 backdrop-blur-md space-y-8 pt-8 px-8 pb-8">
                                    {/* Itens do Vendedor */}
                                    <div className="space-y-6">
                                        {group.items.map((item) => (
                                            <div key={item.id} className="flex justify-between items-center group">
                                                <div className="flex gap-5">
                                                    <div className="relative h-16 w-16 rounded-2xl bg-white border border-slate-100 overflow-hidden shrink-0 shadow-sm">
                                                        <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover group-hover:scale-110 transition-transform duration-700" />
                                                    </div>
                                                    <div className="flex flex-col justify-center">
                                                        <p className="font-black text-base text-[#0A2540] leading-tight mb-1">{item.name}</p>
                                                        <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                                                            {item.quantity} UN • R$ {item.price.toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="font-black text-base text-brand-primary tracking-tighter">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-10 w-10 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                                        onClick={() => removeFromCart(item.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* 💳 Card de Pagamento & Checkout Interno */}
                                    <div className="bg-[#0A2540] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-[-20%] right-[-10%] w-40 h-40 bg-brand-primary/20 blur-[60px] rounded-full group-hover:bg-brand-primary/30 transition-all duration-1000" />

                                        <div className="flex justify-between items-end mb-8 relative z-10">
                                            <div>
                                                <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-2">Subtotal da Loja</p>
                                                <p className="text-4xl font-black tracking-tighter">R$ {group.subtotal.toFixed(2).replace('.', ',')}</p>
                                            </div>
                                            <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2 backdrop-blur-md">
                                                <Zap className="h-3 w-3 text-yellow-400 fill-yellow-400 animate-pulse" />
                                                <span className="text-[10px] font-black tracking-widest italic uppercase">Entrega Local</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4 relative z-10">
                                            <Button
                                                className="w-full h-16 bg-white text-[#0A2540] hover:bg-slate-100 rounded-2xl font-black tracking-tight text-base shadow-xl transition-all active:scale-[0.98]"
                                                disabled={isCreatingChat === sellerId}
                                                onClick={async () => {
                                                    try {
                                                        setIsCreatingChat(sellerId)
                                                        const result = await initiateChatCheckout(
                                                            sellerId,
                                                            messageText,
                                                            group.subtotal,
                                                            `Pedido: ${group.items[0].name}...`
                                                        )

                                                        if (result?.success && result?.chatId) {
                                                            toast.success("Pedido gerado com sucesso!")
                                                            window.location.href = `/mensagens/${result.chatId}`
                                                        } else if (result?.error === "AUTH_REQUIRED") {
                                                            toast.error("Entre na sua conta", { description: "Você precisa estar logado para comprar." })
                                                            setTimeout(() => window.location.href = '/auth/login', 1500)
                                                        } else {
                                                            toast.error("Erro no processamento")
                                                            setIsCreatingChat(null)
                                                        }
                                                    } catch (e) {
                                                        setIsCreatingChat(null)
                                                        toast.error("Erro interno")
                                                    }
                                                }}
                                            >
                                                {isCreatingChat === sellerId ? (
                                                    <div className="flex items-center gap-3">
                                                        <Loader2 className="h-5 w-5 animate-spin" />
                                                        <span>PROCESSANDO...</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-3">
                                                        <MessageCircle className="h-6 w-6 fill-[#0A2540]" />
                                                        CONFIRMAR PEDIDO NO APP
                                                    </div>
                                                )}
                                            </Button>

                                            {/* Fallback discreto (Para não incentivar a saída do app) */}
                                            {group.sellerWhatsapp && (
                                                <div className="text-center">
                                                    <a
                                                        href={`https://wa.me/${group.sellerWhatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(messageText)}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[10px] font-black text-white/30 hover:text-white/60 uppercase tracking-widest transition-colors"
                                                    >
                                                        Problemas com o chat? Clique aqui
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}