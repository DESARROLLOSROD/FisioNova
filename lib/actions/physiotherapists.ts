'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getPhysiotherapists() {
    const supabase = await createClient()

    // Get current user's clinic
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

    if (!profile?.clinic_id) return []

    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone, specialties, license_number, bio, avatar_url, created_at')
        .eq('clinic_id', profile.clinic_id)
        .eq('role', 'physio')
        .order('full_name')

    if (error) {
        console.error('Error fetching physiotherapists:', error)
        return []
    }

    return data || []
}

export async function createPhysiotherapist(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const fullName = formData.get('full_name') as string
    const phone = formData.get('phone') as string
    const licenseNumber = formData.get('license_number') as string
    const bio = formData.get('bio') as string
    const specialtiesStr = formData.get('specialties') as string
    const specialties = specialtiesStr ? specialtiesStr.split(',').map(s => s.trim()) : []

    // Get current user's clinic
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: profile } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single()

    if (!profile?.clinic_id) throw new Error('Sin clínica asignada')

    // Create auth user (using service role would be needed for this in production)
    // For now, we'll create the profile directly and assume user creation happens separately
    const { data: newProfile, error } = await supabase
        .from('profiles')
        .insert({
            full_name: fullName,
            email,
            phone,
            role: 'physio',
            clinic_id: profile.clinic_id,
            license_number: licenseNumber,
            bio,
            specialties
        })
        .select()
        .single()

    if (error) throw error

    revalidatePath('/dashboard/physiotherapists')
    return newProfile
}

export async function updatePhysiotherapist(id: string, formData: FormData) {
    const supabase = await createClient()

    const fullName = formData.get('full_name') as string
    const phone = formData.get('phone') as string
    const licenseNumber = formData.get('license_number') as string
    const bio = formData.get('bio') as string
    const specialtiesStr = formData.get('specialties') as string
    const specialties = specialtiesStr ? specialtiesStr.split(',').map(s => s.trim()) : []

    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: fullName,
            phone,
            license_number: licenseNumber,
            bio,
            specialties
        })
        .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard/physiotherapists')
}

export async function deletePhysiotherapist(id: string) {
    const supabase = await createClient()

    // Soft delete by setting role to null or deleting the profile
    const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard/physiotherapists')
}
