import { createClient } from '@/lib/supabase/server'
import PageHeader from '@/components/ui/PageHeader'
import { Users, Calendar, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch basic profile info
    // Fetch basic profile info via RPC or safe select
    // Using RPC for role/clinic_id to be safe against RLS
    const { data: profileData } = await supabase.rpc('get_my_profile_data')

    // Fallback if RPC doesn't exist yet, we stick to the select but handle null
    const profile = profileData || (await supabase.from('profiles').select('full_name, role, clinic_id, clinics(name)').eq('id', user!.id).maybeSingle()).data

    const clinicId = profile?.clinic_id

    // Fetch Real Stats (Parallel)
    // Only fetch if clinicId exists
    let appointmentsCount = 0
    let patientsCount = 0

    if (clinicId) {
        const [appointmentsQuery, patientsQuery] = await Promise.all([
            supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('clinic_id', clinicId),
            supabase.from('patients').select('*', { count: 'exact', head: true }).eq('clinic_id', clinicId)
        ])
        appointmentsCount = appointmentsQuery.count || 0
        patientsCount = patientsQuery.count || 0
    }

    const clinics = (profile as any)?.clinics
    const clinicName = Array.isArray(clinics)
        ? clinics[0]?.name
        : (clinics as any)?.name || 'Sin Clínica Asignada'

    return (
        <div className="p-8 space-y-8">
            <PageHeader
                title="Panel Principal"
                description="Bienvenido a Clinova. Aquí tienes un resumen de tu clínica."
            />

            <div className="glass p-6 rounded-xl mb-8">
                <h3 className="text-lg font-semibold mb-4">Bienvenido, {profile?.full_name || user?.email}</h3>
                <p className="text-muted-foreground">
                    Estás administrando: <span className="font-semibold text-foreground">
                        {clinicName}
                    </span>
                </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Users className="h-24 w-24 text-blue-600" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100/50 rounded-xl">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Pacientes Totales</p>
                            <h3 className="text-2xl font-bold text-slate-900">{patientsCount}</h3>
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Calendar className="h-24 w-24 text-indigo-600" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-100/50 rounded-xl">
                            <Calendar className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Citas Hoy</p>
                            <h3 className="text-2xl font-bold text-slate-900">{appointmentsCount}</h3>
                        </div>
                    </div>
                </div>

                <div className="glass-card rounded-xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <TrendingUp className="h-24 w-24 text-emerald-600" />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100/50 rounded-xl">
                            <TrendingUp className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500">Ingresos (Mes)</p>
                            <h3 className="text-2xl font-bold text-slate-900">$0.00</h3>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
