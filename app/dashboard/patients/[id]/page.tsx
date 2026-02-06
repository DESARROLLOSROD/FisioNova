import { getPatientById } from '@/lib/actions/patients'
import { getMedicalRecords } from '@/lib/actions/medical-records'
import NewConsultationForm from '@/components/emr/NewConsultationForm'
import RecordList from '@/components/emr/RecordList'
import { notFound } from 'next/navigation'
import { User, Phone, Mail, Calendar, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function PatientDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const patient = await getPatientById(id)

    if (!patient) { // Simple not found check
        notFound()
    }

    const records = await getMedicalRecords(id)

    return (
        <div className="space-y-6">
            {/* Patient Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{patient.first_name} {patient.last_name}</h1>
                        <div className="flex flex-wrap gap-4 mt-2 text-slate-600">
                            {patient.email && (
                                <div className="flex items-center text-sm">
                                    <Mail className="w-4 h-4 mr-2 text-slate-400" />
                                    {patient.email}
                                </div>
                            )}
                            {patient.phone && (
                                <div className="flex items-center text-sm">
                                    <Phone className="w-4 h-4 mr-2 text-slate-400" />
                                    {patient.phone}
                                </div>
                            )}
                            {patient.birth_date && (
                                <div className="flex items-center text-sm">
                                    <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                                    {format(new Date(patient.birth_date), "d 'de' MMMM, yyyy", { locale: es })}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm font-medium shadow-sm">
                            Editar Perfil
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow">
                            Agendar Cita
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Medical History */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-lg font-semibold text-slate-800">Historial Clínico</h2>
                        </div>
                        <div className="p-6">
                            <RecordList records={records} />
                        </div>
                    </div>
                </div>

                {/* Right Column: New Consultation & Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-blue-50/50">
                            <h2 className="text-lg font-semibold text-blue-900">Nueva Consulta</h2>
                        </div>
                        <div className="p-0">
                            <NewConsultationForm patientId={id} />
                        </div>
                    </div>

                    {/* Future: Last Appointments, Files, etc. */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h3 className="text-md font-semibold text-slate-800 mb-3">Próximas Citas</h3>
                        <p className="text-sm text-slate-500">No hay citas programadas.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
