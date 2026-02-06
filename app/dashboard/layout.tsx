import { DashboardSidebar } from '@/components/dashboard/sidebar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="h-full relative bg-slate-50/50">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80]">
                <DashboardSidebar />
            </div>
            {/* Main Content Area with Dot Pattern */}
            <main className="md:pl-72 h-full min-h-screen bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                <div className="p-8 max-w-7xl mx-auto h-full">
                    {children}
                </div>
            </main>
        </div>
    )
}
