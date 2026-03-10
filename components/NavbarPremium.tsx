'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppLogo } from '@/components/AppLogo'
import { UserMenu } from '@/components/UserMenu'
import { ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'
// CORREÇÃO: Importando do local correto (Context em vez de Hooks)
import { useCart } from '@/context/CartContext'

export function NavbarPremium() {
    const [scrolled, setScrolled] = useState(false)
    const [mounted, setMounted] = useState(false)

    // Pegamos os itens do seu Contexto
    const { items } = useCart()
    const itemCount = items?.length || 0

    useEffect(() => {
        // Marcamos como montado para o React saber que já pode mostrar dados do localStorage
        setMounted(true)
        
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-3 md:px-6 md:pt-4 pointer-events-none transition-all duration-500">
            <div
                className={cn(
                    "w-full max-w-5xl pointer-events-auto transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    "flex items-center justify-between px-5 py-3 rounded-2xl",
                    scrolled
                        /* Scrollado: cápsula de vidro flutuante */
                        ? "glass-premium shadow-2xl scale-[1.01]"
                        /* Topo: fundo sólido sutil */
                        : "bg-white/80 backdrop-blur-md shadow-sm border border-slate-100"
                )}
            >
                {/* LOGO + NAV */}
                <div className="flex items-center gap-8">
                    <AppLogo />

                    <nav className="hidden md:flex items-center gap-6">
                        <Link
                            href="/"
                            className={cn(
                                "text-xs font-black tracking-widest uppercase transition-all duration-300",
                                "text-slate-500 hover:text-brand-primary"
                            )}
                        >
                            INÍCIO
                        </Link>
                        <Link
                            href="/explorar"
                            className={cn(
                                "text-xs font-black tracking-widest uppercase transition-all duration-300",
                                "text-slate-500 hover:text-brand-primary"
                            )}
                        >
                            EXPLORAR
                        </Link>
                    </nav>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-3 md:gap-4">
                    <UserMenu />

                    <Link
                        href="/carrinho"
                        className={cn(
                            "p-2.5 rounded-full transition-all duration-300 active:scale-95 relative",
                            "bg-slate-100 hover:bg-brand-primary hover:text-white text-slate-600",
                            // Se tiver itens, o ícone ganha um destaque sutil
                            mounted && itemCount > 0 && "text-brand-primary bg-brand-primary/10"
                        )}
                    >
                        <ShoppingCart className="h-5 w-5" />
                        
                        {/* Só mostramos a bolinha se o componente já estiver montado no cliente 
                          e se houver itens no carrinho 
                        */}
                        {mounted && itemCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full border-2 border-white flex items-center justify-center animate-in zoom-in duration-300">
                                {itemCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
        </header>
    )
}