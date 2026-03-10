'use server'

import { createClient } from "@/utils/supabase/server"
import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// Extrai JSON de uma string mesmo que venha com markdown ```json ... ```
function extractJson(text: string): any {
    // Tenta parse direto
    try { return JSON.parse(text) } catch {}
    // Remove blocos markdown ```json ... ```
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (match) {
        try { return JSON.parse(match[1].trim()) } catch {}
    }
    // Extrai o primeiro { ... } encontrado
    const obj = text.match(/\{[\s\S]*\}/)
    if (obj) {
        try { return JSON.parse(obj[0]) } catch {}
    }
    return null
}

export async function analyzeProductImage(imageInput: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("Unauthorized")

        let finalImageBase64 = imageInput

        // SSRF Protection
        if (imageInput.startsWith('http')) {
            const supabaseDomain = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xxx.supabase.co'
            const isSafeDomain =
                imageInput.startsWith(supabaseDomain) ||
                imageInput.includes('.supabase.co/storage/v1/object/public/')

            if (!isSafeDomain) {
                throw new Error("[SECURITY_BLOCK] SSRF Detectado: Apenas imagens locais da plataforma são permitidas.")
            }

            const response = await fetch(imageInput)
            const buffer = await response.arrayBuffer()
            const contentType = response.headers.get('content-type') || 'image/jpeg'
            const base64 = Buffer.from(buffer).toString('base64')
            finalImageBase64 = `data:${contentType};base64,${base64}`
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `Você é um especialista em vendas para estudantes universitários. Analise esta imagem de produto.
Responda APENAS com um JSON válido, sem markdown, sem texto extra:
{"name":"Nome curto e chamativo","description":"Descrição persuasiva de 1-2 frases para estudantes","price":0.00}`
                        },
                        {
                            type: "image_url",
                            image_url: { url: finalImageBase64 }
                        }
                    ]
                }
            ],
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            temperature: 0.3,
            max_tokens: 512,
        })

        const raw = chatCompletion.choices[0]?.message?.content || ""
        const result = extractJson(raw)

        if (!result || !result.name) {
            console.error("GROQ: Resposta não parseable:", raw)
            return { success: false, error: "A IA não retornou dados válidos." }
        }

        return { success: true, data: result }

    } catch (error: any) {
        const errorMsg = error.message || "Unknown error"
        console.error("GROQ_CRITICAL_ERROR:", error)

        if (errorMsg.includes("401") || errorMsg.includes("API key")) {
            return { success: false, error: "ERRO_AUTH: Chave de API inválida ou não configurada." }
        }
        if (errorMsg.includes("429")) {
            return { success: false, error: "ERRO_QUOTA: Limite de uso da IA atingido. Tente novamente em breve." }
        }
        if (errorMsg.includes("model")) {
            return { success: false, error: "ERRO_MODELO: Modelo de IA temporariamente indisponível." }
        }

        return { success: false, error: errorMsg }
    }
}
