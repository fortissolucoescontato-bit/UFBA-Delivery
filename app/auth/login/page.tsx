import Link from 'next/link'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { AppLogo } from '@/components/AppLogo'
import { SubmitButton } from '@/components/SubmitButton'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"

export default async function Login(props: {
    searchParams: Promise<{ message?: string, type?: string }>
}) {
    const searchParams = await props.searchParams;
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        return redirect('/')
    }

    const signIn = async (formData: FormData) => {
        'use server'

        const email = formData.get('email') as string
        const password = formData.get('password') as string

        // Prevent empty submissions hitting the auth handler
        if (!email || !password) {
            return redirect('/auth/login?type=error&message=Preencha todos os campos.')
        }

        const supabase = await createClient()

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            // Log explicitly to server console for security monitoring
            console.error('[AUTH_ERROR] Login failed:', error.message)
            return redirect('/auth/login?type=error&message=Email ou senha incorretos.')
        }

        return redirect('/')
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
            <Link href="/" className="mb-8">
                <AppLogo />
            </Link>

            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Entrar</CardTitle>
                    <CardDescription>
                        Digite seu email e senha para acessar sua conta.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={signIn} className="grid gap-4">
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
                        <div className="grid gap-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Senha</Label>
                                <Link
                                    href="/auth/forgot-password"
                                    className="ml-auto inline-block text-sm underline"
                                >
                                    Esqueceu a senha?
                                </Link>
                            </div>
                            <Input id="password" name="password" type="password" required />
                        </div>

                        {searchParams?.message && searchParams?.type === 'success' && (
                            <Alert className="mb-4 border-green-500 bg-green-50 text-green-900">
                                <CheckCircle2 className="h-4 w-4 stroke-green-600" />
                                <AlertTitle className="text-green-800 font-semibold">Sucesso!</AlertTitle>
                                <AlertDescription>
                                    {searchParams.message}
                                </AlertDescription>
                            </Alert>
                        )}

                        {searchParams?.message && searchParams?.type !== 'success' && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Erro</AlertTitle>
                                <AlertDescription>
                                    {searchParams.message}
                                </AlertDescription>
                            </Alert>
                        )}

                        <SubmitButton className="w-full">
                            Entrar
                        </SubmitButton>

                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 text-center text-sm text-muted-foreground">
                    <div className='w-full'>
                        Não tem uma conta?{" "}
                        <Link href="/auth/signup" className="underline">
                            Cadastre-se
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
