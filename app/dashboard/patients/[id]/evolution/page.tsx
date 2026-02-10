
import { getPatientById } from '@/lib/actions/patients'
import { getPatientMeasurements } from '@/lib/actions/clinical-measurements'
import MeasurementLog from '@/components/patients/history/MeasurementLog'
import PageHeader from '@/components/ui/PageHeader'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function EvolutionPage({ params }: { params: { id: string } }) {
    const patient = await getPatientById(params.id)
    const history = await getPatientMeasurements(params.id)

    if (!patient) {
        return <div>Paciente no encontrado</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Link
                    href={`/dashboard/patients/${params.id}`}
                    className="p-2 hover:bg-slate-100 rounded-full transition text-slate-500"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Evolución Clínica
                    </h1>
                    <p className="text-slate-500 text-sm">
                        {patient.first_name} {patient.last_name}
                    </p>
                </div>
            </div>

            <MeasurementLog
                patientId={patient.id}
                initialHistory={history}
            />
        </div>
    )
}
