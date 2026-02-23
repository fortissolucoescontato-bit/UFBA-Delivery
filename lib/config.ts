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
