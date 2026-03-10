'use server'

import { createClient } from "@/utils/supabase/server"
import { createSellerPreference } from "@/lib/mercadopago"

export async function initiateChatCheckout(
    sellerId: string, 
    messageContent: string, 
    orderTotal?: number, 
    orderTitle?: string
) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        // 1. Segurança: Precisa estar logado
        if (authError || !user) {
            console.error("ERRO_AUTH: Usuário não autenticado");
            return { error: "AUTH_REQUIRED" }
        }

        if (!sellerId || sellerId === "undefined") {
            console.error("ERRO_SELLER: ID do vendedor inválido");
            return { error: "INVALID_SELLER" }
        }

        const sanitizedMessage = messageContent.trim().substring(0, 2000);

        // 2. Tentativa de Link de Pagamento (Mercado Pago)
        let paymentLink = null;
        try {
            if (orderTotal && orderTotal > 0 && orderTitle) {
                paymentLink = await createSellerPreference(sellerId, {
                    title: orderTitle,
                    unit_price: orderTotal,
                    quantity: 1
                });
            }
        } catch (e) {
            console.warn("AVISO: Mercado Pago falhou, mas seguindo com o chat...");
        }

        // 3. Busca ou Criação do Chat Interno
        // DICA: Usamos match para garantir que o par comprador/vendedor seja único
        let { data: chat, error: selectError } = await supabase
            .from('chats')
            .select('id')
            .match({ buyer_id: user.id, seller_id: sellerId })
            .maybeSingle()

        if (selectError) {
            console.error("ERRO_SELECT_CHAT:", selectError.message);
            throw selectError;
        }

        let chatId = chat?.id

        if (!chatId) {
            console.log("Iniciando criação de novo chat...");
            const { data: newChat, error: chatError } = await supabase
                .from('chats')
                .insert({
                    buyer_id: user.id,
                    seller_id: sellerId,
                    status: 'active'
                })
                .select('id')
                .single()

            if (chatError) {
                console.error("ERRO_INSERT_CHAT:", chatError.message);
                throw chatError; // Joga para o catch principal
            }
            chatId = newChat.id
        }

        // 4. Formatação da Mensagem Interna
        const finalContent = paymentLink
            ? `${sanitizedMessage}\n\n💳 *PAGAMENTO GERADO*\nClique para pagar com PIX/Cartão:\n${paymentLink}`
            : sanitizedMessage;

        // 5. Envio da Mensagem
        console.log("Enviando mensagem para o chat:", chatId);
        const { error: messageError } = await supabase
            .from('messages')
            .insert({
                chat_id: chatId,
                sender_id: user.id,
                content: finalContent
            })

        if (messageError) {
            console.error("ERRO_INSERT_MESSAGE:", messageError.message);
            throw messageError;
        }

        return { success: true, chatId }

    } catch (error: any) {
        // ESSA PARTE É A MAIS IMPORTANTE: Revela o erro real no console do servidor
        console.error("🔴 CRITICAL_CHECKOUT_ERROR:", {
            message: error?.message || "Sem mensagem",
            code: error?.code || "Sem código",
            details: error?.details || "Sem detalhes"
        });

        // Retorna o erro detalhado para você ler na tela do celular durante o teste
        return { 
            error: `ERRO: ${error?.message || "Erro desconhecido no servidor"}` 
        }
    }
}