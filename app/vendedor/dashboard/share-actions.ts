'use server'

import Groq from 'groq-sdk'
import { createClient } from '@/utils/supabase/server'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function generateStoreCaption(sellerId: string): Promise<{ success: boolean; caption?: string; error?: string }> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || user.id !== sellerId) throw new Error('Unauthorized')

        const [{ data: profile }, { data: products }] = await Promise.all([
            supabase.from('profiles').select('full_name, store_description, current_location').eq('id', sellerId).single(),
            supabase.from('products').select('name, price, category').eq('seller_id', sellerId).order('created_at', { ascending: false })
        ])

        if (!products || products.length === 0) {
            return {
                success: true,
                caption: `🏪 Confira minha loja no UFBA Delivery!\n\n🎯 Produtos selecionados especialmente para você, estudante da UFBA.\n\n📲 Acesse pelo link e entre em contato pelo WhatsApp!`
            }
        }

        const productList = products.map(p => `• ${p.name} — R$ ${Number(p.price).toFixed(2)}`).join('\n')
        const sellerName = profile?.full_name || 'Vendedor'
        const location = profile?.current_location || 'UFBA'

        const completion = await groq.chat.completions.create({
            messages: [{
                role: 'user',
                content: `Você é um especialista em marketing para vendedores universitários. Crie um texto promocional PERFEITO para o vendedor compartilhar no WhatsApp, Instagram ou outras redes sociais junto com o link da loja.

DADOS DO VENDEDOR:
- Nome: ${sellerName}
- Localização: ${location}
- Produtos disponíveis:
${productList}

REQUISITOS DO TEXTO:
1. Máximo 280 caracteres por parágrafo
2. Use emojis estrategicamente (não excessivamente)
3. Mencione 2-3 produtos específicos com preço
4. Termine com um CTA claro (ex: "Acesse o link!" ou "Chama no WhatsApp!")
5. Tom: jovem, universitário, confiante
6. Total: 3-4 parágrafos curtos

Retorne APENAS o texto, sem comentários.`
            }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 400,
        })

        const caption = completion.choices[0]?.message?.content?.trim() || ''
        if (!caption) throw new Error('Caption vazia')

        return { success: true, caption }
    } catch (error: any) {
        console.error('generateStoreCaption error:', error)
        return { success: false, error: error.message }
    }
}
