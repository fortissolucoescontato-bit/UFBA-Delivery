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
import { User, LogOut, Store, ShoppingBag, MessageSquare, Shield } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function UserMenu() {
    const [user, setUser] = useState<any>(null)
    const [role, setRole] = useState<string | null>(null)
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
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
        await supabase.auth.signOut()
        setUser(null)
        setRole(null)
        router.refresh()
        router.push('/')
    }

    if (!user) {
        return (
            <Button asChild size="sm" className="bg-gradient-to-r from-primary to-orange-600 hover:from-orange-600 hover:to-primary text-white font-bold tracking-wide rounded-full shadow-md hover:shadow-lg transition-all px-6">
                <Link href="/auth/login">Entrar</Link>
            </Button>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={avatarUrl || user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {user.user_metadata?.full_name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-background/80 backdrop-blur-2xl border-border/40 shadow-2xl rounded-2xl p-2" align="end" forceMount>
                <DropdownMenuLabel className="font-normal px-2 py-1.5">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-bold leading-none text-foreground">{user.user_metadata?.full_name || "Usuário"}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50 my-2" />

                {role === 'admin' && (
                    <DropdownMenuItem asChild className="cursor-pointer rounded-xl focus:bg-primary/10 hover:text-primary transition-colors">
                        <Link href="/admin/vendedores">
                            <Shield className="mr-2 h-4 w-4" />
                            <span className="font-medium">Painel Admin</span>
                        </Link>
                    </DropdownMenuItem>
                )}

                {role === 'seller' && (
                    <DropdownMenuItem asChild className="cursor-pointer rounded-xl focus:bg-primary/10 hover:text-primary transition-colors">
                        <Link href="/vendedor/dashboard">
                            <Store className="mr-2 h-4 w-4" />
                            <span className="font-medium">Painel do Vendedor</span>
                        </Link>
                    </DropdownMenuItem>
                )}

                {role !== 'seller' && (
                    <DropdownMenuItem asChild className="cursor-pointer rounded-xl focus:bg-primary/10 hover:text-primary transition-colors">
                        <Link href="/auth/signup">
                            <Store className="mr-2 h-4 w-4" />
                            <span className="font-medium">Quero Vender</span>
                        </Link>
                    </DropdownMenuItem>
                )}

                <DropdownMenuItem asChild className="cursor-pointer rounded-xl focus:bg-primary/10 hover:text-primary transition-colors">
                    <Link href="/mensagens">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span className="font-medium">Mensagens</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild className="cursor-pointer rounded-xl focus:bg-primary/10 hover:text-primary transition-colors">
                    <Link href="/carrinho">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        <span className="font-medium">Meus Pedidos</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-border/50 my-2" />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer rounded-xl transition-colors">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="font-medium">Sair</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
