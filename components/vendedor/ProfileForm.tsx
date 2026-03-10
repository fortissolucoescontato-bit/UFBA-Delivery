'use client'

import { useState, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Zap, Globe, CreditCard, ArrowLeft, Camera, X, ImageIcon } from 'lucide-react'
import { updateProfile } from '@/app/vendedor/actions'
import { MPTutorialModal } from '@/components/MPTutorialModal'
import { SubmitButton } from '@/components/SubmitButton'

interface ProfileFormProps {
    userEmail: string
    profile: any
}

export function ProfileForm({ userEmail, profile }: ProfileFormProps) {
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
    const [bannerPreview, setBannerPreview] = useState<string | null>(null)
    const [removeAvatar, setRemoveAvatar] = useState(false)
    const [removeBanner, setRemoveBanner] = useState(false)

    const avatarInputRef = useRef<HTMLInputElement>(null)
    const bannerInputRef = useRef<HTMLInputElement>(null)

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setRemoveAvatar(false)
            const reader = new FileReader()
            reader.onloadend = () => setAvatarPreview(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setRemoveBanner(false)
            const reader = new FileReader()
            reader.onloadend = () => setBannerPreview(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    const clearAvatar = () => {
        setAvatarPreview(null)
        setRemoveAvatar(true)
        if (avatarInputRef.current) avatarInputRef.current.value = ''
    }

    const clearBanner = () => {
        setBannerPreview(null)
        setRemoveBanner(true)
        if (bannerInputRef.current) bannerInputRef.current.value = ''
    }

    const currentAvatar = avatarPreview || (!removeAvatar ? profile?.avatar_url : null)
    const currentBanner = bannerPreview || (!removeBanner ? profile?.store_banner_url : null)

    return (
        <form action={updateProfile} className="space-y-8">
            {/* Hidden fields for removal signals */}
            <input type="hidden" name="remove_avatar" value={removeAvatar ? 'true' : 'false'} />
            <input type="hidden" name="remove_banner" value={removeBanner ? 'true' : 'false'} />

            {/* Basic Info Card */}
            <Card className="rounded-[3rem] border-none shadow-2xl shadow-slate-200/60 overflow-hidden">
                <CardHeader className="bg-white border-b border-slate-100 p-8">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-[#0A2540]">
                            <Globe className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-black tracking-tight">Identidade da Loja</CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Dados Públicos do Marketplace</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">E-mail de Acesso</Label>
                        <Input value={userEmail} disabled className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold text-slate-400" />
                    </div>

                    {/* Avatar + Banner uploads */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Avatar */}
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Logo / Avatar</Label>
                            <div className="flex flex-col gap-3">
                                {/* Preview */}
                                <div className="relative group w-fit">
                                    <div
                                        onClick={() => avatarInputRef.current?.click()}
                                        className="h-24 w-24 rounded-[1.5rem] overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center cursor-pointer hover:border-[#635BFF] hover:bg-indigo-50/30 transition-all"
                                    >
                                        {currentAvatar ? (
                                            <img src={currentAvatar} className="w-full h-full object-contain" alt="Logo" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-1">
                                                <Camera className="h-6 w-6 text-slate-300" />
                                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">Adicionar</span>
                                            </div>
                                        )}
                                    </div>
                                    {currentAvatar && (
                                        <button
                                            type="button"
                                            onClick={clearAvatar}
                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors z-10"
                                            aria-label="Remover logo"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => avatarInputRef.current?.click()}
                                        className="text-[10px] font-bold text-[#635BFF] hover:underline uppercase tracking-wider flex items-center gap-1"
                                    >
                                        <Camera className="h-3 w-3" />
                                        {currentAvatar ? 'Trocar imagem' : 'Selecionar arquivo'}
                                    </button>
                                </div>
                                <input
                                    ref={avatarInputRef}
                                    name="avatar"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                />
                            </div>
                        </div>

                        {/* Banner */}
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Banner Principal</Label>
                            <div className="flex flex-col gap-3">
                                {/* Preview */}
                                <div className="relative group">
                                    <div
                                        onClick={() => bannerInputRef.current?.click()}
                                        className="h-24 w-full rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center cursor-pointer hover:border-[#635BFF] hover:bg-indigo-50/30 transition-all"
                                    >
                                        {currentBanner ? (
                                            <img src={currentBanner} className="w-full h-full object-contain" alt="Banner" />
                                        ) : (
                                            <div className="flex flex-col items-center gap-1">
                                                <ImageIcon className="h-6 w-6 text-slate-300" />
                                                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">Adicionar banner</span>
                                            </div>
                                        )}
                                    </div>
                                    {currentBanner && (
                                        <button
                                            type="button"
                                            onClick={clearBanner}
                                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors z-10"
                                            aria-label="Remover banner"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => bannerInputRef.current?.click()}
                                        className="text-[10px] font-bold text-[#635BFF] hover:underline uppercase tracking-wider flex items-center gap-1"
                                    >
                                        <ImageIcon className="h-3 w-3" />
                                        {currentBanner ? 'Trocar banner' : 'Selecionar arquivo'}
                                    </button>
                                </div>
                                <input
                                    ref={bannerInputRef}
                                    name="banner"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleBannerChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nome Comercial</Label>
                            <Input name="fullName" defaultValue={profile?.full_name || ''} required className="h-14 rounded-2xl border-slate-200 font-black tracking-tight focus:ring-[#635BFF]" />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Descrição da Loja <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                            <textarea
                                name="description"
                                defaultValue={profile?.store_description || ''}
                                placeholder="Conte um pouco sobre sua loja, horários ou especialidades..."
                                className="w-full min-h-[100px] rounded-2xl border border-slate-200 p-4 font-medium text-sm focus:ring-[#635BFF] focus:border-[#635BFF] outline-none transition-all resize-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">WhatsApp de Vendas</Label>
                            <Input name="whatsapp" defaultValue={profile?.whatsapp || ''} required className="h-14 rounded-2xl border-slate-200 font-black tracking-tight" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Instagram (@usuario)</Label>
                            <Input name="instagram" defaultValue={profile?.instagram_handle || ''} placeholder="@loja.exemplo" className="h-14 rounded-2xl border-slate-200 font-black tracking-tight" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Localização (Bairro/Campus)</Label>
                            <Input name="location" defaultValue={profile?.current_location || ''} placeholder="Ex: Campus Ondina" className="h-14 rounded-2xl border-slate-200 font-black tracking-tight" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Chave PIX (Backup)</Label>
                            <Input name="pix_key" defaultValue={profile?.pix_key || ''} className="h-14 rounded-2xl border-slate-200 font-black tracking-tight" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Mercado Pago Card */}
            <Card className="rounded-[3rem] border-none shadow-2xl shadow-indigo-200/40 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#635BFF]/5 rounded-full -mr-32 -mt-32 blur-[100px] pointer-events-none" />
                <CardHeader className="bg-white border-b border-slate-100 p-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-[#635BFF]">
                                <CreditCard className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-black tracking-tight">Checkout Mercado Pago</CardTitle>
                                <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-[#635BFF]">Recebimento Direto (V10)</CardDescription>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-tighter border-2 ${profile?.mp_connected ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                {profile?.mp_connected ? 'CONECTADO' : 'AGUARDANDO CONEXÃO'}
                            </div>
                            <MPTutorialModal />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6 relative z-10">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Public Key (Produção)</Label>
                            <Input name="mpPublicKey" defaultValue={profile?.mp_public_key || ''} placeholder="APP_USR-..." className="h-14 rounded-2xl border-slate-200 font-mono text-sm" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Access Token (Produção)</Label>
                            <Input
                                name="mpAccessToken"
                                type="password"
                                defaultValue=""
                                placeholder={profile?.mp_access_token ? "••••••••••••••••••••" : "APP_USR-..."}
                                className="h-14 rounded-2xl border-slate-200 font-mono text-sm"
                            />
                            {profile?.mp_access_token && (
                                <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider ml-1">Token Configurado com Segurança</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Estilo de Vitrine + Submit */}
            <Card className="rounded-[3rem] border-none shadow-2xl shadow-slate-200/60 p-8 space-y-4">
                <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Estilo de Vitrine</Label>
                    <div className="grid grid-cols-2 gap-4">
                        <label className="flex flex-col items-center gap-3 p-6 rounded-3xl border-2 border-slate-100 cursor-pointer hover:bg-slate-50 transition-all has-[:checked]:border-[#635BFF] has-[:checked]:bg-indigo-50/30 group">
                            <input type="radio" name="compactLayout" value="false" defaultChecked={!profile?.compact_layout} className="hidden" />
                            <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-200 group-has-[:checked]:text-[#635BFF]">
                                <Zap className="h-6 w-6" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Grade Moderna</span>
                        </label>
                        <label className="flex flex-col items-center gap-3 p-6 rounded-3xl border-2 border-slate-100 cursor-pointer hover:bg-slate-50 transition-all has-[:checked]:border-[#635BFF] has-[:checked]:bg-indigo-50/30 group">
                            <input type="radio" name="compactLayout" value="true" defaultChecked={profile?.compact_layout} className="hidden" />
                            <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-200 group-has-[:checked]:text-[#635BFF]">
                                <ArrowLeft className="h-6 w-6 rotate-90" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Lista Compacta</span>
                        </label>
                    </div>
                </div>

                <SubmitButton className="h-20 w-full rounded-[2.5rem] bg-[#0A2540] text-white font-black tracking-widest text-lg shadow-2xl shadow-[#0A2540]/30 hover:scale-[1.02] transition-all">
                    SALVAR ALTERAÇÕES
                </SubmitButton>
                <p className="text-center text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    UFBA-DELIVERY CORE ENGINE v10.0
                </p>
            </Card>
        </form>
    )
}
