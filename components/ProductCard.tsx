'use client'

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { Plus, Zap } from "lucide-react"
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
    isBoosted?: boolean
    isNew?: boolean
}

export function ProductCard({
    id, name, price, image, vendorName, sellerId, sellerWhatsapp,
    variant = "grid", brandColor, isBoosted = false, isNew = false, ...rest
}: ProductCardProps & { seller_id?: string }) {
    const { addToCart } = useCart()
    const actualSellerId = sellerId || (rest as any).seller_id;
    const isGrid = variant === "grid"

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!actualSellerId || actualSellerId === "undefined") {
            console.error("Critical: sellerId missing", { id, name });
            return;
        }
        addToCart({
            id, name, price, image,
            sellerId: actualSellerId,
            sellerName: vendorName,
            sellerWhatsapp,
            quantity: 1
        })
    }

    if (isGrid) {
        return (
            <div className="group relative flex flex-col overflow-hidden bg-white border border-slate-100 hover-lift shadow-soft rounded-[2rem] md:rounded-[2.5rem] animate-reveal">

                {/* Badges de urgência */}
                {(isBoosted || isNew) && (
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                        {isBoosted && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-400 text-amber-900 text-[9px] font-black tracking-widest uppercase rounded-full shadow-sm">
                                <Zap className="w-2.5 h-2.5" />
                                Destaque
                            </span>
                        )}
                        {isNew && !isBoosted && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-primary text-white text-[9px] font-black tracking-widest uppercase rounded-full shadow-sm shadow-brand-primary/30">
                                Novo
                            </span>
                        )}
                    </div>
                )}

                {/* Imagem */}
                <Link href={`/produto/${id}`} className="relative bg-[#F9FBFF] block overflow-hidden w-full aspect-square border-b border-slate-50">
                    <Image
                        src={image}
                        alt={name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 256px"
                        className="object-contain p-6 transition-transform duration-700 group-hover:scale-110"
                    />
                </Link>

                {/* Conteúdo */}
                <div className="flex flex-col flex-1 p-5 gap-3 bg-white">
                    <div className="flex-1 space-y-1.5">
                        <Link href={`/loja/${actualSellerId}`} className="flex items-center gap-2 transition-colors group/seller">
                            <span className="relative flex h-2 w-2 shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                            <p className="text-[10px] font-black text-slate-400 tracking-[0.15em] uppercase truncate group-hover/seller:text-brand-primary transition-colors">
                                {vendorName}
                            </p>
                        </Link>

                        <Link href={`/produto/${id}`} className="block">
                            <h3 className="font-black text-sm md:text-base leading-tight text-brand-secondary line-clamp-2 transition-colors hover:text-brand-primary">
                                {name}
                            </h3>
                        </Link>
                    </div>

                    <div className="flex items-end justify-between mt-2">
                        <div className="flex flex-col">
                            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-[-2px]">PREÇO UNITÁRIO</p>
                            <p className="font-black text-brand-secondary text-2xl md:text-3xl tracking-tighter">
                                <span className="text-xs font-bold text-slate-400 mr-1 uppercase align-baseline">R$</span>
                                {price.toFixed(2)}
                            </p>
                        </div>
                        <Button
                            size="icon"
                            className="h-10 w-10 md:h-12 md:w-12 rounded-2xl shadow-lg shadow-brand-primary/20 text-white transition-all active:scale-95 bg-brand-primary hover:bg-brand-secondary shrink-0"
                            onClick={handleAdd}
                            aria-label={`Adicionar ${name} ao carrinho`}
                        >
                            <Plus className="h-5 w-5 md:h-6 md:w-6" />
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    // Layout "list" (horizontal)
    return (
        <div className="group relative flex flex-row overflow-hidden h-32 bg-white border border-slate-200 hover:shadow-xl transition-all duration-300 rounded-2xl md:rounded-3xl">
            <Link href={`/produto/${id}`} className="relative bg-[#FAFAFA] shrink-0 block overflow-hidden w-28 h-full border-r border-slate-100">
                <Image
                    src={image}
                    alt={name}
                    fill
                    sizes="112px"
                    className="object-contain p-2"
                />
                {isBoosted && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-400 text-amber-900 text-[8px] font-black rounded-full">
                        Destaque
                    </span>
                )}
            </Link>

            <div className="flex flex-col flex-1 py-3 px-4 justify-between min-w-0 bg-white">
                <div className="space-y-1">
                    <Link href={`/loja/${actualSellerId}`} className="flex items-center gap-1.5 transition-colors group/seller">
                        <span className="relative flex h-1.5 w-1.5 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                        </span>
                        <p className="text-[10px] font-bold text-slate-500 tracking-wider uppercase truncate group-hover/seller:text-brand-primary transition-colors">
                            {vendorName}
                        </p>
                    </Link>
                    <Link href={`/produto/${id}`} className="block">
                        <h3 className="font-extrabold text-sm leading-tight text-black line-clamp-2 transition-colors">
                            {name}
                        </h3>
                    </Link>
                </div>

                <div className="flex items-end justify-between">
                    <p className="font-black text-black text-xl tracking-tighter shrink-0">
                        <span className="text-[10px] font-semibold text-slate-400 mr-1 uppercase align-text-top">R$</span>
                        {price.toFixed(2)}
                    </p>
                    <Button
                        size="icon"
                        className="h-9 w-9 md:h-10 md:w-10 rounded-full shadow-md text-white transition-transform active:scale-90 bg-brand-primary hover:bg-brand-secondary shrink-0"
                        onClick={handleAdd}
                        aria-label={`Adicionar ${name} ao carrinho`}
                    >
                        <Plus className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
