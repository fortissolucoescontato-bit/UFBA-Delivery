import { config } from "@/lib/config"

export function Footer() {
    return (
        <footer className="border-t border-border/40 bg-background/80 backdrop-blur-md p-8 mt-12">
            <div className="container mx-auto text-center space-y-4">
                <div className="flex flex-col items-center">
                    <p className="text-lg font-extrabold tracking-tight text-secondary">{config.siteName}</p>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-bold opacity-70">{config.siteSubtitle}</p>
                </div>
                <p className="max-w-md mx-auto text-[11px] text-muted-foreground px-4 leading-relaxed opacity-70">
                    <strong>Aviso Legal:</strong> {config.siteName} é um marketplace independente e não possui vínculo oficial com a Universidade Federal da Bahia (UFBA).
                </p>
                <div className="w-12 h-[1px] bg-border/40 mx-auto"></div>
                <p className="text-[10px] text-muted-foreground/60">
                    &copy; 2026 {config.siteName} &middot; Pulse of Commerce
                </p>
            </div>
        </footer>
    )
}
