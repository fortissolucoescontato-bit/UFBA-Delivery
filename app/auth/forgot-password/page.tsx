import Link from 'next/link'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getBaseUrl } from '@/utils/url'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { AppLogo } from '@/components/AppLogo'
import { SubmitButton } from '@/components/SubmitButton'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"

export default async function ForgotPassword(props: {
    searchParams: Promise<{ message?: string, type?: string }>
}) {
    const searchParams = await props.searchParams;
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        return redirect('/')
    }

    const resetPassword = async (formData: FormData) => {
        'use server'

        const email = formData.get('email') as string
        const supabase = await createClient()
        const baseUrl = getBaseUrl()

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${baseUrl}/auth/callback?next=/auth/reset-password`,
        })

        if (error) {
            console.error(error)
            return redirect('/auth/forgot-password?type=error&message=Não foi possível enviar o email de recuperação.')
        }

        return redirect('/auth/forgot-password?type=success&message=Email de recuperação enviado! Verifique sua caixa de entrada.')
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
            <Link href="/" className="mb-8">
                <AppLogo />
            </Link>

            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Recuperar Senha</CardTitle>
                    <CardDescription>
                        Digite seu email para receber um link de recuperação.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {searchParams?.message && searchParams?.type === 'success' && (
                        <Alert className="mb-6 border-green-500 bg-green-50 text-green-900">
                            <CheckCircle2 className="h-4 w-4 stroke-green-600" />
                            <AlertTitle className="text-green-800 font-semibold">Sucesso!</AlertTitle>
                            <AlertDescription>
                                {searchParams.message}
                            </AlertDescription>
                        </Alert>
                    )}

                    {searchParams?.message && searchParams?.type !== 'success' && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Erro</AlertTitle>
                            <AlertDescription>
                                {searchParams.message}
                            </AlertDescription>
                        </Alert>
                    )}

                    <form action={resetPassword} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="nome@exemplo.com"
                                required
                            />
                        </div>

                        <SubmitButton className="w-full">
                            Enviar Link de Recuperação
                        </SubmitButton>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 text-center text-sm text-muted-foreground">
                    <div className='w-full'>
                        Lembrou a senha?{" "}
                        <Link href="/auth/login" className="underline">
                            Voltar para o login
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
