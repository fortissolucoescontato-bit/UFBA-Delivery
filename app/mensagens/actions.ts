'use server'

import { createClient } from "@/utils/supabase/server"
import { z } from "zod"
import { revalidatePath } from "next/cache"

export async function sendMessage(chatId: string, content: string) {
    if (!content.trim()) return

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

    // Hardening: Message validation
    const messageSchema = z.string().min(1).max(2000)
    const validated = messageSchema.safeParse(content)

    if (!validated.success) {
        throw new Error("Mensagem inválida ou muito longa.")
    }

    const { data: recentMessages } = await supabase
        .from('messages')
        .select('created_at')
        .eq('sender_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (recentMessages) {
        const lastMessageTime = new Date(recentMessages.created_at).getTime()
        const now = new Date().getTime()
        if (now - lastMessageTime < 1000) { // 1 second cooldown
            throw new Error("Aguarde um pouco antes de enviar outra mensagem.")
        }
    }

    // Insert the message
    const { error } = await supabase
        .from('messages')
        .insert({
            chat_id: chatId,
            sender_id: user.id,
            content: content.trim()
        })

    if (error) {
        console.error("Error sending message:", error)
        throw new Error("Failed to send message")
    }

    // No need to redirect or revalidate much here if we use realistic real-time 
    // but revalidating the inbox path is good practice
    revalidatePath(`/mensagens/${chatId}`)
    revalidatePath('/mensagens')
}
