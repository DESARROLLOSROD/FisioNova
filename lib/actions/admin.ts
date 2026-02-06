'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const clinicSchema = z.object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    slug: z.string().min(3, 'El slug debe tener al menos 3 caracteres').regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
})

export type Clinic = {
    id: string
    name: string
    slug: string
    address?: string
    phone?: string
    email?: string
    created_at: string
}

export async function getClinics() {
    const supabase = await createClient()

    // Verify Super Admin (Double check on server action for safety)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'No autenticado' }
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'super_admin') {
        return { error: 'No autorizado: Requiere rol super_admin' }
    }

    const { data: clinics, error } = await supabase
        .from('clinics')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        return { error: error.message }
    }

    return clinics as Clinic[]
}

export async function createClinic(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // Verify Super Admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return {
            message: 'No autenticado',
        }
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'super_admin') {
        return {
            message: 'No autorizado: Requiere rol super_admin',
        }
    }

    // Validate Input
    const rawData = {
        name: formData.get('name'),
        slug: formData.get('slug'),
        address: formData.get('address'),
        phone: formData.get('phone'),
        email: formData.get('email'),
    }

    const validatedFields = clinicSchema.safeParse(rawData)

    if (!validatedFields.success) {
        return {
            error: validatedFields.error.flatten().fieldErrors,
        }
    }

    // Insert Database
    const { error } = await supabase
        .from('clinics')
        .insert({
            name: validatedFields.data.name,
            slug: validatedFields.data.slug,
            address: validatedFields.data.address,
            phone: validatedFields.data.phone,
            email: validatedFields.data.email || null,
        })

    if (error) {
        return {
            message: 'Error al crear la clínica: ' + error.message,
        }
    }

    revalidatePath('/dashboard/admin')
    redirect('/dashboard/admin')
}
