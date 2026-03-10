'use server'

import { createClient } from "@/utils/supabase/server"
import { z } from "zod"
import { revalidatePath } from "next/cache"

export async function sendMessage(chatId: string, content: string) {
    if (!content.trim()) return

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    const messageSchema = z.string().min(1).max(2000)
    const validated = messageSchema.safeParse(content)

    if (!validated.success) {
        throw new Error("Mensagem inválida ou muito longa.")
    }

    const { data: recentMessages } = await supabase
        .from('messages')
        .select('created_at')
        .eq('sender_id', user.id)
        .gte('created_at', new Date(Date.now() - 60000).toISOString())
        .order('created_at', { ascending: false })

    if (recentMessages && recentMessages.length >= 10) {
        throw new Error('Limite de mensagens excedido. Aguarde 1 minuto.');
    }

    const sanitizedContent = content.trim().substring(0, 2000);

    const { error } = await supabase
        .from('messages')
        .insert({
            chat_id: chatId,
            sender_id: user.id,
            content: sanitizedContent
        })

    if (error) {
        console.error("Error sending message:", { code: error.code });
        throw new Error("Failed to send message")
    }

    revalidatePath(`/mensagens/${chatId}`)
    revalidatePath('/mensagens')
}
