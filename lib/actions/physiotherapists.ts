'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

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

    // Initialize Admin Client for User Creation
    console.log('Initializing admin client for physiotherapist creation')
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    // Get origin for cleaner redirect
    const origin = (await headers()).get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://fisionova-production.up.railway.app'

    if (!serviceRoleKey) {
        throw new Error('Error de configuración: SUPABASE_SERVICE_ROLE_KEY faltante')
    }

    const { createClient: createServiceClient } = await import('@supabase/supabase-js')
    const supabaseAdmin = createServiceClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    // Invite User via Email (creates auth user)
    // Note: This requires SMTP setup in Supabase or it will use default template
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/update-password`,
        data: {
            full_name: fullName,
            role: 'physio',
            clinic_id: profile.clinic_id
        }
    })

    if (authError) {
        // Handle case where user already exists but maybe not in this clinic? -> For now just error
        throw new Error('Error al invitar usuario: ' + authError.message)
    }

    if (!authData.user) {
        throw new Error('No se pudo crear el usuario')
    }

    // Create/Update Profile
    const { data: newProfile, error } = await supabaseAdmin
        .from('profiles')
        .upsert({
            id: authData.user.id,
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

    if (error) {
        // If profile creation fails, we might want to delete the auth user to keep consistency?
        // But invite usually sends email immediately. 
        console.error('Error creating profile:', error)
        throw new Error('Error al crear perfil: ' + error.message)
    }

    revalidatePath('/dashboard/physiotherapists')
    return newProfile
}

export async function updatePhysiotherapist(id: string, formData: FormData) {
    const supabase = await createClient()

    const fullName = formData.get('full_name') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const licenseNumber = formData.get('license_number') as string
    const bio = formData.get('bio') as string
    const specialtiesStr = formData.get('specialties') as string
    const specialties = specialtiesStr ? specialtiesStr.split(',').map(s => s.trim()) : []

    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: fullName,
            email, // Allow updating email in profile (does not affect auth)
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
