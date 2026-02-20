import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { AppLogo } from '@/components/AppLogo'
import { SubmitButton } from '@/components/SubmitButton'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default async function ResetPassword(props: {
    searchParams: Promise<{ message?: string, type?: string }>
}) {
    const searchParams = await props.searchParams;

    const updatePassword = async (formData: FormData) => {
        'use server'

        const password = formData.get('password') as string
        const confirmPassword = formData.get('confirmPassword') as string

        if (password !== confirmPassword) {
            return redirect('/auth/reset-password?type=error&message=As senhas não coincidem.')
        }

        const supabase = await createClient()

        const { error } = await supabase.auth.updateUser({
            password: password,
        })

        if (error) {
            console.error(error)
            return redirect('/auth/reset-password?type=error&message=Não foi possível atualizar a senha.')
        }

        return redirect('/auth/login?type=success&message=Senha atualizada com sucesso! Faça login com sua nova senha.')
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
            <Link href="/" className="mb-8">
                <AppLogo />
            </Link>

            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Redefinir Senha</CardTitle>
                    <CardDescription>
                        Digite sua nova senha abaixo.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {searchParams?.message && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Erro</AlertTitle>
                            <AlertDescription>
                                {searchParams.message}
                            </AlertDescription>
                        </Alert>
                    )}

                    <form action={updatePassword} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="password">Nova Senha</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                minLength={6}
                            />
                        </div>

                        <SubmitButton className="w-full">
                            Atualizar Senha
                        </SubmitButton>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
