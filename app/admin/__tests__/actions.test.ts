import { approveSeller, blockSeller } from '../actions'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

vi.mock('@/utils/supabase/server', () => ({
    createClient: vi.fn(),
}))

vi.mock('@supabase/supabase-js', () => ({
    createClient: vi.fn(),
}))

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

describe('Admin Actions', () => {
    let supabaseMock: any
    let sharedChain: any

    beforeEach(() => {
        vi.clearAllMocks()
        sharedChain = {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({ data: { role: 'admin' }, error: null }),
            insert: vi.fn().mockResolvedValue({ error: null }),
        }
        
        supabaseMock = {
            auth: {
                getUser: vi.fn(async () => ({ data: { user: { id: 'admin123' } }, error: null })),
            },
            from: vi.fn().mockReturnValue(sharedChain),
        }
        ;(createClient as any).mockResolvedValue(supabaseMock)
        ;(createAdminClient as any).mockReturnValue(supabaseMock)
        
        // Mocking env vars for branch coverage
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test.com'
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'key'
    })

    describe('approveSeller', () => {
        it('returns early if sellerId is missing', async () => {
            const formData = new FormData()
            await approveSeller(formData)
            expect(createClient).not.toHaveBeenCalled()
        })

        it('throws error if user is not authenticated', async () => {
            supabaseMock.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
            const formData = new FormData()
            formData.append('sellerId', 's1')
            await expect(approveSeller(formData)).rejects.toThrow('Unauthorized')
        })

        it('throws error if user is not an admin', async () => {
            sharedChain.single.mockResolvedValueOnce({ data: { role: 'seller' }, error: null })
            const formData = new FormData()
            formData.append('sellerId', 's1')
            const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
            await expect(approveSeller(formData)).rejects.toThrow('Unauthorized')
            expect(spy).toHaveBeenCalled()
            spy.mockRestore()
        })

        it('throws error if db update fails', async () => {
            sharedChain.update.mockReturnValueOnce({ eq: vi.fn().mockResolvedValueOnce({ error: { code: 'ERR' } }) })
            const formData = new FormData()
            formData.append('sellerId', 's1')
            const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
            await expect(approveSeller(formData)).rejects.toThrow()
            expect(spy).toHaveBeenCalled()
            spy.mockRestore()
        })

        it('approves seller successfully', async () => {
            const formData = new FormData()
            formData.append('sellerId', 's1')
            await approveSeller(formData)
            expect(sharedChain.update).toHaveBeenCalledWith({ is_approved: true })
            expect(revalidatePath).toHaveBeenCalledWith('/admin/vendedores')
        })

        it('handles missing environment variables', async () => {
            delete process.env.NEXT_PUBLIC_SUPABASE_URL
            delete process.env.SUPABASE_SERVICE_ROLE_KEY
            const formData = new FormData()
            formData.append('sellerId', 's1')
            await approveSeller(formData)
        })
    })

    describe('blockSeller', () => {
        it('returns early if sellerId is missing', async () => {
            const formData = new FormData()
            await blockSeller(formData)
            expect(createClient).not.toHaveBeenCalled()
        })

        it('blocks seller successfully', async () => {
            const formData = new FormData()
            formData.append('sellerId', 's1')
            await blockSeller(formData)
            expect(sharedChain.update).toHaveBeenCalledWith({ is_approved: false })
            expect(sharedChain.insert).toHaveBeenCalledWith(expect.objectContaining({ action: 'block_seller' }))
            expect(revalidatePath).toHaveBeenCalledWith('/admin/vendedores')
        })

        it('throws error if non-admin tries to block', async () => {
             sharedChain.single.mockResolvedValueOnce({ data: { role: 'seller' }, error: null })
             const formData = new FormData()
             formData.append('sellerId', 's1')
             const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
             await expect(blockSeller(formData)).rejects.toThrow('Unauthorized')
             expect(spy).toHaveBeenCalled()
             spy.mockRestore()
        })

        it('throws error if db update fails on block', async () => {
            sharedChain.update.mockReturnValueOnce({ eq: vi.fn().mockResolvedValueOnce({ error: { code: 'ERR' } }) })
            const formData = new FormData()
            formData.append('sellerId', 's1')
            const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
            await expect(blockSeller(formData)).rejects.toThrow()
            spy.mockRestore()
        })

        it('throws error if user is not authenticated', async () => {
            supabaseMock.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
            const formData = new FormData()
            formData.append('sellerId', 's1')
            await expect(blockSeller(formData)).rejects.toThrow('Unauthorized')
        })

        it('handles missing environment variables', async () => {
            delete process.env.NEXT_PUBLIC_SUPABASE_URL
            delete process.env.SUPABASE_SERVICE_ROLE_KEY
            const formData = new FormData()
            formData.append('sellerId', 's1')
            await blockSeller(formData)
        })
    })
})
