import { ShoppingBag, Flame } from "lucide-react"
import { config } from "@/lib/config"

export function AppLogo({ className, hideSubtext = false }: { className?: string, hideSubtext?: boolean }) {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="relative flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[#635BFF] to-[#0A2540] rounded-xl shadow-primary/30 shadow-lg transform transition-all duration-300 hover:scale-110">
                <ShoppingBag className="w-5 h-5 text-white" />
                <div className="absolute top-0 right-0 w-2 h-2 bg-blue-400 rounded-full blur-[2px] animate-pulse"></div>
            </div>
            <div className="flex flex-col justify-center">
                <span className="font-extrabold text-xl tracking-tight leading-none text-foreground">
                    {config.siteName}
                </span>
                {!hideSubtext && (
                    <span className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] mt-1 opacity-80">
                        {config.siteSubtitle}
                    </span>
                )}
            </div>
        </div>
    )
}

