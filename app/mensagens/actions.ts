'use server'

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function sendMessage(chatId: string, content: string) {
    if (!content.trim()) return

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error("Unauthorized")

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
