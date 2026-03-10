/**
 * Centralized platform configuration.
 * These values can be overridden via environment variables for white-labeling.
 */

export const config = {
    // Platform Identity
    siteName: process.env.NEXT_PUBLIC_SITE_NAME || "UFBA Delivery",
    siteSubtitle: process.env.NEXT_PUBLIC_SITE_SUBTITLE || "Campus Digital",
    siteDescription: process.env.NEXT_PUBLIC_SITE_DESCRIPTION || "O marketplace da comunidade acadêmica.",

    // Contact Info
    adminWhatsApp: process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "5571996381954",
    adminWhatsAppMessage: process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_MESSAGE || "Olá, gostaria de saber mais sobre o marketplace.",

    // Geographical / Physical Context
    defaultLocations: (process.env.NEXT_PUBLIC_LOCATIONS || "Bloco A,Bloco B,Biblioteca,Praça Central,Entrada Principal").split(","),

    // Feature Flags (Optional expansion)
    enableRegistration: process.env.NEXT_PUBLIC_ENABLE_REGISTRATION !== "false",

    // Analytics
    clarityProjectId: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || "",

    // Categories (Universal with Subsections)
    categories: [
        {
            id: "Comida",
            icon: "🍴",
            subcategories: ["Lanches", "Doces", "Bebidas", "Almoço", "Saudável", "Outros"]
        },
        {
            id: "Roupas",
            icon: "👕",
            subcategories: ["Masculino", "Feminino", "Acessórios", "Calçados"]
        },
        {
            id: "Eletrônicos",
            icon: "📱",
            subcategories: ["Celulares", "Informática", "Áudio", "Gamer"]
        },
        {
            id: "Serviços",
            icon: "🛠️",
            subcategories: ["Aulas", "Fretes", "Reparos", "Design"]
        },
        {
            id: "Beleza",
            icon: "✨",
            subcategories: ["Maquiagem", "Cabelo", "Perfumes"]
        },
        {
            id: "Outros",
            icon: "📦",
            subcategories: ["Geral"]
        },
    ],
}


/**
 * Helper to generate WhatsApp links
 */
export function getAdminWhatsAppLink(customMessage?: string) {
    const baseUrl = "https://wa.me/"
    const phone = config.adminWhatsApp.replace(/\D/g, "")
    const message = encodeURIComponent(customMessage || config.adminWhatsAppMessage)
    return `${baseUrl}${phone}?text=${message}`
}
