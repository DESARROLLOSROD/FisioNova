'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface MeasurementData {
    patient_id: string
    metric: 'dolor' | 'movilidad' | 'fuerza' | 'flexibilidad' | 'body_map'
    value?: number
    data?: any // JSONB for body map
    notes?: string
}

export async function addMeasurement(measurement: MeasurementData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, message: 'Usuario no autenticado' }

    // Validación básica
    if (measurement.metric === 'body_map' && !measurement.data) {
        return { success: false, message: 'El mapa corporal requiere datos' }
    }
    if (measurement.metric !== 'body_map' && measurement.value === undefined) {
        return { success: false, message: 'La medición requiere un valor numérico' }
    }

    const { error } = await supabase
        .from('clinical_measurements')
        .insert({
            ...measurement,
            created_by: user.id
        })

    if (error) {
        console.error('Error adding measurement:', error)
        return { success: false, message: 'Error al guardar la medición' }
    }

    revalidatePath(`/dashboard/patients/${measurement.patient_id}`)

    return { success: true }
}

export async function getPatientMeasurements(patientId: string, metric?: string) {
    const supabase = await createClient()

    let query = supabase
        .from('clinical_measurements')
        .select('*')
        .eq('patient_id', patientId)
        .order('measured_at', { ascending: true })

    if (metric) {
        query = query.eq('metric', metric)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching measurements:', error)
        return []
    }

    return data
}

export async function deleteMeasurement(id: string, patientId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('clinical_measurements')
        .delete()
        .eq('id', id)

    if (error) {
        return { success: false, message: 'Error al eliminar' }
    }

    revalidatePath(`/dashboard/patients/${patientId}`)
    return { success: true }
}
