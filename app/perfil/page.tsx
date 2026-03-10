'use client'

import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Award, ShieldCheck, Star, Zap, User, Clock, CheckCircle2, ShoppingBag, BadgeCheck, Lock } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

// Simple Custom Progress if shadcn one is missing
const Progress = ({ value, className }: { value: number, className?: string }) => (
    <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${className}`}>
        <div
            className="h-full bg-[#635BFF] transition-all duration-1000 ease-out"
            style={{ width: `${value}%` }}
        />
    </div>
)

export default function ProfilePage() {
    const [profile, setProfile] = useState<any>(null)
    const [stats, setStats] = useState({
        trustScore: 50,
        level: 1,
        badges: [] as any[],
        daysInApp: 0,
        totalOrders: 0,
        totalReviews: 0
    })
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function loadProfileData() {
            setLoading(true)
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                setLoading(false)
                return
            }

            // 1. Fetch Profile com Dados de Reputação Imutáveis do Banco (ECLIPSE V10)
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*, created_at')
                .eq('id', user.id)
                .single()

            if (profileData) {
                setProfile(profileData)

                // Cálculo de permanência
                const createdDate = new Date(profileData.created_at || user.created_at)
                const now = new Date()
                const diffDays = Math.ceil(Math.abs(now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))

                // Mapeamento de Ícones para Badges que vêm do JSON do Banco
                const iconMap: Record<string, any> = {
                    'Pioneiro': { icon: <Zap className="h-5 w-5" />, color: 'bg-yellow-50 text-yellow-600 border-yellow-100', desc: 'Membro Fundador' },
                    'Vendedor Pro': { icon: <ShieldCheck className="h-5 w-5" />, color: 'bg-blue-50 text-blue-600 border-blue-100', desc: 'Identidade Verificada' },
                    'Excelência': { icon: <Star className="h-5 w-5" />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100', desc: 'Padrão de Qualidade V10' }
                }

                // Converter JSON do banco para objetos com Ícones
                const mappedBadges = (profileData.badges || []).map((b: any) => ({
                    ...b,
                    ...(iconMap[b.name] || { icon: <Award className="h-5 w-5" />, color: 'bg-slate-50 text-slate-600 border-slate-100', desc: b.type || 'Conquista Universitária' })
                }))

                setStats({
                    trustScore: profileData.trust_score || 50,
                    level: profileData.level || 1,
                    badges: mappedBadges,
                    daysInApp: diffDays,
                    totalOrders: profileData.total_sales_count || 0,
                    totalReviews: profileData.total_reviews_count || 0
                })
            }
            setLoading(false)
        }
        loadProfileData()
    }, [])

    if (loading) return (
        <div className="min-h-screen bg-[#F6F9FC] flex items-center justify-center">
            <div className="animate-pulse bg-white p-12 rounded-[3.5rem] shadow-2xl">
                <div className="w-16 h-16 bg-slate-100 rounded-[2rem] mx-auto animate-bounce" />
            </div>
        </div>
    )

    if (!profile) return (
        <div className="min-h-screen bg-[#F6F9FC] p-8 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-white rounded-[2.5rem] flex items-center justify-center shadow-xl mb-6">
                <ShieldCheck className="h-10 w-10 text-slate-200" />
            </div>
            <h1 className="text-3xl font-black text-[#0A2540] tracking-tighter">Sessão Expirada</h1>
            <p className="text-slate-400 font-bold mt-2 mb-8 max-w-xs">AUTENTIQUE-SE PARA ACESSAR SUA REPUTAÇÃO UNIVERSITÁRIA.</p>
            <Button asChild className="h-14 rounded-2xl px-12 bg-[#0A2540] text-white font-black shadow-xl shadow-slate-200 hover:scale-105 transition-all">
                <Link href="/auth/login">ACESSO SEGURO</Link>
            </Button>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#F6F9FC] p-4 pb-24 font-sans selection:bg-primary/10">
            <header className="flex items-center gap-4 mb-8 max-w-2xl mx-auto w-full pt-4">
                <Button variant="outline" size="icon" className="rounded-2xl bg-white shadow-sm border-slate-200/60 hover:bg-slate-50 transition-all" asChild>
                    <Link href="/">
                        <ArrowLeft className="h-5 w-5 text-[#0A2540]" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-black text-[#0A2540] tracking-tighter">Meu Perfil</h1>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic tracking-[0.2em] flex items-center gap-1.5 mt-0.5">
                        <ShieldCheck className="h-3 w-3 text-emerald-500" />
                        AUTENTICADO VIA ECLIPSE V10
                    </p>
                </div>
            </header>

            <div className="max-w-2xl mx-auto space-y-6">
                {/* Profile Hero */}
                <Card className="border-none shadow-2xl shadow-slate-200/60 rounded-[3rem] overflow-hidden animate-in-up">
                    <CardHeader className="bg-[#0A2540] text-white p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-[100px] pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#635BFF]/10 rounded-full -ml-24 -mb-24 blur-[80px] pointer-events-none" />

                        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 text-center md:text-left">
                            <div className="relative">
                                <div className="absolute inset-0 bg-[#635BFF]/40 blur-[40px] rounded-full scale-125" />
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} className="relative h-28 w-28 rounded-[2.5rem] border-4 border-white/10 object-cover shadow-2xl transition-transform hover:rotate-3" />
                                ) : (
                                    <div className="relative h-28 w-28 rounded-[2.5rem] border-4 border-white/10 bg-white/5 flex items-center justify-center shadow-2xl">
                                        <User className="h-12 w-12 text-white/30" />
                                    </div>
                                )}
                                <div className="absolute -bottom-2 -right-2 bg-[#635BFF] text-white p-2 rounded-2xl border-4 border-[#0A2540] shadow-xl">
                                    <BadgeCheck className="h-5 w-5" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-4xl font-black tracking-tighter">{profile.full_name}</h2>
                                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-3">
                                    <span className="bg-white/10 text-white px-4 py-1.5 rounded-2xl text-[11px] font-black border border-white/10 uppercase tracking-tighter">
                                        NÍVEL {stats.level}
                                    </span>
                                    <span className="bg-emerald-500/20 text-emerald-400 px-4 py-1.5 rounded-2xl text-[11px] font-black border border-emerald-500/20 uppercase tracking-tighter">
                                        {profile.role === 'seller' ? 'EMPREENDEDOR' : 'EXPLORADOR'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="bg-white p-10 space-y-10">
                        {/* Trust Score */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end px-1">
                                <div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">REPUTAÇÃO ATUAL</p>
                                    <p className="text-5xl font-black text-[#0A2540] tracking-tighter">{stats.trustScore}<span className="text-xl text-slate-500 ml-1">%</span></p>
                                </div>
                                <div className="text-right pb-1">
                                    <p className="text-xs font-black text-[#635BFF] uppercase tracking-widest flex items-center justify-end gap-2 mb-1">
                                        CONFIANÇA VERIFICADA
                                        <ShieldCheck className="h-4 w-4" />
                                    </p>
                                    <p className="text-[11px] font-bold text-slate-400 max-w-[140px] leading-tight">Cálculo dinâmico baseado em {stats.totalOrders} transações.</p>
                                </div>
                            </div>
                            <Progress value={stats.trustScore} className="h-4 rounded-full bg-slate-100" />
                        </div>

                        {/* Badges Section */}
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                                <Award className="h-5 w-5 text-[#635BFF]" />
                                CONQUISTAS DESBLOQUEADAS
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {stats.badges.length > 0 ? stats.badges.map((badge, idx) => (
                                    <div key={idx} className={`flex items-center gap-4 p-4 rounded-[2rem] border ${badge.color} transition-all hover:scale-105 hover:shadow-lg shadow-sm bg-white`}>
                                        <div className="p-3 bg-white rounded-[1.2rem] shadow-inner-sm text-lg">
                                            {badge.icon}
                                        </div>
                                        <div>
                                            <p className="font-black text-xs leading-none text-[#0A2540] mb-1">{badge.name}</p>
                                            <p className="text-[11px] font-bold opacity-80 uppercase tracking-tighter">{badge.desc}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-3 py-8 text-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Nenhuma conquista ainda. Comece a explorar!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 group hover:bg-[#635BFF]/5 transition-all duration-500">
                                <Clock className="h-8 w-8 text-[#635BFF] mb-3 group-hover:scale-110 transition-transform" />
                                <p className="text-4xl font-black text-[#0A2540] tracking-tighter">{stats.daysInApp}</p>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mt-2">DIAS NA REDE</p>
                            </div>
                            <div className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100 group hover:bg-[#635BFF]/5 transition-all duration-500">
                                <ShoppingBag className="h-8 w-8 text-[#635BFF] mb-3 group-hover:scale-110 transition-transform" />
                                <p className="text-4xl font-black text-[#0A2540] tracking-tighter">{stats.totalOrders}</p>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mt-2">ATIVIDADE REAL</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in-up" style={{ animationDelay: '200ms' }}>
                    <Button variant="outline" className="h-20 rounded-[2rem] border-slate-200 border-dashed text-slate-400 font-black tracking-[0.2em] uppercase text-xs hover:bg-slate-50 hover:text-[#0A2540] transition-all group" asChild>
                        <Link href="/vendedor/perfil">
                            DADOS DO PERFIL
                            <ArrowLeft className="ml-2 h-4 w-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                    <Button variant="outline" className="h-20 rounded-[2rem] border-slate-200 border-dashed text-slate-400 font-black tracking-[0.2em] uppercase text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all group" asChild>
                        <Link href="/perfil/seguranca">
                            SEGURANÇA (SENHA)
                            <Lock className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
