import { initiateChatCheckout } from '../actions'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { createClient } from '@/utils/supabase/server'

vi.mock('@/utils/supabase/server', () => ({
    createClient: vi.fn(),
}))

vi.mock('@/lib/mercadopago', () => ({
    createSellerPreference: vi.fn().mockResolvedValue('http://payment.link')
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
            maybeSingle: vi.fn(),
            insert: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
        }
        ;(createClient as any).mockResolvedValue(supabaseMock)
    })

    it('returns error if user is not authenticated', async () => {
        supabaseMock.auth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'auth error' } })
        const result = await initiateChatCheckout('seller123', 'Order info')
        expect(result).toEqual({ error: 'AUTH_REQUIRED' })
    })

    it('uses existing chat if it exists', async () => {
        supabaseMock.maybeSingle.mockResolvedValueOnce({ data: { id: 'chat123' }, error: null }) // Chat exists
        supabaseMock.insert.mockResolvedValueOnce({ error: null }) // Message insert

        const result = await initiateChatCheckout('seller123', 'Order info')
        expect(result).toEqual({ success: true, chatId: 'chat123' })
        expect(supabaseMock.from).toHaveBeenCalledWith('messages')
    })

    it('creates a new chat if it does not exist', async () => {
        supabaseMock.maybeSingle.mockResolvedValueOnce({ data: null, error: null })
        
        supabaseMock.insert = vi.fn().mockImplementation((data) => {
            if (data.buyer_id) {
                return {
                    select: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValueOnce({ data: { id: 'newChat456' }, error: null })
                }
            }
            return Promise.resolve({ error: null })
        })

        const result = await initiateChatCheckout('seller123', 'Order info')
        expect(result).toEqual({ success: true, chatId: 'newChat456' })
    })

    it('generates a payment link if total and title are provided', async () => {
        supabaseMock.maybeSingle.mockResolvedValueOnce({ data: { id: 'chat123' }, error: null })
        supabaseMock.insert.mockResolvedValueOnce({ error: null })

        const result = await initiateChatCheckout('seller123', 'Order info', 100, 'Order Title')
        expect(result).toEqual({ success: true, chatId: 'chat123' })
        expect(supabaseMock.insert).toHaveBeenCalledWith(expect.objectContaining({
            content: expect.stringContaining('http://payment.link')
        }))
    })

    it('handles Mercado Pago failure gracefully', async () => {
        const { createSellerPreference } = await import('@/lib/mercadopago')
        ;(createSellerPreference as any).mockRejectedValueOnce(new Error('MP_FAIL'))
        
        supabaseMock.maybeSingle.mockResolvedValueOnce({ data: { id: 'chat123' }, error: null })
        supabaseMock.insert.mockResolvedValueOnce({ error: null })

        const result = await initiateChatCheckout('seller123', 'Order info', 100, 'Order Title')
        expect(result).toEqual({ success: true, chatId: 'chat123' })
        expect(supabaseMock.insert).toHaveBeenCalledWith(expect.not.objectContaining({
            content: expect.stringContaining('http://payment.link')
        }))
    })

    it('handles non-Error objects caught in MP preference creation', async () => {
        const { createSellerPreference } = await import('@/lib/mercadopago')
        ;(createSellerPreference as any).mockRejectedValueOnce("NOT_AN_ERROR_OBJECT")
        
        supabaseMock.maybeSingle.mockResolvedValueOnce({ data: { id: 'chat123' }, error: null })
        supabaseMock.insert.mockResolvedValueOnce({ error: null })

        const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
        await initiateChatCheckout('seller123', 'Order info', 100, 'Order Title')
        expect(spy).toHaveBeenCalledWith(
            expect.stringContaining("MP Preference"),
            expect.objectContaining({ error: "Unknown" })
        )
        spy.mockRestore()
    })

    it('logs error if chat select fails', async () => {
        supabaseMock.maybeSingle.mockResolvedValueOnce({ data: null, error: { code: 'SELECT_ERR' } })
        supabaseMock.insert.mockResolvedValueOnce({ error: null })
        
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
        await initiateChatCheckout('seller123', 'Order info')
        expect(spy).toHaveBeenCalledWith('Chat select error:', expect.anything())
        spy.mockRestore()
    })

    it('returns internal error on critical failure', async () => {
        supabaseMock.auth.getUser.mockRejectedValueOnce(new Error('FATAL'))
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
        const result = await initiateChatCheckout('seller123', 'Order info')
        expect(result).toEqual({ error: 'INTERNAL_ERROR' })
        expect(spy).toHaveBeenCalledWith('Critical checkout error:', expect.anything())
        spy.mockRestore()
    })

    it('returns error if seller is invalid', async () => {
        const result = await initiateChatCheckout('undefined', 'Order info')
        expect(result).toEqual({ error: 'INVALID_SELLER' })
    })

    it('returns error if order total is zero or negative', async () => {
        const result = await initiateChatCheckout('seller123', 'Order info', 0, 'Order Title')
        expect(result).toEqual({ error: 'INVALID_AMOUNT' })
    })

    it('returns error if chat creation fails', async () => {
        supabaseMock.maybeSingle.mockResolvedValueOnce({ data: null, error: null }) // Chat not found (select)

        // Simulate insert failure
        supabaseMock.insert = vi.fn().mockImplementation((data) => {
            if (data.buyer_id) {
                return {
                    select: vi.fn().mockReturnThis(),
                    single: vi.fn().mockResolvedValueOnce({ data: null, error: { code: 'DB_ERR' } })
                }
            }
            return Promise.resolve({ error: null })
        })

        const result = await initiateChatCheckout('seller123', 'Order info')
        expect(result).toEqual({ error: 'CHAT_FAILED' })
    })

    it('returns error if message insertion fails', async () => {
        supabaseMock.maybeSingle.mockResolvedValueOnce({ data: { id: 'chat123' }, error: null }) // Chat exists

        supabaseMock.from = vi.fn().mockImplementation((table) => {
            if (table === 'messages') {
                return {
                    insert: vi.fn().mockResolvedValueOnce({ error: { code: 'MSG_ERR' } })
                }
            }
            return supabaseMock
        })

        const result = await initiateChatCheckout('seller123', 'Order info')
        expect(result).toEqual({ error: 'MESSAGE_FAILED' })
    })
})
