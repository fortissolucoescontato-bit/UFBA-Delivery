'use client'

import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/CartContext"

interface AddToCartButtonProps {
    product: {
        id: string
        name: string
        price: number
        image: string
        sellerId: string
        sellerName: string
        sellerWhatsapp: string
    }
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
    const { addToCart } = useCart()

    return (
        <Button
            className="w-full h-12 text-lg font-bold gap-2"
            onClick={() => addToCart({ ...product, quantity: 1 })}
        >
            <ShoppingCart className="h-5 w-5" />
            Adicionar ao Carrinho
        </Button>
    )
}
