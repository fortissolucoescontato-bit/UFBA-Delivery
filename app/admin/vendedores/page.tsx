import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { approveSeller, blockSeller } from "../actions"
import { Users, CheckCircle2, XCircle, Clock } from "lucide-react"

export default async function AdminSellersPage() {
    const supabase = await createClient()

    const { data: sellers, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'seller')
        .order('created_at', { ascending: false })

    if (error) return <div>Erro ao carregar vendedores</div>

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-primary/10 p-2 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Vendedores</h1>
                    <p className="text-muted-foreground">Gerencie as aprovações e o status dos vendedores da plataforma.</p>
                </div>
            </div>

            <div className="grid gap-6">
                {sellers?.map((seller) => (
                    <Card key={seller.id} className={!seller.is_approved ? "border-orange-200 bg-orange-50/10" : ""}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full overflow-hidden bg-muted border flex items-center justify-center text-lg font-bold">
                                    {seller.avatar_url ? (
                                        <img src={seller.avatar_url} alt={seller.full_name} className="h-full w-full object-cover" />
                                    ) : (
                                        seller.full_name?.charAt(0)
                                    )}
                                </div>
                                <div>
                                    <CardTitle className="text-xl">{seller.full_name}</CardTitle>
                                    <p className="text-sm text-muted-foreground">{seller.whatsapp || 'WhatsApp não cadastrado'}</p>
                                </div>
                            </div>
                            <Badge variant={seller.is_approved ? "default" : "secondary"} className={seller.is_approved ? "bg-green-100 text-green-800 hover:bg-green-100 border-green-200" : "bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200"}>
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
                                    <span>{seller.current_location || '-'}</span>
                                    <span className="text-muted-foreground">Instagram:</span>
                                    <span>{seller.instagram_handle || '-'}</span>
                                    <span className="text-muted-foreground">Chave PIX:</span>
                                    <span>{seller.pix_key || '-'}</span>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    {!seller.is_approved ? (
                                        <form action={approveSeller.bind(null, seller.id)} className="w-full md:w-auto">
                                            <Button type="submit" className="bg-green-600 hover:bg-green-700 w-full">
                                                Aprovar Vendedor
                                            </Button>
                                        </form>
                                    ) : (
                                        <form action={blockSeller.bind(null, seller.id)} className="w-full md:w-auto">
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

                {sellers?.length === 0 && (
                    <div className="text-center py-20 bg-muted/20 rounded-xl border-2 border-dashed">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-20" />
                        <h3 className="mt-4 text-lg font-semibold">Nenhum vendedor encontrado</h3>
                        <p className="text-muted-foreground">Parece que ainda não há vendedores cadastrados no sistema.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
