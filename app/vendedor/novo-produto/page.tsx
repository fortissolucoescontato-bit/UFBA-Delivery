"use client"

import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Camera, X, Zap, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { SubmitButton } from '@/components/SubmitButton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { config } from '@/lib/config'
import { useState, useRef } from 'react'
import { toast } from 'sonner'

import { analyzeProductImage } from './ai-actions'

export default function AddProductPage() {
    const router = useRouter()

    async function createProduct(formData: FormData) {

        const name = formData.get('name') as string
        const priceRaw = (formData.get('price') as string || '').replace(',', '.')
        const price = parseFloat(priceRaw)
        const description = formData.get('description') as string
        const category = formData.get('category') as string || 'Outros'
        const subcategory = formData.get('subcategory') as string || 'Geral'
        const image = formData.get('image') as File

        if (!name || isNaN(price) || price <= 0) {
            return alert('Preencha o nome e o preço corretamente.')
        }

        if (!image || image.size === 0) {
            return alert('Selecione uma foto para o produto.')
        }

        if (image.size > 5 * 1024 * 1024) {
            return alert('A foto excede o limite máximo de 5MB.')
        }

        const buffer = Buffer.from(await image.arrayBuffer())
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
        
        if (!image.type || !allowedMimeTypes.includes(image.type)) {
            return alert('Formato de mídia não suportado. Envie apenas imagens JPG/PNG/WEBP.')
        }

        const magicNumbers: { [key: string]: number[] } = {
            'image/jpeg': [0xFF, 0xD8, 0xFF],
            'image/png': [0x89, 0x50, 0x4E, 0x47],
            'image/webp': [0x52, 0x49, 0x46, 0x46],
            'image/gif': [0x47, 0x49, 0x46]
        }

        const magic = magicNumbers[image.type]
        if (magic && !magic.every((byte, i) => buffer[i] === byte)) {
            return alert('Arquivo de imagem inválido.')
        }

        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return router.push('/auth/login')
        }

        const fileExt = image.type.split('/')[1]
        const fileName = `${user.id}/${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
            .from('products')
            .upload(fileName, buffer, {
                contentType: image.type
            })

        if (uploadError) {
            console.error('Upload Error:', { code: uploadError.message })
            return router.push('/vendedor/novo-produto?error=upload_failed')
        }

        const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(fileName)

        const { error: dbError } = await supabase
            .from('products')
            .insert({
                name,
                price,
                description: description || null,
                category,
                subcategory,
                image: publicUrl,
                seller_id: user.id
            })

        if (dbError) {
            console.error('DB Error:', { code: dbError.code })
            return alert('Erro ao salvar produto no banco.')
        }

        router.push('/vendedor/dashboard')
    }

    return (
        <AddProductForm createProduct={createProduct} />
    )
}

async function compressImage(dataUrl: string, maxWidth = 800, quality = 0.7): Promise<string> {
    return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
            const canvas = document.createElement("canvas")
            let width = img.width
            let height = img.height

            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width)
                width = maxWidth
            }

            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext("2d")
            if (!ctx) return resolve(dataUrl)

            ctx.drawImage(img, 0, 0, width, height)
            resolve(canvas.toDataURL("image/jpeg", quality))
        }
        img.src = dataUrl
    })
}

function AddProductForm({ createProduct }: { createProduct: (formData: FormData) => Promise<void> }) {
    const [selectedCategory, setSelectedCategory] = useState(config.categories[0].id)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [productName, setProductName] = useState("")
    const [productPrice, setProductPrice] = useState("")
    const [productDescription, setProductDescription] = useState("")
    const fileInputRef = useRef<HTMLInputElement>(null)

    const subcats = config.categories.find(c => c.id === selectedCategory)?.subcategories || []

    const handleAIAnalysis = async () => {
        if (!imagePreview) return
        setIsAnalyzing(true)
        try {
            const compressedImage = await compressImage(imagePreview)
            const result = await analyzeProductImage(compressedImage)
            if (result.success && result.data) {
                setProductName(result.data.name || "")
                setProductDescription(result.data.description || "")
                setProductPrice(result.data.price?.toString() || "")
                toast.success("Mágica realizada! Confira os campos preenchidos.")
            } else {
                toast.error("A IA não conseguiu analisar esta imagem agora.")
            }
        } catch (error) {
            toast.error("Erro ao conectar com a assistente IA.")
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <div className="min-h-screen bg-background p-4">
            <header className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/vendedor/dashboard">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-xl font-bold italic tracking-tighter">HARDENED V10 CORE</h1>
                    <p className="text-xs font-black text-primary uppercase tracking-widest">Adicionar Produto de Elite</p>
                </div>
            </header>

            <Card className="border-border/40 shadow-xl overflow-hidden rounded-[2.5rem]">
                <CardHeader className="bg-muted/30 pb-4 relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Zap className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-black tracking-tight">VIRTINE INTELIGENTE</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <form action={createProduct} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="image" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Foto do Produto</Label>
                            <div className="flex flex-col gap-4">
                                <Input
                                    ref={fileInputRef}
                                    id="image"
                                    name="image"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0]
                                        if (file) {
                                            const reader = new FileReader()
                                            reader.onloadend = () => setImagePreview(reader.result as string)
                                            reader.readAsDataURL(file)
                                        }
                                    }}
                                />
                                {imagePreview ? (
                                    <div className="relative group w-48 h-48 mx-auto">
                                        <div className="w-full h-full rounded-[2rem] overflow-hidden border-2 border-slate-200 bg-slate-50 flex items-center justify-center shadow-lg">
                                            <img src={imagePreview} className="w-full h-full object-contain" alt="Preview" />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => { setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                                            className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-xl hover:bg-red-600 transition-colors z-10"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>

                                        <Button
                                            type="button"
                                            disabled={isAnalyzing}
                                            onClick={handleAIAnalysis}
                                            className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full h-10 px-6 bg-[#635BFF] text-white shadow-xl shadow-[#635BFF]/30 border-2 border-white font-black text-xs hover:scale-105 transition-all whitespace-nowrap"
                                        >
                                            {isAnalyzing ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <Zap className="h-3 w-3 mr-2" />
                                            )}
                                            {isAnalyzing ? "ANALISANDO..." : "MÁGICA IA: ANALISAR PRODUTO"}
                                        </Button>
                                    </div>
                                ) : (
                                    <label htmlFor="image" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 rounded-[2.5rem] cursor-pointer bg-slate-50/50 hover:bg-indigo-50/30 hover:border-primary/50 transition-all group lg:min-h-[12rem] touch-manipulation block">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <div className="h-14 w-14 rounded-2xl bg-white shadow-md flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors mb-4">
                                                <Camera className="h-7 w-7 pointer-events-none" />
                                            </div>
                                            <p className="mb-1 text-xs font-black uppercase tracking-widest text-[#0A2540] group-hover:text-primary transition-colors pointer-events-none">Selecionar Foto de Elite</p>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter pointer-events-none">PNG, JPG ou WEBP (Max 5MB)</p>
                                        </div>
                                    </label>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Produto</Label>
                            <Input
                                id="name"
                                name="name"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                placeholder="A IA pode preencher isso para você..."
                                className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold text-[#0A2540] focus:bg-white transition-all shadow-inner-sm"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Descrição Vendedora</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={productDescription}
                                onChange={(e) => setProductDescription(e.target.value)}
                                placeholder="Conte a história do seu produto..."
                                className="rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all resize-none min-h-[120px] font-medium text-sm shadow-inner-sm"
                                maxLength={1000}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="price" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Preço Universitário (R$)</Label>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={productPrice}
                                    onChange={(e) => setProductPrice(e.target.value)}
                                    placeholder="0.00"
                                    className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-black text-lg focus:bg-white transition-all shadow-inner-sm"
                                    required
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Categoria</Label>
                                    <Select
                                        name="category"
                                        defaultValue={selectedCategory}
                                        onValueChange={setSelectedCategory}
                                    >
                                        <SelectTrigger id="category" className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold">
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent position="popper" className="rounded-2xl border-slate-100 shadow-2xl z-[999]">
                                            {config.categories.map(cat => (
                                                <SelectItem key={cat.id} value={cat.id} className="font-bold py-3">
                                                    {cat.icon} {cat.id.toUpperCase()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="subcategory" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Subcategoria</Label>
                                    <Select name="subcategory" defaultValue={subcats[0]}>
                                        <SelectTrigger id="subcategory" className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold">
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent position="popper" className="rounded-2xl border-slate-100 shadow-2xl z-[999]">
                                            {subcats.map(sub => (
                                                <SelectItem key={sub} value={sub} className="font-bold py-3">
                                                    {sub.toUpperCase()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <SubmitButton className="w-full h-16 rounded-[2rem] bg-[#0A2540] text-white hover:bg-slate-900 hover:scale-[1.01] shadow-2xl shadow-[#0A2540]/20 transition-all font-black tracking-normal md:tracking-widest text-sm md:text-lg mt-8 uppercase leading-tight text-center px-4">
                            Disponibilizar no Marketplace
                        </SubmitButton>

                        <p className="text-center text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] pt-4">
                            UFBA DELIVERY AI ENGINE • POWERED BY GROQ
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
