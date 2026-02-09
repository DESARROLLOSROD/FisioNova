import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendAppointmentReminder } from '@/lib/notifications/service'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        // Verify cron secret
        const authHeader = request.headers.get('authorization')
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()

        // Get appointments for tomorrow (24 hours from now)
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(0, 0, 0, 0)

        const dayAfterTomorrow = new Date(tomorrow)
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)

        const { data: appointments, error } = await supabase
            .from('appointments')
            .select(`
                id,
                start_time,
                patients (
                    first_name,
                    last_name,
                    phone,
                    email
                ),
                services (
                    name
                ),
                clinics (
                    name
                )
            `)
            .gte('start_time', tomorrow.toISOString())
            .lt('start_time', dayAfterTomorrow.toISOString())
            .eq('status', 'confirmed')

        if (error) {
            console.error('Error fetching appointments:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        const results = []

        for (const apt of appointments || []) {
            const patient = apt.patients as any
            const service = apt.services as any
            const clinic = apt.clinics as any

            if (!patient || !clinic) continue

            try {
                const result = await sendAppointmentReminder({
                    patientName: `${patient.first_name} ${patient.last_name}`,
                    patientPhone: patient.phone,
                    patientEmail: patient.email,
                    clinicName: clinic.name,
                    appointmentDate: new Date(apt.start_time),
                    serviceName: service?.name || 'Consulta'
                })

                results.push({
                    appointmentId: apt.id,
                    patientName: `${patient.first_name} ${patient.last_name}`,
                    ...result
                })
            } catch (error) {
                console.error(`Error sending reminder for appointment ${apt.id}:`, error)
                results.push({
                    appointmentId: apt.id,
                    error: String(error)
                })
            }
        }

        return NextResponse.json({
            success: true,
            appointmentsProcessed: appointments?.length || 0,
            results
        })
    } catch (error) {
        console.error('Cron job error:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
