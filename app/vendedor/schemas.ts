import { z } from 'zod'

export const productSchema = z.object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
    price: z.number().positive("Preço deve ser maior que zero"),
    category: z.string().min(1).max(50),
})

export const profileSchema = z.object({
    fullName: z.string().min(3, "Nome muito curto").max(100),
    whatsapp: z.string().min(10, "Telefone inválido").max(15).regex(/^\d+$/, "Apenas números"),
    location: z.string().min(3).max(200),
    description: z.string().max(500),
    brandColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Cor inválida"),
    instagram: z.string().max(30).optional(),
    fontStyle: z.enum(['modern', 'classic', 'bold', 'playful']),
    compactLayout: z.boolean(),
})
