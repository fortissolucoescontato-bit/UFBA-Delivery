import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AppLogo } from "@/components/AppLogo"
import { MessageCircle, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { config, getAdminWhatsAppLink } from "@/lib/config"

export default function PendingApprovalPage() {
    const adminWhatsApp = getAdminWhatsAppLink("Olá, acabei de me cadastrar como vendedor e gostaria de solicitar minha ativação.")

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
            <Link href="/" className="mb-8">
                <AppLogo />
            </Link>

            <Card className="w-full max-w-md border-orange-200">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                        <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-orange-950">Aprovação Pendente</CardTitle>
                    <CardDescription>
                        Sua conta de vendedor foi criada, mas ainda precisa ser ativada manualmente pelo administrador.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg flex gap-3 text-orange-900 text-sm">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <p>
                            Para garantir a segurança da nossa comunidade, todos os novos vendedores passam por uma verificação rápida antes de publicar produtos.
                        </p>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                        <p className="font-semibold text-foreground">Como ativar minha conta?</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Envie uma mensagem para o administrador informando seu nome e email de cadastro.</li>
                            <li>A ativação costuma ocorrer em menos de 24h.</li>
                        </ul>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    <Button asChild className="w-full bg-green-600 hover:bg-green-700 h-12 text-base">
                        <a href={adminWhatsApp} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="mr-2 h-5 w-5" />
                            Falar com Administrador
                        </a>
                    </Button>
                    <Button asChild variant="ghost" className="w-full">
                        <Link href="/">Voltar para a Home</Link>
                    </Button>
                </CardFooter>
            </Card>

            <p className="mt-8 text-xs text-muted-foreground text-center max-w-xs">
                Administrador: {config.adminWhatsApp}<br />
                {config.siteName} - {config.siteSubtitle}
            </p>
        </div>
    )
}

