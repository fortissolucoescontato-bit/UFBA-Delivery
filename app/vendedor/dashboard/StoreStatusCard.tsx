'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MapPin } from "lucide-react"
import { toggleOnlineStatus } from "../actions"
import { toast } from "sonner"

interface StoreStatusCardProps {
    initialOnline: boolean
    currentLocation: string | null
}

export function StoreStatusCard({ initialOnline, currentLocation }: StoreStatusCardProps) {
    const [isOnline, setIsOnline] = useState(initialOnline)
    const [loading, setLoading] = useState(false)

    const handleToggle = async (checked: boolean) => {
        setLoading(true)
        setIsOnline(checked)
        try {
            await toggleOnlineStatus(checked)
            toast.success(checked ? "Loja Online!" : "Loja Offline")
        } catch {
            setIsOnline(!checked)
            toast.error("Erro ao atualizar status")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="bg-white/80 backdrop-blur-md border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-[#0A2540] opacity-40">
                    Controle de Operação
                </CardTitle>
                <Switch
                    id="online-mode"
                    checked={isOnline}
                    onCheckedChange={handleToggle}
                    disabled={loading}
                    className="data-[state=checked]:bg-green-500"
                />
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            {isOnline && (
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                            )}
                            <div className={`text-2xl font-black tracking-tight ${isOnline ? 'text-[#0A2540]' : 'text-slate-500'}`}>
                                {isOnline ? 'LOJA ATIVA' : 'LOJA PAUSADA'}
                            </div>
                        </div>
                        <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 text-primary opacity-50" />
                            {currentLocation || 'Defina sua localização no perfil'}
                        </p>
                    </div>
                    <Button variant="outline" size="sm" className="font-bold text-xs h-8 rounded-lg border-slate-200 hover:bg-slate-50" asChild>
                        <Link href="/vendedor/perfil">CONFIGURAÇÕES</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
