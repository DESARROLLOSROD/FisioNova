import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    const getBaseUrl = () => {
        const forwardedHost = request.headers.get('x-forwarded-host')
        if (process.env.NODE_ENV === 'development') return origin
        if (forwardedHost) return `https://${forwardedHost}`
        return (process.env.NEXT_PUBLIC_SITE_URL || origin).replace(/\/+$/, '')
    }

    const baseUrl = getBaseUrl()

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(`${baseUrl}${next}`)
        }
    }

    // return the user to login with error message
    return NextResponse.redirect(`${baseUrl}/login?error=auth-code-error`)
}
