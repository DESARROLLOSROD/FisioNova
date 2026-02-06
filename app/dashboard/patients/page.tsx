'use client'

import { useEffect, useState } from 'react'
import { searchPatients } from '@/lib/actions/patients'
import PatientModal from '@/components/patients/PatientModal'
import Link from 'next/link'
import PageHeader from '@/components/ui/PageHeader'

interface Patient {
    id: string
    first_name: string
    last_name: string
    email: string | null
    phone: string | null
}

export default function PatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([])
    const [search, setSearch] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        const fetchPatients = async () => {
            setLoading(true)
            const data = await searchPatients(search)
            setPatients(data as Patient[])
            setLoading(false)
        }
        fetchPatients()
    }, [search, refreshKey])

    return (
        <div className="space-y-6">
            <PageHeader title="Pacientes" description="Gestiona el expediente de tus pacientes.">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                >
                    Nuevo Paciente
                </button>
            </PageHeader>

            <div className="flex items-center space-x-2">
                <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    className="w-full max-w-sm px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="bg-white/50 backdrop-blur-md rounded-xl border border-white/20 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Nombre</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Email</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Teléfono</th>
                            <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Cargando...</td>
                            </tr>
                        ) : patients.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-slate-500">No se encontraron pacientes.</td>
                            </tr>
                        ) : (
                            patients.map((patient) => (
                                <tr key={patient.id} className="hover:bg-slate-50/50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{patient.first_name} {patient.last_name}</td>
                                    <td className="px-6 py-4 text-slate-600">{patient.email || '-'}</td>
                                    <td className="px-6 py-4 text-slate-600">{patient.phone || '-'}</td>
                                    <td className="px-6 py-4">
                                        <Link href={`/dashboard/patients/${patient.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                                            Ver
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <PatientModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => setRefreshKey(k => k + 1)}
            />
        </div>
    )
}
