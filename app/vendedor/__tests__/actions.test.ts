import { updateProfile, deleteProduct, toggleOnlineStatus, updateLocation, editProduct, createElitePlanPreference, createBoostPreference } from '../actions'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

vi.mock('@/lib/mercadopago', () => ({
    createAdminPreference: vi.fn(async () => 'http://checkout.url')
}))

vi.mock('@/utils/supabase/server', () => ({
    createClient: vi.fn(),
}))

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}))

describe('Seller Actions', () => {
    let supabaseMock: any

    beforeEach(() => {
        vi.clearAllMocks()
        supabaseMock = {
            auth: {
                getUser: vi.fn(async () => ({ data: { user: { id: 'user123' } }, error: null })),
            },
            from: vi.fn().mockReturnThis(),
            update: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            delete: vi.fn().mockReturnThis(),
            select: vi.fn().mockReturnThis(),
            single: vi.fn().mockImplementation(async () => ({ data: { role: 'seller' }, error: null })),
            storage: {
                from: vi.fn().mockReturnThis(),
                upload: vi.fn(async () => ({ data: { path: 'path/to/img' }, error: null })),
                getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'http://img.url' } })),
            },
        }
        ;(createClient as any).mockResolvedValue(supabaseMock)
    })

    describe('deleteProduct', () => {
        it('returns early if productId is missing', async () => {
            const formData = new FormData()
            await deleteProduct(formData)
            expect(supabaseMock.from).not.toHaveBeenCalled()
        })

        it('redirects to login if not authenticated', async () => {
            supabaseMock.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
            const formData = new FormData()
            formData.append('productId', 'p1')
            await expect(deleteProduct(formData)).rejects.toThrow('NEXT_REDIRECT: /auth/login')
        })

        it('denies access if not a seller', async () => {
            supabaseMock.single.mockResolvedValueOnce({ data: { role: 'user' }, error: null })
            const formData = new FormData()
            formData.append('productId', 'p1')
            await expect(deleteProduct(formData)).rejects.toThrow('NEXT_REDIRECT: /vendedor/dashboard?error=acesso_negado')
        })

        it('deletes product successfully', async () => {
            const formData = new FormData()
            formData.append('productId', 'p1')
            await expect(deleteProduct(formData)).rejects.toThrow('NEXT_REDIRECT: /vendedor/dashboard')
            expect(supabaseMock.delete).toHaveBeenCalled()
        })

        it('logs and redirects on delete error', async () => {
            supabaseMock.delete.mockReturnValueOnce({ eq: vi.fn().mockReturnValueOnce({ eq: vi.fn().mockResolvedValueOnce({ error: { message: 'Err' } }) }) })
            const formData = new FormData()
            formData.append('productId', 'p1')
            const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
            await expect(deleteProduct(formData)).rejects.toThrow('NEXT_REDIRECT: /vendedor/dashboard?error=delete_failed')
            expect(spy).toHaveBeenCalled()
            spy.mockRestore()
        })
    })

    describe('updateProfile', () => {
        it('redirects to login if no user', async () => {
            supabaseMock.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
            await expect(updateProfile(new FormData())).rejects.toThrow('NEXT_REDIRECT: /auth/login')
        })

        it('denies access if not a seller or admin', async () => {
             supabaseMock.single.mockResolvedValueOnce({ data: { role: 'user' }, error: null })
             await expect(updateProfile(new FormData())).rejects.toThrow('NEXT_REDIRECT: /vendedor/dashboard?error=acesso_negado')
        })

        it('updates profile data correctly with pix key', async () => {
            const formData = new FormData()
            formData.append('whatsapp', '5511999999999')
            formData.append('fullName', 'Lucas')
            formData.append('pix_key', 'test@pix.com')
            await expect(updateProfile(formData)).rejects.toThrow('NEXT_REDIRECT: /vendedor/perfil?success=true')
            expect(supabaseMock.update).toHaveBeenCalledWith(expect.objectContaining({ pix_key: 'test@pix.com' }))
        })

        it('handles banner removal', async () => {
            const formData = new FormData()
            formData.append('remove_banner', 'true')
            await expect(updateProfile(formData)).rejects.toThrow('NEXT_REDIRECT: /vendedor/perfil?success=true')
            expect(supabaseMock.update).toHaveBeenCalledWith(expect.objectContaining({ store_banner_url: null }))
        })

        it('handles avatar removal', async () => {
            const formData = new FormData()
            formData.append('remove_avatar', 'true')
            await expect(updateProfile(formData)).rejects.toThrow('NEXT_REDIRECT: /vendedor/perfil?success=true')
            expect(supabaseMock.update).toHaveBeenCalledWith(expect.objectContaining({ avatar_url: null }))
        })

        it('updates Mercado Pago credentials', async () => {
            const formData = new FormData()
            formData.append('mpPublicKey', 'APP_USR-123')
            formData.append('mpAccessToken', 'TEST-456')
            await expect(updateProfile(formData)).rejects.toThrow('NEXT_REDIRECT: /vendedor/perfil?success=true')
            expect(supabaseMock.update).toHaveBeenCalledWith(expect.objectContaining({
                mp_public_key: 'APP_USR-123',
                mp_access_token: 'TEST-456'
            }))
        })

        it('updates with color validation', async () => {
            const formData = new FormData()
            formData.append('brandColor', 'invalid')
            await expect(updateProfile(formData)).rejects.toThrow('NEXT_REDIRECT: /vendedor/perfil?success=true')
            expect(supabaseMock.update).toHaveBeenCalledWith(expect.objectContaining({ brand_color: '#f97316' }))
        })

        it('updates with valid hex color', async () => {
            const formData = new FormData()
            formData.append('brandColor', '#000000')
            await expect(updateProfile(formData)).rejects.toThrow('NEXT_REDIRECT: /vendedor/perfil?success=true')
            expect(supabaseMock.update).toHaveBeenCalledWith(expect.objectContaining({ brand_color: '#000000' }))
        })

        it('returns early in uploadImage if file size is zero', async () => {
             const formData = new FormData()
             const emptyFile = new File([], 'empty.png', { type: 'image/png' })
             formData.append('avatar', emptyFile)
             await expect(updateProfile(formData)).rejects.toThrow('NEXT_REDIRECT: /vendedor/perfil?success=true')
             expect(supabaseMock.storage.upload).not.toHaveBeenCalled()
        })

        it('handles image upload securely (avatar and banner)', async () => {
            const formData = new FormData()
            const png = new File([new Uint8Array([0x89, 0x50, 0x4E, 0x47])], 'a.png', { type: 'image/png' })
            formData.append('avatar', png)
            formData.append('banner', png)
            await expect(updateProfile(formData)).rejects.toThrow('NEXT_REDIRECT: /vendedor/perfil?success=true')
            expect(supabaseMock.storage.upload).toHaveBeenCalledTimes(2)
        })

        it('logs error if uploadImage fails', async () => {
             const formData = new FormData()
             const png = new File([new Uint8Array([0x89, 0x50, 0x4E, 0x47])], 'a.png', { type: 'image/png' })
             formData.append('avatar', png)
             supabaseMock.storage.upload.mockResolvedValueOnce({ error: { message: 'Err' } })
             const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
             await expect(updateProfile(formData)).rejects.toThrow('NEXT_REDIRECT: /vendedor/perfil?success=true')
             expect(spy).toHaveBeenCalled()
             spy.mockRestore()
        })

        it('returns early if file is too large', async () => {
            const formData = new FormData()
            const large = new File([new Uint8Array(6 * 1024 * 1024)], 'l.png', { type: 'image/png' })
            formData.append('avatar', large)
            const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
            await expect(updateProfile(formData)).rejects.toThrow('NEXT_REDIRECT: /vendedor/perfil?success=true')
            expect(spy).toHaveBeenCalledWith(expect.stringContaining('too large'))
            spy.mockRestore()
        })

        it('returns early if file type is invalid', async () => {
            const formData = new FormData()
            const txt = new File(['hi'], 'h.txt', { type: 'text/plain' })
            formData.append('avatar', txt)
            const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
            await expect(updateProfile(formData)).rejects.toThrow('NEXT_REDIRECT: /vendedor/perfil?success=true')
            expect(spy).toHaveBeenCalledWith(expect.stringContaining('Invalid file type'))
            spy.mockRestore()
        })

        it('returns early if magic bytes mismatch', async () => {
            const formData = new FormData()
            const fake = new File([new Uint8Array([0,0,0,0])], 'f.png', { type: 'image/png' })
            formData.append('avatar', fake)
            const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
            await expect(updateProfile(formData)).rejects.toThrow('NEXT_REDIRECT: /vendedor/perfil?success=true')
            expect(spy).toHaveBeenCalledWith(expect.stringContaining('Magic bytes mismatch'))
            spy.mockRestore()
        })

        it('logs and redirects if db update fails', async () => {
            supabaseMock.eq.mockReturnValueOnce(supabaseMock).mockResolvedValueOnce({ error: { message: 'Err' } })
            const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
            await expect(updateProfile(new FormData())).rejects.toThrow('NEXT_REDIRECT: /vendedor/perfil?error=db_error')
            spy.mockRestore()
        })
    })

    describe('toggleOnlineStatus', () => {
        it('returns early if no user', async () => {
            supabaseMock.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
            await toggleOnlineStatus(true)
            expect(supabaseMock.from).not.toHaveBeenCalled()
        })

        it('updates status successfully', async () => {
            await toggleOnlineStatus(true)
            expect(supabaseMock.update).toHaveBeenCalledWith({ is_online: true })
            expect(revalidatePath).toHaveBeenCalledWith('/vendedor/dashboard')
        })

        it('logs error if toggle fails', async () => {
            supabaseMock.eq.mockResolvedValueOnce({ error: { message: 'Err' } })
            const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
            await toggleOnlineStatus(true)
            expect(spy).toHaveBeenCalled()
            spy.mockRestore()
        })
    })

    describe('updateLocation', () => {
        it('returns early if no user', async () => {
            supabaseMock.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
            await updateLocation('Loc')
            expect(supabaseMock.from).not.toHaveBeenCalled()
        })

        it('updates location successfully', async () => {
            await updateLocation('New Loc')
            expect(supabaseMock.update).toHaveBeenCalledWith({ current_location: 'New Loc' })
            expect(revalidatePath).toHaveBeenCalledWith('/vendedor/dashboard')
        })

        it('logs error if db update fails', async () => {
            supabaseMock.eq.mockResolvedValueOnce({ error: { message: 'Err' } })
            const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
            await updateLocation('Loc')
            expect(spy).toHaveBeenCalled()
            spy.mockRestore()
        })
    })

    describe('editProduct', () => {
        it('updates product successfully', async () => {
            const formData = new FormData()
            formData.append('productId', 'p1')
            formData.append('name', 'Produto Novo')
            formData.append('price', '10')
            formData.append('category', 'Comida')
            await expect(editProduct(formData)).rejects.toThrow('NEXT_REDIRECT: /vendedor/dashboard')
            expect(supabaseMock.from).toHaveBeenCalledWith('products')
            expect(revalidatePath).toHaveBeenCalledWith('/vendedor/dashboard')
        })

        it('hits validation error path', async () => {
             const formData = new FormData()
             formData.append('productId', 'p1')
             formData.append('name', 'a') // Too short
             await expect(editProduct(formData)).rejects.toThrow('NEXT_REDIRECT: /vendedor/dashboard?error=validation')
        })

        it('redirects to login if no user', async () => {
            supabaseMock.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
            const formData = new FormData()
            formData.append('name', 'Test Product')
            formData.append('price', '10')
            await expect(editProduct(formData)).rejects.toThrow('NEXT_REDIRECT: /auth/login')
        })

        it('handles secure image upload', async () => {
            const formData = new FormData()
            formData.append('productId', 'p1')
            formData.append('name', 'Produto Novo')
            formData.append('price', '10')
            const png = new File([new Uint8Array([0x89, 0x50, 0x4E, 0x47])], 'a.png', { type: 'image/png' })
            formData.append('image', png)
            await expect(editProduct(formData)).rejects.toThrow('NEXT_REDIRECT: /vendedor/dashboard')
            expect(supabaseMock.storage.upload).toHaveBeenCalled()
        })

        it('blocks large image', async () => {
            const formData = new FormData()
            formData.append('name', 'Produto Novo')
            formData.append('price', '10')
            const large = new File([new Uint8Array(6 * 1024 * 1024)], 'l.png', { type: 'image/png' })
            formData.append('image', large)
            await expect(editProduct(formData)).rejects.toThrow('NEXT_REDIRECT: /vendedor/dashboard?error=upload_blocked_size')
        })

        it('blocks invalid type', async () => {
            const formData = new FormData()
            formData.append('name', 'Produto Novo')
            formData.append('price', '10')
            const txt = new File(['hi'], 'h.txt', { type: 'text/plain' })
            formData.append('image', txt)
            await expect(editProduct(formData)).rejects.toThrow('NEXT_REDIRECT: /vendedor/dashboard?error=upload_blocked_type')
        })

        it('blocks invalid magic numbers', async () => {
            const formData = new FormData()
            formData.append('name', 'Produto Novo')
            formData.append('price', '10')
            const fake = new File([new Uint8Array([0,0,0,0])], 'f.png', { type: 'image/png' })
            formData.append('image', fake)
            await expect(editProduct(formData)).rejects.toThrow('NEXT_REDIRECT: /vendedor/dashboard?error=upload_blocked_invalid')
        })

        it('logs and redirects on db error', async () => {
            supabaseMock.from.mockReturnValueOnce({ update: vi.fn().mockReturnValueOnce({ eq: vi.fn().mockReturnValueOnce({ eq: vi.fn().mockResolvedValueOnce({ error: { message: 'Err' } }) }) }) })
            const formData = new FormData()
            formData.append('productId', 'p1')
            formData.append('name', 'Produto Novo')
            formData.append('price', '10')
            const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
            await expect(editProduct(formData)).rejects.toThrow('NEXT_REDIRECT: /vendedor/dashboard?error=db_failed')
            expect(spy).toHaveBeenCalled()
            spy.mockRestore()
        })

        it('handles upload failure silently in editProduct', async () => {
            const formData = new FormData()
            formData.append('productId', 'p1')
            formData.append('name', 'Produto Novo')
            formData.append('price', '10')
            const png = new File([new Uint8Array([0x89, 0x50, 0x4E, 0x47])], 'a.png', { type: 'image/png' })
            formData.append('image', png)
            
            // Mock storage upload failure
            supabaseMock.storage.upload.mockResolvedValueOnce({ error: { message: 'Storage Error' } })
            
            await expect(editProduct(formData)).rejects.toThrow('NEXT_REDIRECT: /vendedor/dashboard')
            // Image should not be in update data
            expect(supabaseMock.update).not.toHaveBeenCalledWith(expect.objectContaining({ image: expect.any(String) }))
        })
    })

    describe('Payment Actions', () => {
        it('createElitePlanPreference returns url', async () => {
            const res = await createElitePlanPreference() as any
            expect(res.url).toBe('http://checkout.url')
        })

        it('createBoostPreference returns url', async () => {
            const res = await createBoostPreference('p1') as any
            expect(res.url).toBe('http://checkout.url')
        })

        it('createElitePlanPreference redirects if no user', async () => {
            supabaseMock.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
            await expect(createElitePlanPreference()).rejects.toThrow('NEXT_REDIRECT: /auth/login')
        })

        it('createBoostPreference redirects if no user', async () => {
            supabaseMock.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })
            await expect(createBoostPreference('p1')).rejects.toThrow('NEXT_REDIRECT: /auth/login')
        })

        it('createElitePlanPreference handles error', async () => {
            const mp = await import('@/lib/mercadopago')
            ;(mp.createAdminPreference as any).mockRejectedValueOnce(new Error('Err'))
            const res = await createElitePlanPreference() as any
            expect(res.error).toBeDefined()
        })

        it('createBoostPreference handles error', async () => {
            const mp = await import('@/lib/mercadopago')
            ;(mp.createAdminPreference as any).mockRejectedValueOnce(new Error('Err'))
            const res = await createBoostPreference('p1') as any
            expect(res.error).toBeDefined()
        })
    })
})
