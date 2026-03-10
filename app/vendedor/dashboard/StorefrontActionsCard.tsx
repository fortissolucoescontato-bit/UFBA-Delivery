'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, Share2, Check, Store, Sparkles, Copy, X, Download, Loader2 } from "lucide-react"
import Link from "next/link"
import { config } from '@/lib/config'
import { generateStoreCaption } from './share-actions'
import { toast } from 'sonner'

export function StorefrontActionsCard({ sellerId, avatarUrl }: { sellerId: string; avatarUrl?: string | null }) {
    const [showModal, setShowModal] = useState(false)
    const [caption, setCaption] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [copiedLink, setCopiedLink] = useState(false)
    const [copiedCaption, setCopiedCaption] = useState(false)

    const storeUrl = `https://ufba-delivery.vercel.app/loja/${sellerId}`
    const ogImageUrl = `/api/og/loja/${sellerId}`

    const openShareModal = async () => {
        setShowModal(true)
        if (!caption) {
            setIsGenerating(true)
            try {
                const result = await generateStoreCaption(sellerId)
                if (result.success && result.caption) {
                    setCaption(result.caption)
                } else {
                    setCaption(`🏪 Confira minha loja no UFBA Delivery!\n\n🎯 Produtos selecionados para estudantes da UFBA.\n\n📲 Acesse pelo link abaixo!`)
                }
            } catch {
                setCaption(`🏪 Confira minha loja no UFBA Delivery!\n\n📲 Acesse o link!`)
            } finally {
                setIsGenerating(false)
            }
        }
    }

    const copyLink = async () => {
        await navigator.clipboard.writeText(storeUrl)
        setCopiedLink(true)
        toast.success('Link copiado!')
        setTimeout(() => setCopiedLink(false), 2000)
    }

    const copyCaption = async () => {
        await navigator.clipboard.writeText(caption + '\n\n' + storeUrl)
        setCopiedCaption(true)
        toast.success('Texto + link copiado!')
        setTimeout(() => setCopiedCaption(false), 2000)
    }

    const downloadImage = () => {
        const link = document.createElement('a')
        link.href = ogImageUrl
        link.download = `loja-${sellerId}.png`
        link.click()
    }

    const regenerateCaption = async () => {
        setIsGenerating(true)
        setCaption('')
        try {
            const result = await generateStoreCaption(sellerId)
            if (result.success && result.caption) {
                setCaption(result.caption)
            }
        } finally {
            setIsGenerating(false)
        }
    }

    const shareNative = async () => {
        const text = caption + '\n\n' + storeUrl
        if (navigator.share) {
            try {
                await navigator.share({ title: 'Minha Loja', text })
            } catch { }
        } else {
            await copyCaption()
        }
    }

    return (
        <>
            <Card className="bg-white/80 backdrop-blur-md border-none shadow-sm overflow-hidden">
                <CardContent className="p-5 flex flex-col sm:flex-row gap-5 items-center justify-between">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        {avatarUrl ? (
                            <div className="relative">
                                <img src={avatarUrl} alt="Logo" className="w-14 h-14 rounded-xl object-cover border-2 border-white bg-background shadow-md" />
                                <div className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-md shadow-md">
                                    <Store className="h-3 w-3" />
                                </div>
                            </div>
                        ) : (
                            <div className="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0 shadow-sm">
                                <Store className="h-6 w-6 text-primary opacity-40" />
                            </div>
                        )}
                        <div>
                            <h3 className="font-black text-[#0A2540] tracking-tight flex items-center gap-2">
                                VITRINE PÚBLICA
                            </h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                                Visualize sua loja como um cliente
                            </p>
                        </div>
                    </div>

                    <div className="flex w-full sm:w-auto items-center gap-3">
                        <Button variant="outline" className="flex-1 sm:flex-none font-bold text-xs h-10 border-border/40 hover:bg-white/10" asChild>
                            <Link href={`/loja/${sellerId}`} target="_blank">
                                <ExternalLink className="h-3.5 w-3.5 mr-2 text-primary" />
                                VER LOJA
                            </Link>
                        </Button>

                        <Button onClick={openShareModal} className="flex-1 sm:flex-none font-bold text-xs h-10 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                            <Share2 className="h-3.5 w-3.5 mr-2" />
                            COMPARTILHAR
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* ─── Share Modal ─── */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div>
                                <h2 className="text-xl font-black text-[#0A2540] tracking-tight">Compartilhar Loja</h2>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">IA gerou o texto perfeito para você</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="h-9 w-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
                                <X className="h-4 w-4 text-slate-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Preview da Imagem OG */}
                            <div className="space-y-2">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">📸 Preview da Loja</p>
                                <div className="relative rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 aspect-[1200/630]">
                                    <img
                                        src={ogImageUrl}
                                        alt="Preview da loja"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        onClick={downloadImage}
                                        className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-slate-700 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-lg hover:bg-white transition-colors"
                                    >
                                        <Download className="h-3.5 w-3.5" />
                                        Baixar
                                    </button>
                                </div>
                            </div>

                            {/* Link da loja */}
                            <div className="space-y-2">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">🔗 Link da loja</p>
                                <div className="flex items-center gap-2 bg-slate-50 rounded-2xl p-3 border border-slate-100">
                                    <span className="flex-1 text-sm font-mono text-slate-600 truncate">{storeUrl}</span>
                                    <Button size="sm" onClick={copyLink} className="shrink-0 h-8 rounded-xl font-bold text-xs">
                                        {copiedLink ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                    </Button>
                                </div>
                            </div>

                            {/* Texto IA */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Sparkles className="h-3.5 w-3.5 text-[#635BFF]" />
                                        Legenda gerada por IA
                                    </p>
                                    <button onClick={regenerateCaption} className="text-xs text-[#635BFF] font-bold hover:underline flex items-center gap-1">
                                        {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : '↻'} Regerar
                                    </button>
                                </div>
                                <div className="relative bg-slate-50 rounded-2xl p-4 border border-slate-100 min-h-[120px]">
                                    {isGenerating ? (
                                        <div className="flex items-center gap-3 text-slate-400">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="text-sm font-medium">IA escrevendo o texto perfeito...</span>
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">{caption}</p>
                                    )}
                                </div>
                            </div>

                            {/* Botões de Ação */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <Button
                                    onClick={copyCaption}
                                    variant="outline"
                                    className="h-12 rounded-2xl font-black text-xs border-slate-200 hover:bg-slate-50"
                                    disabled={isGenerating}
                                >
                                    {copiedCaption ? (
                                        <><Check className="h-4 w-4 mr-2 text-green-500" />COPIADO!</>
                                    ) : (
                                        <><Copy className="h-4 w-4 mr-2" />COPIAR TUDO</>
                                    )}
                                </Button>
                                <Button
                                    onClick={shareNative}
                                    className="h-12 rounded-2xl font-black text-xs bg-[#0A2540] hover:bg-[#0A2540]/90 shadow-xl"
                                    disabled={isGenerating}
                                >
                                    <Share2 className="h-4 w-4 mr-2" />
                                    COMPARTILHAR
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
