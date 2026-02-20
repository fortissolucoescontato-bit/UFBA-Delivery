import { updateProfile, deleteProduct, toggleOnlineStatus, updateLocation, editProduct } from '../actions'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Os mocks globais agora estão no tests/setup.ts

// Mock de supabase
vi.mock('@/utils/supabase/server', () => ({
    createClient: vi.fn(),
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
            single: vi.fn(async () => ({ data: {}, error: null })),
            storage: {
                from: vi.fn().mockReturnThis(),
                upload: vi.fn(async () => ({ data: { path: 'path/to/img' }, error: null })),
                getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'http://img.url' } })),
            },
        }
            ; (createClient as any).mockResolvedValue(supabaseMock)
    })

    describe('updateProfile', () => {
        it('redirects to login if user is not authenticated', async () => {
            supabaseMock.auth.getUser.mockResolvedValue({ data: { user: null }, error: null })

            const formData = new FormData()
            formData.append('whatsapp', '123')
            formData.append('fullName', 'Test')

            await expect(updateProfile(formData)).rejects.toThrow('NEXT_REDIRECT: /auth/login')
        })

        it('redirects with error if missing fields', async () => {
            const formData = new FormData()
            await expect(updateProfile(formData)).rejects.toThrow('NEXT_REDIRECT: /vendedor/perfil?error=missing_fields')
        })

        it('updates profile data correctly without images', async () => {
            const formData = new FormData()
            formData.append('whatsapp', '5511999999999')
            formData.append('fullName', 'Lucas')
            formData.append('location', 'UFBA')
            formData.append('description', 'Loja legal')
            formData.append('brandColor', '#ff0000')
            formData.append('instagram', 'ufba')
            formData.append('compactLayout', 'true')
            formData.append('fontStyle', 'classic')

            await expect(updateProfile(formData)).rejects.toThrow('NEXT_REDIRECT: /vendedor/perfil?success=true')

            expect(supabaseMock.from).toHaveBeenCalledWith('profiles')
            expect(supabaseMock.update).toHaveBeenCalled()
        })

        it('handles image uploads if provided', async () => {
            const formData = new FormData()
            formData.append('whatsapp', '5511999999999')
            formData.append('fullName', 'Lucas')
            formData.append('location', 'UFBA')
            formData.append('description', 'Loja legal')
            formData.append('brandColor', '#ff0000')
            formData.append('instagram', 'ufba')
            formData.append('compactLayout', 'true')
            formData.append('fontStyle', 'classic')

            const mockFile = new File(['blob-content'], 'avatar.png', { type: 'image/png' })
            formData.append('avatar', mockFile)

            await expect(updateProfile(formData)).rejects.toThrow('NEXT_REDIRECT: /vendedor/perfil?success=true')

            expect(supabaseMock.storage.from).toHaveBeenCalledWith('avatars')
            expect(supabaseMock.storage.upload).toHaveBeenCalled()
            expect(supabaseMock.update).toHaveBeenCalledWith(expect.objectContaining({
                avatar_url: 'http://img.url',
                full_name: 'Lucas',
                whatsapp: '5511999999999'
            }))
        })
    })

    describe('deleteProduct', () => {
        it('does nothing if productId is missing', async () => {
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

        it('deletes product correctly', async () => {
            const formData = new FormData()
            formData.append('productId', 'p1')
            await deleteProduct(formData)
            expect(supabaseMock.from).toHaveBeenCalledWith('products')
            expect(supabaseMock.delete).toHaveBeenCalled()
            expect(supabaseMock.eq).toHaveBeenCalledWith('id', 'p1')
            expect(supabaseMock.eq).toHaveBeenCalledWith('seller_id', 'user123')
        })
    })

    describe('toggleOnlineStatus', () => {
        it('updates status correctly', async () => {
            await toggleOnlineStatus(true)
            expect(supabaseMock.from).toHaveBeenCalledWith('profiles')
            expect(supabaseMock.update).toHaveBeenCalledWith({ is_online: true })
        })
    })

    describe('updateLocation', () => {
        it('updates location correctly', async () => {
            await updateLocation('New Location')
            expect(supabaseMock.from).toHaveBeenCalledWith('profiles')
            expect(supabaseMock.update).toHaveBeenCalledWith({ current_location: 'New Location' })
        })
    })

    describe('editProduct', () => {
        it('redirects with error if missing fields', async () => {
            const formData = new FormData()
            await expect(editProduct(formData)).rejects.toThrow('NEXT_REDIRECT: /vendedor/dashboard?error=missing_fields')
        })

        it('updates product data correctly', async () => {
            const formData = new FormData()
            formData.append('productId', 'p1')
            formData.append('name', 'Novo Nome')
            formData.append('price', '10.50')
            formData.append('category', 'Comida')

            await expect(editProduct(formData)).rejects.toThrow('NEXT_REDIRECT: /vendedor/dashboard')

            expect(supabaseMock.from).toHaveBeenCalledWith('products')
            expect(supabaseMock.update).toHaveBeenCalledWith(expect.objectContaining({
                name: 'Novo Nome',
                price: 10.5,
                category: 'Comida'
            }))
        })
    })
})
