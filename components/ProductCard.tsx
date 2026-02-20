'use client'

import Image from "next/image"
import Link from "next/link"
import { Plus, MapPin, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/CartContext"

interface ProductCardProps {
    id: string
    name: string
    price: number
    image: string
    vendorName: string
    sellerId: string
    sellerWhatsapp: string
    sellerLocation?: string | null
    variant?: "grid" | "list"
    brandColor?: string
}

export function ProductCard({ id, name, price, image, vendorName, sellerId, sellerWhatsapp, sellerLocation, variant = "list", brandColor }: ProductCardProps) {
    const { addToCart } = useCart()

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating if clicking the add button inside a potential link wrapper
        addToCart({
            id,
            name,
            price,
            image,
            sellerId,
            sellerName: vendorName,
            sellerWhatsapp
        })
    }

    const isGrid = variant === "grid"

    return (
        <div
            className={`group relative flex overflow-hidden bg-card border-0 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 rounded-3xl ring-1 ring-border/40 ${isGrid ? 'flex-col h-full min-h-[250px]' : 'flex-row h-32'
                }`}
            style={{
                // @ts-ignore
                '--brand-color': brandColor || '#f97316'
            } as React.CSSProperties}
        >
            <Link
                href={`/produto/${id}`}
                className={`relative bg-muted/50 shrink-0 block overflow-hidden ${isGrid ? 'w-full aspect-square' : 'w-32 h-full'
                    }`}
            >
                <Image
                    src={image}
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            <div className={`flex flex-col flex-1 py-3 px-4 justify-between min-w-0 bg-gradient-to-l from-card to-card/95 ${isGrid ? 'p-4' : ''
                }`}>
                <div className="space-y-1.5">
                    <Link href={`/produto/${id}`} className="block">
                        <h3
                            className="font-bold text-base leading-tight text-card-foreground line-clamp-2 transition-colors group-hover:text-[var(--brand-color)]"
                        >
                            {name}
                        </h3>
                    </Link>

                    <Link href={`/loja/${sellerId}`} className="flex flex-col gap-0.5 p-1 -ml-1 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer">
                        <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5 line-clamp-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="truncate group-hover:text-[var(--brand-color)]">{vendorName}</span>
                        </p>

                        {sellerLocation && (
                            <p className="text-[10px] font-semibold text-secondary/80 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{sellerLocation}</span>
                            </p>
                        )}
                    </Link>
                </div>

                <div className="flex items-center justify-between mt-2">
                    <p className="font-extrabold text-foreground text-lg tracking-tight">
                        <span className="text-xs font-semibold text-muted-foreground mr-0.5">R$</span>
                        {price.toFixed(2)}
                    </p>
                    <Button
                        size="icon"
                        className="h-9 w-9 rounded-2xl shadow-md text-white transition-transform active:scale-95 shrink-0 bg-[var(--brand-color)] hover:filter hover:brightness-90"
                        onClick={handleAdd}
                    >
                        <Plus className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
