'use client'

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, MessageCircle, Trash2, Store, Lock, Zap, Loader2 } from "lucide-react"
import { UserMenu } from "@/components/UserMenu"
import { useCart } from "@/context/CartContext"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { initiateChatCheckout } from "./actions"
import { useState } from "react"
import { toast } from "sonner"

import { config } from "@/lib/config"

export default function CartPage() {
    const { items, removeFromCart } = useCart()
    const [isCreatingChat, setIsCreatingChat] = useState<string | null>(null)

    // Group items by seller
    const groupedItems = items.reduce((acc, item) => {
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
        <div className="min-h-screen bg-background p-4 flex flex-col pb-20">
            <header className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                </Button>
                <h1 className="text-xl font-bold">Seu Pedido</h1>
                <div className="ml-auto">
                    <UserMenu />
                </div>
            </header>

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground">
                    <Store className="h-16 w-16 mb-4 opacity-20" />
                    <p className="text-lg font-medium">Seu carrinho está vazio</p>
                    <Button variant="link" asChild>
                        <Link href="/">Voltar para o Cardápio</Link>
                    </Button>
                </div>
            ) : (
                <div className="flex-1 space-y-8">
                    {Object.entries(groupedItems).map(([sellerId, group]) => {
                        const whatsappMessage = encodeURIComponent(
                            `Olá ${group.sellerName}! Vi no App do ${config.siteName}.\nQuero:\n` +
                            group.items.map(i => `- ${i.quantity}x ${i.name}`).join('\n') +
                            `\n\nTotal: R$ ${group.subtotal.toFixed(2)}\n\nEntrega a combinar?`
                        );


                        return (
                            <Card key={sellerId} className="border-l-4 border-l-primary">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2">
                                        <Store className="h-4 w-4 text-primary" />
                                        <CardTitle className="text-lg">{group.sellerName}</CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {group.items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-start py-2 border-b last:border-0 border-border/50">
                                            <div className="flex gap-3">
                                                <div className="relative h-12 w-12 rounded bg-muted overflow-hidden shrink-0">
                                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">{item.quantity}x {item.name}</p>
                                                    <p className="text-xs text-muted-foreground">R$ {item.price.toFixed(2)} un</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="font-semibold text-sm">R$ {(item.price * item.quantity).toFixed(2)}</span>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                                    onClick={() => removeFromCart(item.id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="pt-2">
                                        <div className="flex justify-between text-lg font-bold mb-4">
                                            <span>Total do Pedido</span>
                                            <span>R$ {group.subtotal.toFixed(2)}</span>
                                        </div>
                                        {/* Hybrid Checkout Options */}
                                        <div className="space-y-4">
                                            {/* Primary Option: Secure App Chat */}
                                            <div className="p-4 rounded-xl border bg-primary/5 space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="bg-primary/20 p-2 rounded-full">
                                                        <Lock className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-sm">Chat Seguro no App</h4>
                                                        <p className="text-xs text-muted-foreground">Fale com o vendedor sem expor seu contato e acesse o código PIX centralizado.</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    className="w-full gap-2 font-semibold"
                                                    disabled={isCreatingChat === sellerId}
                                                    onClick={async () => {
                                                        try {
                                                            setIsCreatingChat(sellerId)
                                                            await initiateChatCheckout(sellerId, whatsappMessage)
                                                        } catch (error) {
                                                            console.error("Chat error", error)
                                                            toast.error("Conta Necessária", {
                                                                description: "Para usar o Chat Seguro você precisa fazer Login primeiro."
                                                            })
                                                            setIsCreatingChat(null)
                                                        }
                                                    }}
                                                >
                                                    {isCreatingChat === sellerId ? (
                                                        <>
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                            Iniciando Pedido...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <MessageCircle className="h-4 w-4" />
                                                            Finalizar Pedido pelo Chat
                                                        </>
                                                    )}
                                                </Button>
                                            </div>

                                            {/* Secondary Option: Express WhatsApp */}
                                            <div className="p-4 rounded-xl border bg-muted/30 space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="bg-green-100 p-2 rounded-full">
                                                        <Zap className="h-4 w-4 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-sm">Pedido Expresso</h4>
                                                        <p className="text-xs text-muted-foreground">Não tem conta? Envie o pedido de forma anônima direto para o WhatsApp do vendedor.</p>
                                                    </div>
                                                </div>

                                                {group.sellerWhatsapp ? (
                                                    <Button variant="outline" className="w-full gap-2 border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800 font-semibold" asChild>
                                                        <a
                                                            href={`https://wa.me/${group.sellerWhatsapp.replace(/\D/g, '')}?text=${whatsappMessage}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <MessageCircle className="h-4 w-4" />
                                                            Pedir pelo WhatsApp
                                                        </a>
                                                    </Button>
                                                ) : (
                                                    <Button disabled variant="outline" className="w-full gap-2">
                                                        <MessageCircle className="h-4 w-4" />
                                                        Vendedor sem WhatsApp
                                                    </Button>
                                                )}
                                            </div>
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
