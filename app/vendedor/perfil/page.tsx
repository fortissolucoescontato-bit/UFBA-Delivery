import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { updateProfile } from '../actions'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { SubmitButton } from '@/components/SubmitButton'

import { config } from '@/lib/config'

export default async function ProfilePage(props: {
    searchParams: Promise<{ success?: string, error?: string }>
}) {
    const searchParams = await props.searchParams;
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/auth/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, whatsapp, current_location, store_description, avatar_url, store_banner_url, pix_key, brand_color, instagram_handle, compact_layout, font_style')
        .eq('id', user.id)
        .single()

    return (
        <div className="min-h-screen bg-background p-4">
            <header className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/vendedor/dashboard">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                </Button>
                <h1 className="text-xl font-bold">Editar Perfil</h1>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Seus Dados</CardTitle>
                    <CardDescription>
                        Essas informações são públicas para os compradores.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {searchParams?.success && (
                        <Alert className="mb-6 border-green-500 bg-green-50 text-green-900 flex justify-between items-center group">
                            <div className="flex gap-3">
                                <CheckCircle2 className="h-4 w-4 stroke-green-600 mt-1" />
                                <div>
                                    <AlertTitle className="text-green-800 font-bold">Sucesso!</AlertTitle>
                                    <AlertDescription className="text-green-700">
                                        Seu perfil visual foi atualizado.
                                    </AlertDescription>
                                </div>
                            </div>
                            <Button size="sm" variant="outline" className="border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800 font-bold" asChild>
                                <Link href={`/loja/${user.id}`}>Ver Minha Loja</Link>
                            </Button>
                        </Alert>
                    )}

                    <form action={updateProfile} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" value={user.email} disabled className="bg-muted" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="avatar">Logo da Loja</Label>
                                {profile?.avatar_url && (
                                    <div className="h-16 w-16 mb-2 rounded-full overflow-hidden border">
                                        <img src={profile.avatar_url} alt="Logo" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <Input id="avatar" name="avatar" type="file" accept="image/*" />
                                <p className="text-[10px] text-muted-foreground">Recomendado: 1:1 (Quadrada).</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="banner">Foto de Capa (Banner)</Label>
                                {profile?.store_banner_url && (
                                    <div className="h-16 w-full mb-2 rounded-lg overflow-hidden border">
                                        <img src={profile.store_banner_url} alt="Banner" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <Input id="banner" name="banner" type="file" accept="image/*" />
                                <p className="text-[10px] text-muted-foreground">Recomendado: Retangular Horizontal.</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="fullName">Nome da Loja / Vendedor</Label>
                            <Input id="fullName" name="fullName" defaultValue={profile?.full_name || ''} required />
                            <p className="text-xs text-muted-foreground">Como os clientes chamarão sua loja.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descrição / Biografia (Opcional)</Label>
                            <textarea
                                id="description"
                                name="description"
                                defaultValue={profile?.store_description || ''}
                                rows={3}
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder={`A melhor loja de ${config.siteName}!`}
                            ></textarea>
                            <p className="text-xs text-muted-foreground">Aparecerá abaixo do seu nome na vitrine.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Sua Localização Atual</Label>
                            <select
                                id="location"
                                name="location"
                                defaultValue={profile?.current_location || ""}
                                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                <option value="">Não definido</option>
                                {config.defaultLocations.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                            <p className="text-xs text-muted-foreground">Onde você está vendendo agora?</p>
                        </div>


                        <div className="space-y-2">
                            <Label htmlFor="whatsapp">WhatsApp (com DDD)</Label>
                            <Input
                                id="whatsapp"
                                name="whatsapp"
                                placeholder="71999999999"
                                defaultValue={profile?.whatsapp || ''}
                                required
                            />
                            <p className="text-xs text-muted-foreground">Essencial para receber pedidos.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="pix_key">Chave PIX (Para receber via Chat)</Label>
                            <Input
                                id="pix_key"
                                name="pix_key"
                                placeholder="Email, Telefone, CPF/CNPJ ou Aleatória"
                                defaultValue={profile?.pix_key || ''}
                            />
                            <p className="text-xs text-muted-foreground">Será mostrada ao comprador automaticamente no momento de fechamento.</p>
                        </div>

                        <div className="pt-4 border-t border-border/50 space-y-4">
                            <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Identidade Visual</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="brandColor">Cor da Marca (Botões e Destaques)</Label>
                                    <div className="flex gap-3 items-center">
                                        <Input
                                            id="brandColor"
                                            name="brandColor"
                                            type="color"
                                            defaultValue={profile?.brand_color || '#f97316'}
                                            className="h-10 w-20 p-1 cursor-pointer"
                                        />
                                        <span className="text-xs font-mono text-muted-foreground uppercase">{profile?.brand_color || '#f97316'}</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="instagram">Instagram (@usuario)</Label>
                                    <Input
                                        id="instagram"
                                        name="instagram"
                                        placeholder="ex: ufbafood"
                                        defaultValue={profile?.instagram_handle || ''}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label>Layout dos Produtos</Label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="compactLayout"
                                            value="false"
                                            defaultChecked={!profile?.compact_layout}
                                            className="w-4 h-4 accent-primary"
                                        />
                                        <span className="text-sm font-medium group-hover:text-primary transition-colors">Grade (Imagens Grandes)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="compactLayout"
                                            value="true"
                                            defaultChecked={profile?.compact_layout}
                                            className="w-4 h-4 accent-primary"
                                        />
                                        <span className="text-sm font-medium group-hover:text-primary transition-colors">Lista (Mais compacto)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fontStyle">Estilo de Fonte</Label>
                                <select
                                    id="fontStyle"
                                    name="fontStyle"
                                    defaultValue={profile?.font_style || 'modern'}
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                                >
                                    <option value="modern">Moderna (Sem Serifa)</option>
                                    <option value="classic">Clássica (Com Serifa)</option>
                                    <option value="bold">Impactante (Negrito)</option>
                                    <option value="playful">Divertida</option>
                                </select>
                            </div>
                        </div>

                        <SubmitButton className="w-full">
                            Salvar Alterações
                        </SubmitButton>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
