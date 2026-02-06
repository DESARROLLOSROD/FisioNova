import { Resend } from 'resend'

const resendKey = process.env.RESEND_API_KEY
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

let resend: Resend | null = null

if (resendKey) {
    resend = new Resend(resendKey)
}

export async function sendEmail(to: string, subject: string, html: string) {
    if (!resend) {
        console.warn('Resend client not initialized. Missing environment variables.')
        // Return simulated success in dev if needed, or failure
        return { success: false, error: 'Resend not configured' }
    }

    try {
        const data = await resend.emails.send({
            from: fromEmail,
            to: to,
            subject: subject,
            html: html
        })
        return { success: true, data }
    } catch (error: any) {
        console.error('Error sending Email:', error)
        return { success: false, error: error.message }
    }
}
