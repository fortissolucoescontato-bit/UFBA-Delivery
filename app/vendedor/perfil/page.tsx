import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ArrowLeft, CheckCircle2, ShieldCheck, Zap, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ProfileForm } from '@/components/vendedor/ProfileForm'

export default async function ProfilePage(props: {
    searchParams: Promise<{ success?: string, error?: string, message?: string }>
}) {
    const searchParams = await props.searchParams;
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/auth/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*, mp_public_key, mp_access_token, mp_connected')
        .eq('id', user.id)
        .single()

    return (
        <div className="min-h-screen bg-[#F6F9FC] p-4 flex flex-col items-center pb-24 font-sans">
            <div className="w-full max-w-2xl animate-in-up">
                <header className="flex items-center gap-4 mb-8 pt-4">
                    <Button variant="outline" size="icon" className="rounded-2xl bg-white shadow-sm border-slate-200/60" asChild>
                        <Link href="/vendedor/dashboard">
                            <ArrowLeft className="h-5 w-5 text-[#0A2540]" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black text-[#0A2540] tracking-tighter">Configurações</h1>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest italic tracking-[0.2em] flex items-center gap-1.5 mt-0.5">
                            <ShieldCheck className="h-3 w-3 text-[#635BFF]" />
                            OPERAÇÃO HARDENED V3
                        </p>
                    </div>
                </header>

                {searchParams?.success && (
                    <Alert className="mb-8 border-none bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 rounded-[2rem] p-6 animate-in-up">
                        <div className="flex gap-4">
                            <CheckCircle2 className="h-6 w-6 text-white" />
                            <div>
                                <AlertTitle className="text-lg font-black tracking-tight">Sistema Atualizado!</AlertTitle>
                                <AlertDescription className="text-emerald-50 font-bold text-sm">
                                    Suas configurações foram sincronizadas com sucesso.
                                </AlertDescription>
                            </div>
                        </div>
                    </Alert>
                )}

                {searchParams?.error && (
                    <Alert className="mb-8 border-none bg-red-500 text-white shadow-xl shadow-red-500/20 rounded-[2rem] p-6 animate-in-up">
                        <div className="flex gap-4">
                            <Zap className="h-6 w-6 text-white rotate-180" />
                            <div>
                                <AlertTitle className="text-lg font-black tracking-tight">Erro de Sincronização</AlertTitle>
                                <AlertDescription className="text-red-50 font-bold text-sm">
                                    {searchParams.message || "Ocorreu um erro ao atualizar seu perfil."}
                                </AlertDescription>
                            </div>
                        </div>
                    </Alert>
                )}

                <ProfileForm
                    userEmail={user.email || ''}
                    profile={profile}
                />

                <div className="mt-8 animate-in-up" style={{ animationDelay: '200ms' }}>
                    <Button variant="outline" className="w-full h-16 rounded-[2rem] border-red-200 border-dashed text-red-500 font-black tracking-[0.2em] uppercase text-xs hover:bg-red-50 hover:text-red-700 transition-all group shadow-sm bg-white" asChild>
                        <Link href="/perfil/seguranca">
                            <Lock className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                            SEGURANÇA (SENHA E E-MAIL)
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
