import { createClient } from "@/utils/supabase/server"
import { notFound, redirect } from "next/navigation"
import { ChatInterface } from "./ChatInterface"

export default async function ChatRoomPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/auth/login')

    const chatId = (await params).id

    // Fetch chat details (participants and PIX key of seller)
    const { data: chat, error: chatError } = await supabase
        .from('chats')
        .select(`
            id,
            buyer:buyer_id(id, full_name, avatar_url),
            seller:seller_id(id, full_name, avatar_url, pix_key)
        `)
        .eq('id', chatId)
        .single()

    if (chatError || !chat) return notFound()

    // Handle potential array results from join (depending on nested query interpretation)
    const buyerProfile = Array.isArray(chat.buyer) ? chat.buyer[0] : chat.buyer
    const sellerProfile = Array.isArray(chat.seller) ? chat.seller[0] : chat.seller

    if (!buyerProfile || !sellerProfile) return notFound()

    // Safety check: is user a participant?
    if (buyerProfile.id !== user.id && sellerProfile.id !== user.id) {
        return redirect('/mensagens')
    }

    // Fetch initial messages
    const { data: initialMessages } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })

    const isBuyer = buyerProfile.id === user.id
    const otherPerson = isBuyer ? sellerProfile : buyerProfile

    return (
        <ChatInterface
            chatId={chatId}
            currentUser={user}
            otherPerson={otherPerson}
            initialMessages={initialMessages || []}
            pixKey={isBuyer ? (sellerProfile as any).pix_key : null}
        />
    )
}
