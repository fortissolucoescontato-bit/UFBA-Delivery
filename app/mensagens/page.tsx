import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, MessageSquare, Store, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export default async function MessagesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return redirect('/auth/login')

    // Fetch all chats for the user (as buyer or seller)
    // We also join with the profile of the "other" person
    const { data: chats, error } = await supabase
        .from('chats')
        .select(`
            id,
            created_at,
            buyer:buyer_id(id, full_name, avatar_url),
            seller:seller_id(id, full_name, avatar_url),
            messages(content, created_at)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

    // Process chats to identify the "other" person
    const processedChats = (chats || []).map(chat => {
        const buyer = Array.isArray(chat.buyer) ? chat.buyer[0] : chat.buyer
        const seller = Array.isArray(chat.seller) ? chat.seller[0] : chat.seller

        if (!buyer || !seller) return null

        const isBuyer = buyer.id === user.id
        const otherPerson = isBuyer ? seller : buyer
        const lastMessage = chat.messages?.sort((a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )[0]

        return {
            id: chat.id,
            otherPerson,
            isSellerChat: !isBuyer, // If user is the seller in this chat
            lastMessage,
            createdAt: chat.created_at
        }
    }).filter(Boolean) as any[]

    return (
        <div className="min-h-screen bg-background p-4 pb-20">
            <header className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                </Button>
                <h1 className="text-xl font-bold">Minhas Conversas</h1>
            </header>

            {processedChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-center">
                    <MessageSquare className="h-16 w-16 mb-4 opacity-10" />
                    <p className="text-lg font-medium">Nenhuma mensagem ainda</p>
                    <p className="text-sm">Seus chats com vendedores aparecerão aqui.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {processedChats.map((chat) => (
                        <Link key={chat.id} href={`/mensagens/${chat.id}`}>
                            <Card className="hover:bg-muted/30 transition-colors border-border/50">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <Avatar className="h-12 w-12 border">
                                        <AvatarImage src={chat.otherPerson.avatar_url} />
                                        <AvatarFallback>
                                            {chat.otherPerson.full_name?.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="font-bold flex items-center gap-2">
                                                {chat.otherPerson.full_name}
                                                {chat.isSellerChat && (
                                                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Comprador</span>
                                                )}
                                            </h3>
                                            <span className="text-[10px] text-muted-foreground">
                                                {formatDistanceToNow(new Date(chat.lastMessage?.created_at || chat.createdAt), { addSuffix: true, locale: ptBR })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {chat.lastMessage?.content || "Iniciou uma conversa..."}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
