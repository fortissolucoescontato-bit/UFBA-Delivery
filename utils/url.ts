export function getBaseUrl() {
    if (process.env.NEXT_PUBLIC_SITE_URL) {
        return process.env.NEXT_PUBLIC_SITE_URL
    }

    // Default for this project as requested by the user
    if (process.env.NODE_ENV === 'production') {
        return 'https://ufba-delivery.netlify.app'
    }

    return 'http://localhost:3000'
}
