'use client'

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Copy, Send, Check } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { sendMessage } from "../actions"
import { toast } from "sonner"

interface Message {
    id: string
    chat_id: string
    sender_id: string
    content: string
    created_at: string
}

interface ChatInterfaceProps {
    chatId: string
    currentUser: any
    otherPerson: any
    initialMessages: Message[]
    pixKey: string | null
}

export function ChatInterface({ chatId, currentUser, otherPerson, initialMessages, pixKey }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages)
    const [newMessage, setNewMessage] = useState("")
    const [isSending, setIsSending] = useState(false)
    const [copied, setCopied] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()

    // Scroll to bottom
    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Subscription to Realtime messages
    useEffect(() => {
        const channel = supabase
            .channel(`chat:${chatId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `chat_id=eq.${chatId}`
                },
                (payload) => {
                    const newMsg = payload.new as Message
                    setMessages((prev) => {
                        // Avoid duplicates if also updated by optimistic UI
                        if (prev.find(m => m.id === newMsg.id)) return prev
                        return [...prev, newMsg]
                    })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [chatId, supabase])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || isSending) return

        setIsSending(true)
        const content = newMessage.trim()
        setNewMessage("")

        try {
            await sendMessage(chatId, content)
            // The subscription will handle adding the message to UI
        } catch (error) {
            toast.error("Erro ao enviar mensagem")
            setNewMessage(content)
        } finally {
            setIsSending(false)
        }
    }

    const copyPix = () => {
        if (!pixKey) return
        navigator.clipboard.writeText(pixKey)
        setCopied(true)
        toast.success("Chave PIX copiada!")
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="flex flex-col h-screen bg-background max-w-2xl mx-auto border-x">
            {/* Header */}
            <header className="p-4 border-b flex items-center gap-3 sticky top-0 bg-background/80 backdrop-blur-md z-10">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/mensagens">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>

                <Avatar className="h-10 w-10 border">
                    <AvatarImage src={otherPerson.avatar_url} />
                    <AvatarFallback>{otherPerson.full_name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                    <h2 className="font-bold truncate">{otherPerson.full_name}</h2>
                    <p className="text-[10px] text-green-500 font-medium">Chat Seguro</p>
                </div>
            </header>

            {/* PIX Key Banner (Only for buyers) */}
            {pixKey && (
                <div className="p-3 bg-primary/5 border-b flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold uppercase text-primary tracking-wider">Pagar via PIX</p>
                        <p className="text-xs text-muted-foreground truncate font-mono">{pixKey}</p>
                    </div>
                    <Button size="sm" variant="outline" className="h-8 gap-2 shrink-0 border-primary/20 hover:bg-primary/10" onClick={copyPix}>
                        {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                        {copied ? "Copiado" : "Copiar"}
                    </Button>
                </div>
            )}

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20"
            >
                {messages.map((msg) => {
                    const isOwn = msg.sender_id === currentUser.id
                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${isOwn
                                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                                    : 'bg-card text-card-foreground border rounded-tl-none'
                                }`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                <p className={`text-[9px] mt-1 text-right opacity-60`}>
                                    {format(new Date(msg.created_at), "HH:mm", { locale: ptBR })}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Footer / Input */}
            <footer className="p-4 border-t bg-background sticky bottom-0">
                <form onSubmit={handleSend} className="flex gap-2">
                    <Input
                        placeholder="Digite sua mensagem..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="bg-muted border-none focus-visible:ring-primary"
                        disabled={isSending}
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim() || isSending} className="rounded-full shrink-0">
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </footer>
        </div>
    )
}
