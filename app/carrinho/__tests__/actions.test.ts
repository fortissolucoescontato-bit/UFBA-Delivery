import { initiateChatCheckout } from '../actions'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { createClient } from '@/utils/supabase/server'

vi.mock('@/utils/supabase/server', () => ({
    createClient: vi.fn(),
}))

describe('initiateChatCheckout action', () => {
    let supabaseMock: any

    beforeEach(() => {
        vi.clearAllMocks()
        supabaseMock = {
            auth: {
                getUser: vi.fn(async () => ({ data: { user: { id: 'buyer123' } }, error: null })),
            },
            from: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn(),
            insert: vi.fn().mockReturnThis(),
        }
            ; (createClient as any).mockResolvedValue(supabaseMock)
    })

    it('redirects to login if user is not authenticated', async () => {
        supabaseMock.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
        await expect(initiateChatCheckout('seller123', 'Order info')).rejects.toThrow('NEXT_REDIRECT: /auth/login')
    })

    it('uses existing chat if it exists', async () => {
        supabaseMock.single.mockResolvedValueOnce({ data: { id: 'chat123' }, error: null }) // Chat exists

        await expect(initiateChatCheckout('seller123', 'Order info')).rejects.toThrow('NEXT_REDIRECT: /mensagens/chat123')

        expect(supabaseMock.from).toHaveBeenCalledWith('chats')
        // Note: This logic depends on the mock behavior of from().insert(). 
        // Since from() returns this, we check calls.
        expect(supabaseMock.from).toHaveBeenCalledWith('messages')
        expect(supabaseMock.insert).toHaveBeenCalledWith(expect.objectContaining({
            chat_id: 'chat123',
            content: 'Order info'
        }))
    })

    it('creates a new chat if it does not exist', async () => {
        supabaseMock.single
            .mockResolvedValueOnce({ data: null, error: null }) // Chat not found (select)
            .mockResolvedValueOnce({ data: { id: 'newChat456' }, error: null }) // New chat created (insert)

        await expect(initiateChatCheckout('seller123', 'Order info')).rejects.toThrow('NEXT_REDIRECT: /mensagens/newChat456')

        expect(supabaseMock.from).toHaveBeenCalledWith('chats')
        expect(supabaseMock.insert).toHaveBeenCalledWith({
            buyer_id: 'buyer123',
            seller_id: 'seller123'
        })
    })

    it('throws error if chat creation fails', async () => {
        supabaseMock.single.mockResolvedValueOnce({ data: null, error: null }) // Chat not found (select)

        // Simulate insert failure
        supabaseMock.insert = vi.fn().mockReturnValueOnce({
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValueOnce({ data: null, error: { message: 'DB Error' } })
        })

        await expect(initiateChatCheckout('seller123', 'Order info')).rejects.toThrow('Failed to create chat')
    })

    it('throws error if message insertion fails', async () => {
        supabaseMock.single.mockResolvedValueOnce({ data: { id: 'chat123' }, error: null }) // Chat exists

        // First insert (for chat creation - if it was needed, but here it won't be called)
        // Second insert (for message)
        supabaseMock.from = vi.fn().mockImplementation((table) => {
            if (table === 'messages') {
                return {
                    insert: vi.fn().mockResolvedValueOnce({ error: { message: 'Message Error' } })
                }
            }
            return supabaseMock
        })

        await expect(initiateChatCheckout('seller123', 'Order info')).rejects.toThrow('Failed to send initial order message')
    })
})
