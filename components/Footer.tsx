export function Footer() {
    return (
        <footer className="border-t bg-muted/50 p-6 mt-10">
            <div className="container mx-auto text-center space-y-2">
                <p className="text-sm font-semibold text-secondary">UFBA Delivery</p>
                <p className="text-[10px] text-muted-foreground px-4 leading-relaxed">
                    <strong>Aviso Legal:</strong> Este é um projeto independente desenvolvido por estudantes e não possui vínculo oficial com a Universidade Federal da Bahia (UFBA).
                </p>
                <p className="text-[10px] text-muted-foreground opacity-50 pt-2">
                    &copy; 2025 UFBA Delivery
                </p>
            </div>
        </footer>
    )
}
