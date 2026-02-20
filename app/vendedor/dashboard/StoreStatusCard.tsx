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
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    Status da Loja
                </CardTitle>
                <Switch
                    id="online-mode"
                    checked={isOnline}
                    onCheckedChange={handleToggle}
                    disabled={loading}
                />
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <div className={`text-2xl font-bold ${isOnline ? 'text-green-600' : 'text-muted-foreground'}`}>
                            {isOnline ? 'TÔ ONLINE' : 'TÔ OFFLINE'}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {currentLocation || 'Local não definido'}
                        </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/vendedor/perfil">Editar Perfil</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
