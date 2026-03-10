'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Star, MessageSquare, Send, CheckCircle2, User } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'

interface Review {
    id: string
    created_at: string
    rating: number
    comment: string
    is_verified_purchase: boolean
    profiles?: {
        full_name: string
        avatar_url: string
    }
}

export function ProductReviews({ productId }: { productId: string }) {
    const [reviews, setReviews] = useState<Review[]>([])
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [hover, setHover] = useState(0)
    const [loading, setLoading] = useState(false)
    const [user, setUser] = useState<any>(null)
    const supabase = createClient()

    useEffect(() => {
        const fetchReviews = async () => {
            const { data, error } = await supabase
                .from('reviews')
                .select('*')
                .eq('product_id', productId)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Error fetching reviews:', error)
                return
            }

            if (!data || data.length === 0) {
                setReviews([])
                return
            }

            // Buscar os perfis separadamente para evitar problema de FK com auth.users
            const userIds = [...new Set(data.map((r: any) => r.student_id).filter(Boolean))]
            const { data: profilesData } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .in('id', userIds)

            const profilesMap = Object.fromEntries(
                (profilesData || []).map((p: any) => [p.id, p])
            )

            const reviewsWithProfiles = data.map((r: any) => ({
                ...r,
                profiles: profilesMap[r.student_id] || null
            }))

            setReviews(reviewsWithProfiles)
        }

        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }

        fetchReviews()
        checkUser()
    }, [productId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) {
            toast.error("Login Necessário", { description: "Você precisa estar logado para avaliar." })
            return
        }

        setLoading(true)
        const { error } = await supabase
            .from('reviews')
            .insert({
                product_id: productId,
                student_id: user.id,
                rating,
                comment,
                is_verified_purchase: false // Pode ser logado se houver histórico de pedidos
            })

        if (error) {
            toast.error("Erro ao enviar", { description: "Não foi possível processar sua avaliação." })
        } else {
            toast.success("Avaliação enviada!", { description: "Obrigado por ajudar a comunidade!" })
            setComment('')
            // Recarregar reviews
            const { data } = await supabase
                .from('reviews')
                .select('*')
                .eq('product_id', productId)
                .order('created_at', { ascending: false })
            if (data) {
                const userIds = [...new Set(data.map((r: any) => r.student_id).filter(Boolean))]
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url')
                    .in('id', userIds)
                const profilesMap = Object.fromEntries(
                    (profilesData || []).map((p: any) => [p.id, p])
                )
                setReviews(data.map((r: any) => ({ ...r, profiles: profilesMap[r.student_id] || null })))
            }
        }
        setLoading(false)
    }

    return (
        <div className="space-y-8 animate-in-up">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-[#0A2540] tracking-tighter flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-[#635BFF]" />
                        Avaliações dos Estudantes
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">PROVA SOCIAL UNIVERSITÁRIA</p>
                </div>
            </div>

            {/* Input de Avaliação */}
            {user && (
                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="transition-transform hover:scale-125 focus:outline-none"
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(0)}
                                        onClick={() => setRating(star)}
                                    >
                                        <Star
                                            className={`h-8 w-8 ${(hover || rating) >= star
                                                ? 'fill-yellow-400 text-yellow-400'
                                                : 'text-slate-200'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Conte para outros estudantes o que você achou..."
                                className="w-full h-32 p-4 rounded-3xl bg-slate-50 border-none focus:ring-2 focus:ring-[#635BFF]/20 font-medium text-sm text-[#0A2540] placeholder:text-slate-400"
                                required
                            />
                            <Button
                                disabled={loading}
                                className="w-full h-14 rounded-2xl bg-[#0A2540] text-white font-black tracking-tight text-sm hover:bg-slate-800 shadow-xl"
                            >
                                {loading ? 'ENVIANDO...' : 'PUBLICAR AVALIAÇÃO'}
                                <Send className="ml-2 h-4 w-4" />
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Lista de Reviews */}
            <div className="space-y-4">
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <Card key={review.id} className="border-none shadow-md shadow-slate-100 rounded-[2rem] overflow-hidden bg-white/60 backdrop-blur-md">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-2xl bg-slate-100 overflow-hidden shrink-0">
                                            {review.profiles?.avatar_url ? (
                                                <img src={review.profiles.avatar_url} className="object-cover h-full w-full" />
                                            ) : (
                                                <div className="flex items-center justify-center h-full w-full bg-indigo-50 text-[#635BFF]">
                                                    <User className="h-5 w-5" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-black text-sm text-[#0A2540] leading-none mb-1">
                                                {review.profiles?.full_name || 'Estudante Anônimo'}
                                            </p>
                                            <div className="flex items-center gap-1">
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star key={star} className={`h-3 w-3 ${review.rating >= star ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                                                    ))}
                                                </div>
                                                <span className="text-[10px] font-black text-slate-300 ml-2">
                                                    {new Date(review.created_at).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {review.is_verified_purchase && (
                                        <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg text-[9px] font-black border border-emerald-100 flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" />
                                            COMPRA VERIFICADA
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-500 font-medium leading-relaxed italic">
                                    "{review.comment}"
                                </p>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white/30 rounded-[2rem] border-2 border-dashed border-slate-200">
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Nenhuma avaliação ainda. Seja o primeiro!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
