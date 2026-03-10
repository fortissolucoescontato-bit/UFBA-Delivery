import { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface StatsCardProps {
    title: string
    value: string | number
    icon: ReactNode
    description?: string
    trend?: {
        value: string
        isPositive: boolean
    }
}

export function StatsCard({ title, value, icon, description, trend }: StatsCardProps) {
    return (
        <Card className="bg-white/80 backdrop-blur-md border-none shadow-sm overflow-hidden relative group transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                {icon}
            </div>
            <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/5 rounded-xl text-primary">
                        {icon}
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-[#0A2540] opacity-50">{title}</p>
                </div>
                <div className="space-y-1">
                    <h3 className="text-2xl font-black text-[#0A2540] tracking-tight">{value}</h3>
                    {trend && (
                        <p className={`text-xs font-bold flex items-center gap-1 ${trend.isPositive ? 'text-green-600' : 'text-red-500'}`}>
                            {trend.isPositive ? '↑' : '↓'} {trend.value} <span className="text-slate-400 font-medium">vs mês anterior</span>
                        </p>
                    )}
                    {description && !trend && (
                        <p className="text-xs text-slate-400 font-medium">{description}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
