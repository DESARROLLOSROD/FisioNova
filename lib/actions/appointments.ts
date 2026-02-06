'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function getAppointments(start: Date, end: Date) {
    const cookieStore = await cookies()
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('appointments')
        .select(`
      id,
      title,
      start_time,
      end_time,
      status,
      patient_id,
      doctor_id
    `)
        .gte('start_time', start.toISOString())
        .lte('end_time', end.toISOString())

    if (error) {
        console.error('Error fetching appointments:', error)
        return []
    }

    return data.map((apt: any) => ({
        id: apt.id,
        title: apt.title || 'Cita',
        start: new Date(apt.start_time),
        end: new Date(apt.end_time),
        resourceId: apt.doctor_id,
        status: apt.status
    }))
}

export async function createAppointment(data: {
    title: string
    start: Date
    end: Date
    patient_id?: string
    doctor_id?: string
}) {
    const cookieStore = await cookies()
    const supabase = await createClient()

    // Get current user to possibly auto-fill doctor_id
    const { data: { user } } = await supabase.auth.getUser()

    // Or just simple insert
    const { error } = await supabase.from('appointments').insert({
        title: data.title,
        start_time: data.start.toISOString(),
        end_time: data.end.toISOString(),
        patient_id: data.patient_id || null, // Allow null if optional or handle otherwise
        doctor_id: data.doctor_id || user?.id, // Fallback to current user
        clinic_id: (await supabase.from('profiles').select('clinic_id').eq('id', user?.id).single()).data?.clinic_id // Try to get clinic_id
    })

    if (error) {
        console.error('Error creating appointment:', error)
        throw new Error('Failed to create appointment')
    }
}

export async function updateAppointment(id: string, data: {
    title?: string
    start?: Date
    end?: Date
    patient_id?: string
}) {
    const supabase = await createClient()

    const updateData: any = {}
    if (data.title) updateData.title = data.title
    if (data.start) updateData.start_time = data.start.toISOString()
    if (data.end) updateData.end_time = data.end.toISOString()
    if (data.patient_id) updateData.patient_id = data.patient_id

    const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', id)

    if (error) {
        console.error('Error updating appointment:', error)
        throw new Error('Failed to update appointment')
    }
}
