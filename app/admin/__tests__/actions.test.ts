import { approveSeller, blockSeller } from '../actions'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

vi.mock('@/utils/supabase/server', () => ({
    createClient: vi.fn(),
}))

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

describe('Admin Actions', () => {
    let supabaseMock: any

    beforeEach(() => {
        vi.clearAllMocks()

        // Mock chainable implementation
        const chain = {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            single: vi.fn().mockImplementation(() => Promise.resolve({ data: { role: 'admin' }, error: null })),
            // This is the trick: the final then() or direct await must return the result
            then: vi.fn().mockImplementation((onFulfilled) => onFulfilled({ data: { role: 'admin' }, error: null }))
        }

        // Specifically for the update().eq() call which returns { error: null }
        const updateChain = {
            eq: vi.fn().mockImplementation(() => Promise.resolve({ error: null })),
            then: vi.fn().mockImplementation((onFulfilled) => onFulfilled({ error: null }))
        }

        supabaseMock = {
            auth: {
                getUser: vi.fn(async () => ({ data: { user: { id: 'admin123' } }, error: null })),
            },
            from: vi.fn().mockImplementation((table) => {
                if (table === 'profiles') return chain
                return chain
            }),
        }

        // Override the select chain specifically to support update()
        chain.update = vi.fn().mockReturnValue(updateChain)

            ; (createClient as any).mockResolvedValue(supabaseMock)
    })

    describe('approveSeller', () => {
        it('prevents non-admins from approving', async () => {
            // Mock the first single() call for permissions
            const permChain = {
                select: vi.fn().mockReturnThis(),
                eq: vi.fn().mockReturnThis(),
                single: vi.fn().mockResolvedValue({ data: { role: 'seller' }, error: null })
            }
            supabaseMock.from.mockReturnValueOnce(permChain)

            const result = await approveSeller('seller123')
            expect(result).toEqual({ error: "Apenas administradores podem aprovar vendedores" })
        })

        it('approves a seller successfully', async () => {
            const result = await approveSeller('seller123')
            expect(result).toEqual({ success: true })
            expect(supabaseMock.from).toHaveBeenCalledWith('profiles')
            expect(revalidatePath).toHaveBeenCalledWith('/admin/vendedores')
        })
    })

    describe('blockSeller', () => {
        it('blocks a seller successfully', async () => {
            const result = await blockSeller('seller123')
            expect(result).toEqual({ success: true })
            expect(revalidatePath).toHaveBeenCalledWith('/admin/vendedores')
        })
    })
})
