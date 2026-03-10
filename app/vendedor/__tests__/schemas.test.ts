import { describe, it, expect } from 'vitest'
import { productSchema, profileSchema } from '../schemas'

describe('Vendedor Schemas', () => {
    describe('productSchema', () => {
        it('should validate a correct product', () => {
            const validProduct = {
                name: 'Açaí Grande',
                price: 15.50,
                category: 'Comida'
            }
            const result = productSchema.safeParse(validProduct)
            expect(result.success).toBe(true)
        })

        it('should fail if name is too short', () => {
            const invalidProduct = {
                name: 'Oi',
                price: 10,
                category: 'Comida'
            }
            const result = productSchema.safeParse(invalidProduct)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.issues[0].message).toBe('Nome deve ter pelo menos 3 caracteres')
            }
        })

        it('should fail if price is zero or negative', () => {
            const result1 = productSchema.safeParse({ name: 'Produto', price: 0, category: 'Cat' })
            expect(result1.success).toBe(false)
            
            const result2 = productSchema.safeParse({ name: 'Produto', price: -5, category: 'Cat' })
            expect(result2.success).toBe(false)
        })

        it('should fail if name is too long', () => {
            const result = productSchema.safeParse({
                name: 'a'.repeat(101),
                price: 10,
                category: 'Cat'
            })
            expect(result.success).toBe(false)
        })
    })

    describe('profileSchema', () => {
        it('should transform null/undefined to default values', () => {
            const emptyProfile = {}
            const result = profileSchema.parse(emptyProfile)
            
            expect(result.fullName).toBe('')
            expect(result.brandColor).toBe('#f97316')
            expect(result.fontStyle).toBe('modern')
            expect(result.compactLayout).toBe(false)
        })

        it('should validate correct hex colors', () => {
            const validColors = ['#fff', '#000000', '#f97316', '#ABCDEF']
            validColors.forEach(color => {
                const result = profileSchema.safeParse({ brandColor: color })
                expect(result.success).toBe(true)
            })
        })

        it('should fail on invalid hex colors', () => {
            const invalidColors = ['red', '123456', '#zzzzzz', '#12345']
            invalidColors.forEach(color => {
                const result = profileSchema.safeParse({ brandColor: color })
                expect(result.success).toBe(false)
            })
        })

        it('should handle all optional fields correctly', () => {
            const fullProfile = {
                fullName: 'Lucas Silva',
                whatsapp: '71999999999',
                location: 'Portaria 1',
                description: 'Loja de testes',
                brandColor: '#00ff00',
                instagram: 'lucas_ufba',
                fontStyle: 'classic',
                compactLayout: true,
                mpPublicKey: 'pk_123',
                mpAccessToken: 'at_123'
            }
            const result = profileSchema.safeParse(fullProfile)
            expect(result.success).toBe(true)
            expect(result.data).toEqual(fullProfile)
        })

        it('should enforce character limits', () => {
            expect(profileSchema.safeParse({ description: 'a'.repeat(501) }).success).toBe(false)
            expect(profileSchema.safeParse({ fullName: 'a'.repeat(101) }).success).toBe(false)
            expect(profileSchema.safeParse({ whatsapp: 'a'.repeat(16) }).success).toBe(false)
        })
    })
})
