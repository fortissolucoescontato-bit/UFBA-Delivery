'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink, Share2, Check, Store } from "lucide-react"
import Link from "next/link"

export function StorefrontActionsCard({ sellerId, avatarUrl }: { sellerId: string; avatarUrl?: string | null }) {
    const [copied, setCopied] = useState(false)

    const handleShare = async () => {
        // Construct the full URL using window.location.origin
        const url = `${window.location.origin}/loja/${sellerId}`

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Minha Loja',
                    text: 'Confira os meus produtos no UFBA Delivery!',
                    url: url,
                })
            } catch (error) {
                console.error('Error sharing:', error)
                // Fallback to clipboard if share gets cancelled or errors out for some reason 
                // but user didn't intentionally cancel
            }
        } else {
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(url)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            } catch (err) {
                console.error('Failed to copy fallback:', err)
            }
        }
    }

    return (
        <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="Logo" className="w-12 h-12 rounded-full object-cover border bg-background" />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border shrink-0">
                            <Store className="h-5 w-5 text-muted-foreground" />
                        </div>
                    )}
                    <div>
                        <h3 className="font-semibold text-primary flex items-center gap-2">
                            Sua Vitrine Pública
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                            Veja como os clientes enxergam a sua loja.
                        </p>
                    </div>
                </div>

                <div className="flex w-full sm:w-auto items-center gap-2">
                    <Button variant="outline" className="flex-1 sm:flex-none border-primary/20 hover:bg-primary/10" asChild>
                        <Link href={`/loja/${sellerId}`} target="_blank">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Ver Loja
                        </Link>
                    </Button>

                    <Button onClick={handleShare} className="flex-1 sm:flex-none bg-primary hover:bg-primary/90">
                        {copied ? (
                            <>
                                <Check className="h-4 w-4 mr-2" />
                                Copiado!
                            </>
                        ) : (
                            <>
                                <Share2 className="h-4 w-4 mr-2" />
                                Compartilhar
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
