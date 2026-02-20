import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, ShoppingCart, MessageCircle, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AddToCartButton } from "./AddToCartButton"

export default async function ProductPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { data: product } = await supabase
        .from('products')
        .select('*, profiles(full_name, whatsapp, current_location)')
        .eq('id', (await params).id)
        .single()

    if (!product) return notFound()

    return (
        <div className="min-h-screen bg-background pb-20">
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md p-4 flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                </Button>
                <h1 className="font-bold text-lg line-clamp-1">{product.name}</h1>
            </header>

            <div className="relative w-full aspect-square bg-muted">
                <Image
                    src={product.image || product.image_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            <div className="p-6 space-y-6">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <h2 className="text-2xl font-bold">{product.name}</h2>
                        <span className="text-2xl font-black text-green-600">
                            R$ {Number(product.price).toFixed(2)}
                        </span>
                    </div>

                    <Link href={`/loja/${product.seller_id}`} className="inline-flex items-center gap-2 p-2 -ml-2 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="font-medium text-sm text-foreground">{product.profiles?.full_name}</span>
                        {product.profiles?.current_location && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold border border-orange-200">
                                <MapPin className="h-3 w-3" />
                                {product.profiles.current_location}
                            </span>
                        )}
                    </Link>
                </div>

                <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Como funciona?
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Ao adicionar ao carrinho e finalizar, você será redirecionado para o WhatsApp do vendedor para combinar a entrega e o pagamento.
                    </p>
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
                    <AddToCartButton product={{
                        id: product.id,
                        name: product.name,
                        price: Number(product.price),
                        image: product.image || product.image_url,
                        sellerId: product.seller_id,
                        sellerName: product.profiles?.full_name || "Vendedor",
                        sellerWhatsapp: product.profiles?.whatsapp || ""
                    }} />
                </div>
            </div>
        </div>
    )
}
