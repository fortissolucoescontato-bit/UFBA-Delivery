import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { approveSeller, blockSeller } from "../actions"
import { Users, CheckCircle2, Clock, ShieldAlert, ArrowLeft, LayoutDashboard } from "lucide-react"
import { redirect } from "next/navigation"
import Link from "next/link"

type FilterTab = 'pendentes' | 'aprovados' | 'todos'

export default async function AdminSellersPage({
    searchParams,
}: {
    searchParams: Promise<{ tab?: FilterTab }>
}) {
    const params = await searchParams
    const activeTab: FilterTab = params.tab ?? 'pendentes'

    // ---------- Segurança: apenas admins chegam aqui ----------
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return redirect('/auth/login')

    const { data: selfProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (selfProfile?.role !== 'admin') return redirect('/')

    // ---------- Supabase Admin bypassa o RLS ----------
    const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Traz TODOS os sellers (pendentes + aprovados) sem restrição de RLS
    const { data: allSellers, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('role', 'seller')
        .order('created_at', { ascending: false })

    if (error) {
        return (
            <div className="container mx-auto py-10 px-4">
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-destructive">
                    <ShieldAlert className="mb-2 h-5 w-5" />
                    <p className="font-semibold">Erro ao carregar vendedores</p>
                    <p className="text-sm opacity-75">{error.message}</p>
                </div>
            </div>
        )
    }

    const pendentes = allSellers?.filter((s) => !s.is_approved) ?? []
    const aprovados = allSellers?.filter((s) => s.is_approved) ?? []
    const sellers =
        activeTab === 'pendentes' ? pendentes :
        activeTab === 'aprovados' ? aprovados :
        allSellers ?? []

    const tabs: { key: FilterTab; label: string; count: number }[] = [
        { key: 'pendentes', label: '⏳ Pendentes', count: pendentes.length },
        { key: 'aprovados', label: '✅ Aprovados', count: aprovados.length },
        { key: 'todos',     label: '👥 Todos',    count: allSellers?.length ?? 0 },
    ]

    return (
        <div className="container mx-auto py-10 px-4">
            {/* Botão Voltar + Header */}
            <div className="flex items-center gap-3 mb-8">
                <Link
                    href="/"
                    className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-muted hover:bg-muted/80 transition-colors shrink-0"
                    title="Voltar para o início"
                >
                    <ArrowLeft className="h-5 w-5 text-foreground" />
                </Link>
                <div className="bg-primary/10 p-2 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">Vendedores</h1>
                    <p className="text-muted-foreground">
                        Gerencie as aprovações e o status dos vendedores da plataforma.
                    </p>
                </div>
                <Link
                    href="/vendedor/dashboard"
                    className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                    <LayoutDashboard className="h-4 w-4" />
                    Meu Dashboard
                </Link>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
                    <p className="text-3xl font-bold text-orange-500">{pendentes.length}</p>
                    <p className="text-sm text-muted-foreground mt-1">Pendentes de aprovação</p>
                </div>
                <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
                    <p className="text-3xl font-bold text-green-600">{aprovados.length}</p>
                    <p className="text-sm text-muted-foreground mt-1">Aprovados</p>
                </div>
                <div className="rounded-xl border bg-card p-4 text-center shadow-sm">
                    <p className="text-3xl font-bold">{allSellers?.length ?? 0}</p>
                    <p className="text-sm text-muted-foreground mt-1">Total de vendedores</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b pb-0">
                {tabs.map((tab) => (
                    <a
                        key={tab.key}
                        href={`/admin/vendedores?tab=${tab.key}`}
                        className={`px-4 py-2 rounded-t-lg text-sm font-medium border border-b-0 transition-colors ${
                            activeTab === tab.key
                                ? 'bg-background text-primary border-border -mb-px'
                                : 'bg-muted/40 text-muted-foreground hover:bg-muted border-transparent'
                        }`}
                    >
                        {tab.label}
                        <span className={`ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                            activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        }`}>
                            {tab.count}
                        </span>
                    </a>
                ))}
            </div>

            {/* Seller list */}
            <div className="grid gap-6">
                {sellers.map((seller) => (
                    <Card
                        key={seller.id}
                        className={!seller.is_approved
                            ? "border-orange-300 bg-orange-50/10"
                            : "border-green-200/50"
                        }
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full overflow-hidden bg-muted border flex items-center justify-center text-lg font-bold shrink-0">
                                    {seller.avatar_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={seller.avatar_url} alt={seller.full_name} className="h-full w-full object-cover" />
                                    ) : (
                                        seller.full_name?.charAt(0)?.toUpperCase() ?? '?'
                                    )}
                                </div>
                                <div>
                                    <CardTitle className="text-xl">{seller.full_name ?? '—'}</CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        {seller.whatsapp || 'WhatsApp não cadastrado'}
                                    </p>
                                </div>
                            </div>

                            <Badge
                                variant="secondary"
                                className={seller.is_approved
                                    ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-100"
                                    : "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100"
                                }
                            >
                                {seller.is_approved ? (
                                    <><CheckCircle2 className="mr-1 h-3 w-3" /> Ativo</>
                                ) : (
                                    <><Clock className="mr-1 h-3 w-3" /> Pendente</>
                                )}
                            </Badge>
                        </CardHeader>

                        <CardContent>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-2">
                                <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                                    <span className="text-muted-foreground">Localização:</span>
                                    <span>{seller.current_location || '—'}</span>

                                    <span className="text-muted-foreground">Instagram:</span>
                                    <span>
                                        {seller.instagram_handle
                                            ? <a href={`https://instagram.com/${seller.instagram_handle.replace('@','')}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">@{seller.instagram_handle.replace('@','')}</a>
                                            : '—'
                                        }
                                    </span>

                                    <span className="text-muted-foreground">Chave PIX:</span>
                                    <span>{seller.pix_key || '—'}</span>

                                    <span className="text-muted-foreground">Cadastro:</span>
                                    <span>
                                        {new Date(seller.created_at).toLocaleDateString('pt-BR', {
                                            day: '2-digit', month: '2-digit', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit',
                                        })}
                                    </span>
                                </div>

                                <div className="flex gap-2 w-full md:w-auto">
                                    {!seller.is_approved ? (
                                        <form action={approveSeller} className="w-full md:w-auto">
                                            <input type="hidden" name="sellerId" value={seller.id} />
                                            <Button type="submit" className="bg-green-600 hover:bg-green-700 w-full">
                                                ✓ Aprovar Vendedor
                                            </Button>
                                        </form>
                                    ) : (
                                        <form action={blockSeller} className="w-full md:w-auto">
                                            <input type="hidden" name="sellerId" value={seller.id} />
                                            <Button type="submit" variant="destructive" className="w-full">
                                                Bloquear Acesso
                                            </Button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {sellers.length === 0 && (
                    <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
                        <h3 className="mt-4 text-lg font-semibold">
                            {activeTab === 'pendentes'
                                ? 'Nenhum vendedor pendente 🎉'
                                : activeTab === 'aprovados'
                                ? 'Nenhum vendedor aprovado ainda'
                                : 'Nenhum vendedor cadastrado'}
                        </h3>
                        <p className="text-muted-foreground text-sm mt-1">
                            {activeTab === 'pendentes'
                                ? 'Todos os vendedores já foram analisados.'
                                : 'Quando houver vendedores, eles aparecerão aqui.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
