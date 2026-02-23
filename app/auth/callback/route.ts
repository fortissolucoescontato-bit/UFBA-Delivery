import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { getBaseUrl } from '@/utils/url'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    let next = searchParams.get('next') ?? '/'

    // Explicitly handle recovery type if provided in the URL (Supabase often includes this)
    const type = searchParams.get('type')
    if (type === 'recovery') {
        next = '/auth/reset-password'
    }

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

