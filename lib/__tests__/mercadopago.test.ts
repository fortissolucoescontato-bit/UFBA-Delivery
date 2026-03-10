import { createSellerPreference, createAdminPreference } from '../mercadopago'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

// Mocks instanciáveis
const mockPreference = {
    create: vi.fn().mockResolvedValue({ init_point: 'http://checkout.url' })
}

vi.mock('mercadopago', () => {
    return {
        MercadoPagoConfig: vi.fn().mockImplementation(function () { return {}; }),
        Preference: vi.fn().mockImplementation(function () { return mockPreference; })
    }
})

vi.mock('@/utils/supabase/server', () => ({
    createClient: vi.fn(),
}))

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(),
}))

describe('MercadoPago Library', () => {
    let supabaseMock: any

    beforeEach(() => {
        vi.clearAllMocks()
        supabaseMock = {
            from: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
                data: { mp_access_token: 'token123', mp_connected: true, full_name: 'Test' },
                error: null
            }),
        }
        ; (createClient as any).mockResolvedValue(supabaseMock)
            
        // Mock the admin client (which is created via @supabase/supabase-js)
        ;(createAdminClient as any).mockReturnValue(supabaseMock)
        
        mockPreference.create.mockResolvedValue({ init_point: 'http://checkout.url' })
    })

    it('createSellerPreference creates a valid preference', async () => {
        const url = await createSellerPreference('s1', { title: 'Test', unit_price: 10, quantity: 1 })
        expect(url).toBe('http://checkout.url')
        expect(mockPreference.create).toHaveBeenCalled()
    })

    it('createAdminPreference creates a valid preference with markup', async () => {
        const url = await createAdminPreference({ title: 'Plan', unit_price: 10, quantity: 1 })
        expect(url).toBe('http://checkout.url')

        // 10 / 0.95 = 10.5263 -> Math.ceil(10.5263 * 100) / 100 = 10.53
        expect(mockPreference.create).toHaveBeenCalledWith(expect.objectContaining({
            body: expect.objectContaining({
                items: [expect.objectContaining({
                    unit_price: 10.53
                })]
            })
        }))
    })

    it('uses default statement descriptor if full_name is missing', async () => {
        supabaseMock.single.mockResolvedValueOnce({
            data: { mp_access_token: 'token123', mp_connected: true, full_name: null },
            error: null
        })
        await createSellerPreference('s1', { title: 'Test', unit_price: 10, quantity: 1 })
        expect(mockPreference.create).toHaveBeenCalledWith(expect.objectContaining({
            body: expect.objectContaining({
                statement_descriptor: 'UFBA Delivery'
            })
        }))
    })

    it('throws error if recipient not connected', async () => {
        supabaseMock.single.mockResolvedValue({ data: { mp_connected: false }, error: null })
        await expect(createSellerPreference('s1', { title: 'T', unit_price: 1, quantity: 1 }))
            .rejects.toThrow('Vendedor não configurou o Mercado Pago.')
    })

    it('logs and throws error if MP API fails in seller preference', async () => {
        mockPreference.create.mockRejectedValueOnce(new Error('MP_API_FAIL'))
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
        
        await expect(createSellerPreference('s1', { title: 'T', unit_price: 1, quantity: 1 }))
            .rejects.toThrow('MP_API_FAIL')
        
        expect(spy).toHaveBeenCalled()
        spy.mockRestore()
    })

    it('throws error if admin not connected', async () => {
        supabaseMock.single.mockResolvedValueOnce({ data: { mp_connected: false }, error: null })
        await expect(createAdminPreference({ title: 'P', unit_price: 1, quantity: 1 }))
            .rejects.toThrow('Admin não configurou o Mercado Pago para recebimento de taxas.')
    })

    it('logs and throws error if MP API fails in admin preference', async () => {
        mockPreference.create.mockRejectedValueOnce(new Error('MP_API_FAIL'))
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
        
        await expect(createAdminPreference({ title: 'P', unit_price: 1, quantity: 1 }))
            .rejects.toThrow('MP_API_FAIL')
        
        expect(spy).toHaveBeenCalled()
        spy.mockRestore()
    })
})
