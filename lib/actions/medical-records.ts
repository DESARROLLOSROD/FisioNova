'use server'

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function getMedicalRecords(patientId: string) {
    const cookieStore = await cookies()
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('medical_records')
        .select(`
      id,
      diagnosis,
      treatment_plan,
      notes,
      created_at,
      doctor_id,
      profiles:doctor_id (full_name)
    `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching medical records:', error)
        return []
    }

    // Supabase returns arrays for relations sometimes. We map to ensure it matches expectations.
    return data.map((record: any) => ({
        ...record,
        profiles: Array.isArray(record.profiles) ? record.profiles[0] : record.profiles
    }))
}

export async function createMedicalRecord(data: {
    patient_id: string
    diagnosis: string
    treatment_plan: string
    notes: string
}) {
    const cookieStore = await cookies()
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    // Get clinic_id
    const { data: profile } = await supabase.from('profiles').select('clinic_id').eq('id', user?.id).single()

    if (!profile?.clinic_id) throw new Error('No clinic found for user')

    const { error } = await supabase.from('medical_records').insert({
        clinic_id: profile.clinic_id,
        patient_id: data.patient_id,
        doctor_id: user?.id,
        diagnosis: data.diagnosis,
        treatment_plan: data.treatment_plan,
        notes: data.notes
    })

    if (error) {
        console.error('Error creating medical record:', error)
        throw new Error('Failed to create medical record')
    }
}
