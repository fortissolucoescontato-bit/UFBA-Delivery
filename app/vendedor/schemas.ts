import { z } from 'zod'

export const productSchema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
    price: z.number().positive("Preço deve ser maior que zero"),
    category: z.string().min(1).max(50),
})

export const profileSchema = z.object({
    fullName: z.string().max(100).nullable().optional().transform(v => v || ''),
    whatsapp: z.string().max(15).nullable().optional().transform(v => v || ''),
    location: z.string().max(200).nullable().optional().transform(v => v || ''),
    description: z.string().max(500).nullable().optional().transform(v => v || ''),
    brandColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Cor inválida").nullable().optional().transform(v => v || '#f97316'),
    instagram: z.string().max(30).nullable().optional().transform(v => v || ''),
    fontStyle: z.string().nullable().optional().transform(v => v || 'modern'),
    compactLayout: z.boolean().nullable().optional().transform(v => !!v),
    mpPublicKey: z.string().nullable().optional().transform(v => v || ''),
    mpAccessToken: z.string().nullable().optional().transform(v => v || ''),
})
