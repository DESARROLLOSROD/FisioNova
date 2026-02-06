'use client'

import { useState } from 'react'
import { createTherapySession } from '@/lib/actions/medical-records'
import { X } from 'lucide-react'

interface SessionModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    patientId: string
}

export default function SessionModal({ isOpen, onClose, onSuccess, patientId }: SessionModalProps) {
    const [loading, setLoading] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData(e.currentTarget)

            await createTherapySession({
                patient_id: patientId,
                session_date: formData.get('session_date') as string,
                duration_minutes: parseInt(formData.get('duration_minutes') as string),
                notes: formData.get('notes') as string,
                exercises: [],
                progress_rating: parseInt(formData.get('progress_rating') as string)
            })

            onSuccess()
        } catch (error) {
            alert('Error al crear sesión')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Nueva Sesión de Terapia</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Fecha de Sesión *</label>
                            <input
                                type="datetime-local"
                                name="session_date"
                                required
                                defaultValue={new Date().toISOString().slice(0, 16)}
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Duración (minutos) *</label>
                            <input
                                type="number"
                                name="duration_minutes"
                                required
                                defaultValue={60}
                                min="1"
                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Notas de la Sesión *</label>
                        <textarea
                            name="notes"
                            required
                            rows={6}
                            placeholder="Describe el progreso del paciente, ejercicios realizados, observaciones..."
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Calificación de Progreso *</label>
                        <select
                            name="progress_rating"
                            required
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="1">1 - Sin progreso</option>
                            <option value="2">2 - Progreso mínimo</option>
                            <option value="3">3 - Progreso moderado</option>
                            <option value="4">4 - Buen progreso</option>
                            <option value="5">5 - Excelente progreso</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-lg hover:bg-slate-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Guardar Sesión'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
