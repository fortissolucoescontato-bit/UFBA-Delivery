import { UtensilsCrossed, Flame } from "lucide-react"

export function AppLogo({ className, hideSubtext = false }: { className?: string, hideSubtext?: boolean }) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-orange-600 rounded-2xl shadow-primary/20 shadow-lg transform -rotate-3 transition-transform hover:rotate-6">
                <UtensilsCrossed className="w-5 h-5 text-white" />
                <Flame className="w-3.5 h-3.5 text-white absolute -top-1 -right-1" />
            </div>
            <div className="flex flex-col justify-center">
                <span className="font-extrabold text-xl tracking-tight leading-none text-foreground">
                    UFBA Delivery
                </span>
                {!hideSubtext && (
                    <span className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] mt-1">
                        Projeto Independente
                    </span>
                )}
            </div>
        </div>
    )
}
