'use server'

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export async function initiateChatCheckout(sellerId: string, messageContent: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        // If they want to do chat checkout, they must be logged in. 
        // We handle this via client side checks or redirecting here.
        redirect('/auth/login')
    }

    // 1. Check if a chat already exists between this buyer and seller
    let { data: chat } = await supabase
        .from('chats')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('seller_id', sellerId)
        .single()

    // 2. If it doesn't exist, create it
    if (!chat) {
        const { data: newChat, error: chatError } = await supabase
            .from('chats')
            .insert({
                buyer_id: user.id,
                seller_id: sellerId
            })
            .select('id')
            .single()

        if (chatError) {
            console.error("Error creating chat:", chatError)
            throw new Error("Failed to create chat")
        }
        chat = newChat
    }

    // 3. Insert the automated first message (the order details)
    const { error: messageError } = await supabase
        .from('messages')
        .insert({
            chat_id: chat.id,
            sender_id: user.id, // Buyer is initiating
            content: messageContent
        })

    if (messageError) {
        console.error("Error creating initial message:", messageError)
        // Even if message fails, chat exists. We might still redirect but better to throw.
        throw new Error("Failed to send initial order message")
    }

    // 4. Redirect to the newly created/existing chat room
    redirect(`/mensagens/${chat.id}`)
}
