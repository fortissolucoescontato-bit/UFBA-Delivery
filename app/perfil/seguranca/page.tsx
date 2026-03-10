'use client'

import { createClient } from "@/utils/supabase/client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ShieldCheck, Mail, Lock, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function SecurityPage() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [userEmail, setUserEmail] = useState("")
    
    // Form fields
    const [newEmail, setNewEmail] = useState("")
    const [newPassword, setNewPassword] = useState("")

    const supabase = createClient()

    useEffect(() => {
        async function fetchUser() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user && user.email) {
                setUserEmail(user.email)
            }
        }
        fetchUser()
    }, [])

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newEmail) return

        setLoading(true)
        setMessage(null)

        const { error } = await supabase.auth.updateUser({ email: newEmail })

        if (error) {
            setMessage({ type: 'error', text: error.message })
        } else {
            setMessage({ 
                type: 'success', 
                text: 'Enviamos um link de confirmação para o seu novo e-mail e para o e-mail atual. Caso não clique nos dois (Segurança), a troca será cancelada automaticamente.'
            })
            setNewEmail("")
        }
        setLoading(false)
    }

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newPassword || newPassword.length < 6) {
            setMessage({ type: 'error', text: 'A senha deve possuir pelo menos 6 caracteres.' })
            return
        }

        setLoading(true)
        setMessage(null)

        const { error } = await supabase.auth.updateUser({ password: newPassword })

        if (error) {
            setMessage({ type: 'error', text: error.message })
        } else {
            setMessage({ type: 'success', text: 'Senha alterada com perfeição! Você continuará logado.' })
            setNewPassword("")
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-[#F6F9FC] p-4 pb-24 font-sans selection:bg-primary/10">
            <header className="flex items-center gap-4 mb-8 max-w-2xl mx-auto w-full pt-4">
                <Button variant="outline" size="icon" className="rounded-2xl bg-white shadow-sm border-slate-200/60 hover:bg-slate-50 transition-all" asChild>
                    <Link href="/perfil">
                        <ArrowLeft className="h-5 w-5 text-[#0A2540]" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-black text-[#0A2540] tracking-tighter">Segurança</h1>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic tracking-[0.2em] flex items-center gap-1.5 mt-0.5">
                        <ShieldCheck className="h-3 w-3 text-emerald-500" />
                        ZERO TRUST ARCHITECTURE
                    </p>
                </div>
            </header>

            <div className="max-w-2xl mx-auto space-y-6">
                
                {message && (
                    <div className={`p-4 rounded-2xl flex items-center gap-3 font-bold border-2 animate-in-up ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                        {message.type === 'success' ? <CheckCircle2 className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                        <p className="text-sm">{message.text}</p>
                    </div>
                )}

                {/* Email Section */}
                <Card className="border-none shadow-xl shadow-slate-200/60 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="bg-white pb-4">
                        <CardTitle className="flex items-center gap-3 text-xl font-black text-[#0A2540]">
                            <Mail className="h-6 w-6 text-[#635BFF]" /> E-mail de Acesso
                        </CardTitle>
                        <CardDescription className="text-slate-500 font-bold">
                            Atualize o seu endereço eletrônico vinculado. E-mail atual: <span className="text-[#0A2540]">{userEmail || 'Carregando...'}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="bg-white">
                        <form onSubmit={handleUpdateEmail} className="flex gap-4">
                            <Input 
                                type="email" 
                                placeholder="Digite o novo e-mail..." 
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                className="h-14 rounded-2xl bg-slate-50 border-slate-200 font-bold focus-visible:ring-[#635BFF]"
                                required
                            />
                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="h-14 rounded-2xl px-8 bg-[#0A2540] text-white font-black hover:scale-105 transition-transform"
                            >
                                Alterar
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Password Section */}
                <Card className="border-none shadow-xl shadow-slate-200/60 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="bg-white pb-4">
                        <CardTitle className="flex items-center gap-3 text-xl font-black text-[#0A2540]">
                            <Lock className="h-6 w-6 text-[#635BFF]" /> Trocar Senha
                        </CardTitle>
                        <CardDescription className="text-slate-500 font-bold">
                            Como você está ativamente logado, a troca será executada imediata e seguramente.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="bg-white">
                        <form onSubmit={handleUpdatePassword} className="flex gap-4 border-t border-slate-100 pt-4">
                            <Input 
                                type="password" 
                                placeholder="Digite a nova senha forte..." 
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                minLength={6}
                                className="h-14 rounded-2xl bg-slate-50 border-slate-200 font-bold focus-visible:ring-[#635BFF]"
                                required
                            />
                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="h-14 rounded-2xl px-8 bg-[#0A2540] text-white font-black hover:scale-105 transition-transform"
                            >
                                Salvar
                            </Button>
                        </form>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
