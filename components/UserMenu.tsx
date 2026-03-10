'use client'

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, LogOut, Store, ShoppingBag, MessageSquare, Loader2, Star, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function UserMenu() {
    const [user, setUser] = useState<any>(null)
    const [role, setRole] = useState<string | null>(null)
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function getUser() {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            if (user) {
                // Fetch role from profiles
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role, avatar_url')
                    .eq('id', user.id)
                    .single()
                setRole(profile?.role)
                setAvatarUrl(profile?.avatar_url)
            }
        }
        getUser()
    }, [supabase])

    const handleSignOut = async () => {
        setIsLoggingOut(true)
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error('Error signing out:', error.message)
        }
        setUser(null)
        setRole(null)
        router.refresh()
        router.push('/')
        setIsLoggingOut(false)
    }

    if (!user) {
        return (
            <Button asChild size="sm" className="bg-black hover:bg-zinc-800 text-white font-bold tracking-wide rounded-full shadow-none transition-transform active:scale-95 px-6 h-9">
                <Link href="/auth/login">Entrar</Link>
            </Button>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-slate-200 hover:bg-slate-50 transition-all p-0">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={avatarUrl || user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} className="object-cover" />
                        <AvatarFallback className="bg-slate-100 text-black font-bold">
                            {user.user_metadata?.full_name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white/90 backdrop-blur-xl border-slate-200 shadow-xl rounded-2xl p-2" align="end" forceMount>
                <DropdownMenuLabel className="font-normal px-2 py-1.5">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-bold leading-none text-foreground">{user.user_metadata?.full_name || "Usuário"}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50 my-2" />

                <DropdownMenuItem asChild className="cursor-pointer rounded-xl focus:bg-slate-50 focus:text-black transition-all py-3">
                    <Link href="/perfil" className="flex items-center w-full">
                        <Star className="mr-3 h-4 w-4" />
                        <span className="font-bold text-sm tracking-tight text-black">MEU PERFIL UNIVERSITÁRIO</span>
                    </Link>
                </DropdownMenuItem>

                {role === 'admin' && (
                    <DropdownMenuItem asChild className="cursor-pointer rounded-xl focus:bg-slate-50 focus:text-black transition-all py-3">
                        <Link href="/admin" className="flex items-center w-full">
                            <ShieldCheck className="mr-3 h-4 w-4" />
                            <span className="font-bold text-sm tracking-tight text-black">PAINEL ADMINISTRATIVO</span>
                        </Link>
                    </DropdownMenuItem>
                )}

                {(role === 'seller' || role === 'admin') && (
                    <DropdownMenuItem asChild className="cursor-pointer rounded-xl focus:bg-slate-50 focus:text-black transition-all py-3">
                        <Link href="/vendedor/dashboard" className="flex items-center w-full">
                            <Store className="mr-3 h-4 w-4" />
                            <span className="font-bold text-sm tracking-tight text-black">PAINEL DO VENDEDOR</span>
                        </Link>
                    </DropdownMenuItem>
                )}

                {role !== 'seller' && role !== 'admin' && (
                    <DropdownMenuItem asChild className="cursor-pointer rounded-xl focus:bg-slate-50 focus:text-black transition-all py-3">
                        <Link href="/auth/signup" className="flex items-center w-full">
                            <Store className="mr-3 h-4 w-4" />
                            <span className="font-bold text-sm tracking-tight text-black">QUERO VENDER AGORA</span>
                        </Link>
                    </DropdownMenuItem>
                )}

                <DropdownMenuItem asChild className="cursor-pointer rounded-xl focus:bg-slate-50 focus:text-black transition-all py-3">
                    <Link href="/mensagens" className="flex items-center w-full">
                        <MessageSquare className="mr-3 h-4 w-4" />
                        <span className="font-bold text-sm tracking-tight text-black">MINHAS MENSAGENS</span>
                    </Link>
                </DropdownMenuItem>



                <DropdownMenuItem asChild className="cursor-pointer rounded-xl focus:bg-slate-50 focus:text-black transition-all py-3">
                    <Link href="/carrinho" className="flex items-center w-full">
                        <ShoppingBag className="mr-3 h-4 w-4" />
                        <span className="font-bold text-sm tracking-tight text-black">MEUS PEDIDOS / CARRINHO</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-slate-100 my-2" />
                <DropdownMenuItem
                    onClick={handleSignOut}
                    disabled={isLoggingOut}
                    className="text-red-500 focus:text-red-600 focus:bg-red-50 cursor-pointer rounded-xl transition-all font-black text-xs tracking-widest py-3"
                >
                    {isLoggingOut ? (
                        <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                    ) : (
                        <LogOut className="mr-3 h-4 w-4" />
                    )}
                    {isLoggingOut ? "SAINDO DO SISTEMA..." : "ENCERRAR SESSÃO"}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
