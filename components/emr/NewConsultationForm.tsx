'use client'

import { useState } from 'react'
import { createMedicalRecord } from '@/lib/actions/medical-records'
import { useRouter } from 'next/navigation'

interface NewConsultationFormProps {
    patientId: string
    onSuccess?: () => void
}

export default function NewConsultationForm({ patientId, onSuccess }: NewConsultationFormProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const form = e.currentTarget
        const formData = new FormData(form)

        try {
            await createMedicalRecord({
                patient_id: patientId,
                diagnosis: formData.get('diagnosis') as string,
                treatment_plan: formData.get('treatment_plan') as string,
                notes: formData.get('notes') as string
            })

            // Reset form
            form.reset()
            router.refresh()
            if (onSuccess) onSuccess()
        } catch (error) {
            console.error(error)
            alert('Error al guardar la consulta')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white/50 p-6 rounded-xl border border-white/20 shadow-sm backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Nueva Consulta</h3>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Diagnóstico</label>
                <input
                    name="diagnosis"
                    required
                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white p-2 border"
                    placeholder="Ej. Esguince de tobillo grado 2"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Plan de Tratamiento</label>
                <textarea
                    name="treatment_plan"
                    required
                    rows={3}
                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white p-2 border"
                    placeholder="Ej. Crioterapia 15min, Ultrasonido, Ejercicios de propiocepción..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Notas de Evolución / Observaciones</label>
                <textarea
                    name="notes"
                    rows={3}
                    className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white p-2 border"
                    placeholder="Detalles adicionales de la sesión..."
                />
            </div>

            <div className="flex justify-end pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50 transition shadow-sm"
                >
                    {loading ? 'Guardando...' : 'Guardar Consulta'}
                </button>
            </div>
        </form>
    )
}
