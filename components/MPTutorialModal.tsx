'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { HelpCircle, ChevronRight, ExternalLink, Zap } from "lucide-react"
import Image from "next/image"

export function MPTutorialModal() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-[#635BFF] font-black text-[10px] hover:bg-indigo-50 rounded-lg gap-1.5 px-3">
                    <HelpCircle className="h-3.5 w-3.5" />
                    COMO CONSEGUIR MINHAS CHAVES?
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-xl rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Zap className="h-24 w-24 fill-white" />
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black tracking-tighter text-white">Guia de Elite: Mercado Pago</DialogTitle>
                        <DialogDescription className="text-indigo-100 font-bold">
                            Siga os 3 passos abaixo para ativar seus recebimentos automáticos.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                    {/* Visual Step */}
                    <div className="relative aspect-video rounded-3xl overflow-hidden border-4 border-slate-50 shadow-inner">
                        <Image
                            src="/images/tutorial/mp_keys.png"
                            alt="Tutorial Mercado Pago"
                            fill
                            className="object-cover"
                        />
                    </div>

                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shrink-0">1</div>
                            <div className="space-y-1">
                                <p className="font-black text-[#0A2540]">Acesse o Painel Developer</p>
                                <p className="text-xs text-slate-500 font-bold leading-relaxed">
                                    Entre em <a href="https://www.mercadopago.com.br/developers/panel" target="_blank" className="text-indigo-600 underline">developers.mercadopago.com</a> com sua conta normal do Mercado Pago.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shrink-0">2</div>
                            <div className="space-y-1">
                                <p className="font-black text-[#0A2540]">Crie ou Selecione sua Aplicação</p>
                                <p className="text-xs text-slate-500 font-bold leading-relaxed">
                                    Clique em &quot;Suas integrações&quot; → &quot;Criar aplicação&quot;. Quando perguntar o tipo de checkout, selecione <b className="text-indigo-600">Checkout Pro</b>. É a opção mais fácil e a que funciona com esta plataforma.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black shrink-0">3</div>
                            <div className="space-y-1">
                                <p className="font-black text-[#0A2540]">Copie as Credenciais de PRODUÇÃO</p>
                                <p className="text-xs text-slate-500 font-bold leading-relaxed">
                                    No menu lateral, vá em "Credenciais de Produção". Copie a <b>Public Key</b> e o <b>Access Token</b> e cole no formulário atrás deste guia.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-3xl space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">⚠️ DICA DE SEGURANÇA</p>
                        <p className="text-xs text-slate-600 font-bold leading-relaxed">
                            Nunca compartilhe seu Access Token com estranhos. Nós usamos essas chaves apenas para gerar o link de pagamento direto para sua conta.
                        </p>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 flex justify-end bg-slate-50/50">
                    <Button className="rounded-xl bg-[#0A2540] text-white font-black px-8" asChild>
                        <DialogTrigger>ENTENDI, VAMOS LÁ!</DialogTrigger>
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
