import Link from 'next/link'
import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { AppLogo } from '@/components/AppLogo'

export default async function Login(props: {
    searchParams: Promise<{ message: string }>
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
        const supabase = await createClient()

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            return redirect('/auth/login?message=Could not authenticate user')
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
                                    href="#"
                                    className="ml-auto inline-block text-sm underline"
                                >
                                    Esqueceu a senha?
                                </Link>
                            </div>
                            <Input id="password" name="password" type="password" required />
                        </div>

                        {searchParams?.message && (
                            <p className="text-sm font-medium text-destructive text-center">
                                {searchParams.message}
                            </p>
                        )}

                        <Button type="submit" className="w-full">
                            Entrar
                        </Button>

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
