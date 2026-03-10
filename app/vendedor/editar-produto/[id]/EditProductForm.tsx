'use client'

import { useState, useRef } from 'react'
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
import { toast } from 'sonner'
import { analyzeProductImage } from '../../novo-produto/ai-actions'

interface EditProductFormProps {
    product: any
    updateProduct: (formData: FormData) => Promise<void>
}

export function EditProductForm({ product, updateProduct }: EditProductFormProps) {
    const [selectedCategory, setSelectedCategory] = useState(product.category || config.categories[0].id)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [productName, setProductName] = useState(product.name || "")
    const [productPrice, setProductPrice] = useState(product.price?.toString() || "")
    const [productDescription, setProductDescription] = useState(product.description || "")

    const fileInputRef = useRef<HTMLInputElement>(null)

    const subcats = config.categories.find(c => c.id === selectedCategory)?.subcategories || []

    const handleAIAnalysis = async () => {
        const imageToAnalyze = imagePreview || product.image
        if (!imageToAnalyze) {
            return toast.error("Selecione uma imagem primeiro.")
        }

        setIsAnalyzing(true)
        try {
            // Se for uma URL externa (Supabase), precisamos converter para base64 ou a IA pode não acessar se for privado.
            // Para simplificar, o analyzeProductImage no ai-actions.ts espera o base64 ou URL.
            // Se for a URL do bucket, passamos ela.
            const result = await analyzeProductImage(imageToAnalyze)
            if (result.success && result.data) {
                setProductName(result.data.name || "")
                setProductDescription(result.data.description || "")
                setProductPrice(result.data.price?.toString() || "")
                toast.success("Mágica realizada! Analisamos a foto e sugerimos melhorias.")
            } else {
                toast.error(result.error || "A IA não conseguiu analisar esta imagem no momento.")
            }
        } catch (error: any) {
            toast.error(error.message || "Erro ao conectar com a assistente de elite.")
        } finally {
            setIsAnalyzing(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#F6F9FC] p-4 flex flex-col items-center pb-24">
            <div className="w-full max-w-xl animate-in-up">
                <header className="flex items-center gap-4 mb-8 pt-4">
                    <Button variant="outline" size="icon" className="rounded-2xl bg-white shadow-sm border-slate-200/60" asChild>
                        <Link href="/vendedor/dashboard">
                            <ArrowLeft className="h-5 w-5 text-[#0A2540]" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black text-[#0A2540] tracking-tighter italic">ECLIPSE V10</h1>
                        <p className="text-xs font-black text-primary uppercase tracking-widest italic tracking-[0.2em] mt-0.5">Otimização de Produto</p>
                    </div>
                </header>

                <Card className="border-none shadow-2xl shadow-slate-200/50 overflow-hidden rounded-[2.5rem] bg-white">
                    <CardHeader className="bg-slate-50/50 pb-6 border-b border-slate-100 relative">
                        <div className="absolute top-0 right-0 p-6 opacity-5">
                            <Zap className="h-16 w-16 text-[#635BFF]" />
                        </div>
                        <CardTitle className="text-xl font-black text-[#0A2540] tracking-tight">AJUSTES DE PERFORMANCE</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <form action={updateProduct} className="space-y-6">
                            <input type="hidden" name="productId" value={product.id} />

                            <div className="space-y-2">
                                <Label htmlFor="image" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Asset Visual (Foto)</Label>
                                <div className="flex flex-col gap-4">
                                    <div className="relative group w-56 h-56 mx-auto">
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full h-full rounded-[2.5rem] overflow-hidden border-2 border-slate-100 bg-slate-50 flex items-center justify-center cursor-pointer hover:border-[#635BFF]/30 transition-all shadow-inner-sm"
                                        >
                                            {imagePreview || product.image ? (
                                                <img src={imagePreview || product.image} className="w-full h-full object-contain" alt="Preview" />
                                            ) : (
                                                <div className="flex flex-col items-center gap-2">
                                                    <Camera className="h-10 w-10 text-slate-200" />
                                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Upload Image</span>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-2 right-2 h-12 w-12 rounded-full bg-white shadow-xl border border-slate-100 flex items-center justify-center text-[#0A2540] hover:text-[#635BFF] transition-all active:scale-95 z-10"
                                        >
                                            <Camera className="h-6 w-6" />
                                        </button>

                                        <Button
                                            type="button"
                                            disabled={isAnalyzing}
                                            onClick={handleAIAnalysis}
                                            className="absolute -bottom-5 left-1/2 -translate-x-1/2 rounded-full h-11 px-8 bg-[#635BFF] text-white shadow-xl shadow-[#635BFF]/30 border-4 border-white font-black text-[11px] hover:scale-105 transition-all whitespace-nowrap z-20"
                                        >
                                            {isAnalyzing ? (
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            ) : (
                                                <Zap className="h-4 w-4 mr-2" />
                                            )}
                                            {isAnalyzing ? "ANALISANDO..." : "MÁGICA IA: OTIMIZAR"}
                                        </Button>
                                    </div>
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
                                    <div className="bg-indigo-50/40 p-5 rounded-[1.5rem] border border-indigo-100/50 mt-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Zap className="h-3.5 w-3.5 text-indigo-500" />
                                            <p className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em]">Hardened Display Engine</p>
                                        </div>
                                        <p className="text-[11px] text-indigo-600/80 font-medium leading-relaxed">
                                            As fotos são exibidas em formato **Original (No-Zoom)**. Use a Mágica IA para gerar descrições profissionais baseadas nesta imagem.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 pt-4">
                                <Label htmlFor="name" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Título do Produto</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
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
                                    placeholder="A IA pode melhorar este texto para você..."
                                    className="rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all resize-none min-h-[140px] font-medium text-sm shadow-inner-sm leading-relaxed"
                                    maxLength={1000}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="price" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Valor Unitário (R$)</Label>
                                    <Input
                                        id="price"
                                        name="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={productPrice}
                                        onChange={(e) => setProductPrice(e.target.value)}
                                        className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-black text-lg text-[#0A2540] focus:bg-white transition-all shadow-inner-sm"
                                        required
                                    />
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="category" className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Categoria Hub</Label>
                                        <Select
                                            name="category"
                                            defaultValue={selectedCategory}
                                            onValueChange={setSelectedCategory}
                                        >
                                            <SelectTrigger id="category" className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold text-[#0A2540]">
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
                                        <Select name="subcategory" defaultValue={product.subcategory || subcats[0]}>
                                            <SelectTrigger id="subcategory" className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold text-[#0A2540]">
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

                            <SubmitButton className="w-full h-16 rounded-[2rem] bg-[#0A2540] text-white hover:bg-black hover:scale-[1.02] shadow-2xl shadow-[#0A2540]/20 transition-all font-black tracking-widest text-lg mt-8 uppercase border-none">
                                Atualizar Produto
                            </SubmitButton>

                            <p className="text-center text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] pt-6">
                                HARDENED V10 MASTER • POWERED BY GROQ IA
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

