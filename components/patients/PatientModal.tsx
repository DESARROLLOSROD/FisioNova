'use client'

import { useState } from 'react'
import { createPatient } from '@/lib/actions/patients'

interface PatientModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function PatientModal({ isOpen, onClose, onSuccess }: PatientModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    if (!isOpen) return null

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        setError('')

        const formData = new FormData(e.currentTarget)

        try {
            await createPatient({
                first_name: formData.get('first_name') as string,
                last_name: formData.get('last_name') as string,
                email: formData.get('email') as string,
                phone: formData.get('phone') as string,
                birth_date: formData.get('birth_date') as string || undefined
            })
            onSuccess()
            onClose()
        } catch (err) {
            setError('Error al crear el paciente. Intenta nuevamente.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-slate-900">Nuevo Paciente</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">×</button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Nombre</label>
                                <input name="first_name" required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2 bg-slate-50" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Apellido</label>
                                <input name="last_name" required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2 bg-slate-50" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Email</label>
                            <input type="email" name="email" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2 bg-slate-50" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Teléfono</label>
                                <input type="tel" name="phone" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2 bg-slate-50" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Fecha Nacimiento</label>
                                <input type="date" name="birth_date" className="mt-1 block w-full rounded-md border-slate-300 shadow-sm border p-2 bg-slate-50" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Guardando...' : 'Guardar Paciente'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
