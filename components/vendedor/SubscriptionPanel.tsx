'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Crown, Star, CheckCircle2, TrendingUp, Sparkles } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface SubscriptionPanelProps {
    currentTier: string;
    isBoosted?: boolean;
}

export function SubscriptionPanel({ currentTier = 'basic', isBoosted = false }: SubscriptionPanelProps) {
    const [loading, setLoading] = useState(false)

    const handleUpgrade = async () => {
        setLoading(true)
        try {
            const { createElitePlanPreference } = await import('@/app/vendedor/actions')
            const result = await createElitePlanPreference()

            if (result?.url) {
                window.location.href = result.url
            } else {
                toast.error("Erro ao gerar pagamento", {
                    description: result?.error || "Tente novamente em instantes."
                })
            }
        } catch (error) {
            console.error("Upgrade error:", error)
            toast.error("Falha na conexão com o Mercado Pago")
        } finally {
            setLoading(false)
        }
    }

    const handleBoost = async () => {
        setLoading(true)
        try {
            const { createBoostPreference } = await import('@/app/vendedor/actions')
            // No MVP, vamos impulsionar o produto de teste ou o primeiro da lista
            // TODO: Adicionar seletor de produto para o Boost
            const result = await createBoostPreference('PROD-SPOTLIGHT-GENERIC')

            if (result?.url) {
                window.location.href = result.url
            } else {
                toast.error("Erro ao gerar boost", {
                    description: result?.error || "Tente novamente em instantes."
                })
            }
        } catch (error) {
            console.error("Boost error:", error)
            toast.error("Falha na conexão com o Mercado Pago")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Elite Plan Card */}
            <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-indigo-200/40 overflow-hidden bg-white/80 backdrop-blur-md relative group">
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-10 transition-opacity">
                    <Crown className="h-24 w-24 text-indigo-600" />
                </div>

                <CardHeader className="p-8 pb-4">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-2xl font-black text-[#0A2540] tracking-tighter">Plano ELITE</CardTitle>
                                {currentTier === 'elite' && (
                                    <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white border-none rounded-lg font-black text-[10px] animate-pulse">ATIVO</Badge>
                                )}
                            </div>
                            <CardDescription className="text-xs font-bold text-slate-400">EXPANDA SEU IMPÉRIO UNIVERSITÁRIO</CardDescription>
                        </div>
                        <div className="text-right">
                            <p className="text-2xl font-black text-indigo-600 tracking-tighter">R$ 10,43</p>
                            <p className="text-[10px] font-black text-slate-300 uppercase">POR MÊS (TAXAS INC.)</p>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-8 pt-0 space-y-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm font-bold text-[#0A2540]/80">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span>Selo Elite Glow no Perfil</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-[#0A2540]/80">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span>Prioridade Máxima nas Buscas</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-[#0A2540]/80">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <span>Analytics Detalhado (Views/Cliques)</span>
                        </div>
                    </div>

                    <Button
                        onClick={handleUpgrade}
                        disabled={loading || currentTier === 'elite'}
                        className={`w-full h-14 rounded-2xl font-black tracking-widest text-sm shadow-xl transition-all ${currentTier === 'elite'
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-[1.02]'
                            }`}
                    >
                        {currentTier === 'elite' ? 'VOCÊ JÁ É ELITE' : 'DAR O SALTO PARA ELITE'}
                    </Button>
                </CardContent>
            </Card>

            {/* Quick Boost Card */}
            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-gradient-to-br from-[#0A2540] to-[#1e3a8a] text-white p-8 relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Zap className="h-20 w-20 text-yellow-400 fill-yellow-400" />
                </div>

                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div>
                            <h3 className="font-black text-lg tracking-tight leading-none">Boost Spotlight</h3>
                            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mt-1">EXPLOSÃO DE VISIBILIDADE</p>
                        </div>
                    </div>

                    <p className="text-xs font-bold text-indigo-100/70 leading-relaxed">
                        Coloque qualquer produto seu no topo da página inicial por 24h. Ideal para queimas de estoque ou novos lançamentos.
                    </p>

                    <div className="pt-2 flex items-center justify-between gap-4">
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black">R$ 2,10</span>
                            <span className="text-[9px] font-black opacity-50 uppercase">/ ITEM (TAXAS INC.)</span>
                        </div>
                        <Button
                            onClick={handleBoost}
                            disabled={loading}
                            className="bg-yellow-400 hover:bg-yellow-500 text-[#0A2540] font-black rounded-xl h-10 px-6 shadow-lg shadow-yellow-400/20"
                        >
                            ATIVAR AGORA
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}
