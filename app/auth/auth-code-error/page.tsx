import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { AppLogo } from '@/components/AppLogo'

export default function AuthCodeError() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
            <Link href="/" className="mb-8">
                <AppLogo />
            </Link>

            <Card className="w-full max-w-md border-destructive/20">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-destructive/10 rounded-full">
                            <AlertCircle className="h-8 w-8 text-destructive" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-destructive">Erro de Autenticação</CardTitle>
                    <CardDescription>
                        Não foi possível validar seu código de acesso ou sessão.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                    <p>Isso geralmente acontece quando o link de confirmação expirou ou já foi utilizado.</p>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                    <Button className="w-full" asChild>
                        <Link href="/auth/login">Voltar para o Login</Link>
                    </Button>
                    <Button variant="ghost" className="w-full" asChild>
                        <Link href="/">Ir para o Início</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
