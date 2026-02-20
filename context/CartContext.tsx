'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner' // Assuming sonner is installed or will use window.alert/custom toast

export interface CartItem {
    id: string
    name: string
    price: number
    image: string
    sellerId: string
    sellerName: string
    sellerWhatsapp: string
    quantity: number
}

interface CartContextType {
    items: CartItem[]
    addToCart: (product: any) => void
    removeFromCart: (productId: string) => void
    clearCart: () => void
    total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [isLoaded, setIsLoaded] = useState(false)

    // Load from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem('ufba-cart')
        if (saved) {
            try {
                setItems(JSON.parse(saved))
            } catch (e) {
                console.error("Failed to parse cart", e)
            }
        }
        setIsLoaded(true)
    }, [])

    // Save to LocalStorage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('ufba-cart', JSON.stringify(items))
        }
    }, [items, isLoaded])

    const addToCart = (product: any) => {
        setItems(current => {
            const existing = current.find(item => item.id === product.id)
            if (existing) {
                toast.success("Quantidade atualizada!")
                return current.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                )
            }
            toast.success("Adicionado ao carrinho!")
            return [...current, { ...product, quantity: 1 }]
        })
    }

    const removeFromCart = (productId: string) => {
        setItems(current => current.filter(item => item.id !== productId))
    }

    const clearCart = () => setItems([])

    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, total }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => {
    const context = useContext(CartContext)
    if (!context) throw new Error('useCart must be used within CartProvider')
    return context
}
