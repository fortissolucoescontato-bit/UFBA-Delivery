export function getBaseUrl() {
    if (process.env.NEXT_PUBLIC_SITE_URL) {
        return process.env.NEXT_PUBLIC_SITE_URL
    }

    // Netlify or Vercel environment variables
    const siteUrl = process.env.URL || process.env.SITE_URL || process.env.VERCEL_URL
    if (siteUrl) return siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`

    // Default for this project as requested by the user
    if (process.env.NODE_ENV === 'production') {
        // Fallback to Vercel domain if provided, otherwise placeholder
        return process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://ufba-delivery.vercel.app'
    }


    return 'http://localhost:3000'
}
