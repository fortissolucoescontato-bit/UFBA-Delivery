import { Wallet, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";

export function SellerPixAlert() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 to-amber-500 rounded-[2.5rem] p-6 text-white shadow-xl shadow-orange-200/50 animate-reveal">
      {/* Detalhe visual de fundo */}
      <div className="absolute top-[-20%] right-[-5%] w-32 h-32 bg-white/10 blur-3xl rounded-full" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md shrink-0">
            <AlertCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-black text-lg tracking-tight leading-tight">Vendas desabilitadas!</h3>
            <p className="text-sm text-white/90 font-bold">Você precisa cadastrar sua Chave PIX para os alunos comprarem.</p>
          </div>
        </div>

        {/* CORREÇÃO: Link alterado de /perfil para /vendedor/perfil */}
        <Link 
          href="/vendedor/perfil" 
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-white text-orange-600 px-6 py-3.5 rounded-2xl font-black text-sm hover:scale-[1.03] active:scale-95 transition-all shadow-lg whitespace-nowrap"
        >
          <Wallet className="h-4 w-4" />
          CADASTRAR PIX AGORA
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}