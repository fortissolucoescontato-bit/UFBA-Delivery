import Link from 'next/link'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { AppLogo } from '@/components/AppLogo'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle } from "lucide-react"

export default async function Signup(props: {
    searchParams: Promise<{ message?: string, type?: string }>
}) {
    const searchParams = await props.searchParams;
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        return redirect('/')
    }

    const signUp = async (formData: FormData) => {
        'use server'

        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const fullName = formData.get('fullName') as string
        const role = formData.get('role') as string // 'buyer' or 'seller'

        // Validate role to prevent 'admin' injection
        const safeRole = role === 'seller' ? 'seller' : 'buyer';

        const supabase = await createClient()
        const origin = (await headers()).get('origin')

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${origin}/auth/callback`,
                data: {
                    full_name: fullName,
                    role: safeRole, // This will be used by the SQL trigger
                },
            },
        })

        if (error) {
            console.error(error)
            return redirect('/auth/signup?type=error&message=Não foi possível criar a conta. Tente novamente.')
        }

        return redirect('/auth/signup?type=success&message=Conta criada com sucesso! Verifique seu email para confirmar.')
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
            <Link href="/" className="mb-8">
                <AppLogo />
            </Link>

            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Criar Conta</CardTitle>
                    <CardDescription>
                        Comece a usar o UFBA Delivery hoje mesmo.
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

                    <form action={signUp} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="fullName">Nome Completo</Label>
                            <Input
                                id="fullName"
                                name="fullName"
                                placeholder="Seu Nome"
                                required
                            />
                        </div>
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
                            <Label htmlFor="password">Senha</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>

                        <div className="grid gap-2 pt-2">
                            <Label>Eu quero...</Label>
                            <RadioGroup defaultValue="buyer" name="role" className="grid grid-cols-2 gap-4">
                                <div>
                                    <RadioGroupItem value="buyer" id="buyer" className="peer sr-only" />
                                    <Label
                                        htmlFor="buyer"
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                    >
                                        <span className="text-xl mb-1">🍔</span>
                                        Comprar
                                    </Label>
                                </div>
                                <div>
                                    <RadioGroupItem value="seller" id="seller" className="peer sr-only" />
                                    <Label
                                        htmlFor="seller"
                                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                                    >
                                        <span className="text-xl mb-1">💰</span>
                                        Vender
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <Button type="submit" className="w-full mt-2">
                            Cadastrar
                        </Button>

                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-4 text-center text-sm text-muted-foreground">
                    <div className='w-full'>
                        Já tem uma conta?{" "}
                        <Link href="/auth/login" className="underline">
                            Entrar
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
