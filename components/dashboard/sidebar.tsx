'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Calendar,
    Users,
    Settings,
    FileText,
    Activity,
    LogOut,
    Shield
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const routes = [
    {
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
        active: (pathname: string) => pathname === '/dashboard',
    },
    {
        label: 'Agenda',
        icon: Calendar,
        href: '/dashboard/appointments',
        active: (pathname: string) => pathname.startsWith('/dashboard/appointments'),
    },
    {
        label: 'Pacientes',
        icon: Users,
        href: '/dashboard/patients',
        active: (pathname: string) => pathname.startsWith('/dashboard/patients'),
    },
    {
        label: 'Fisioterapeutas',
        icon: Activity,
        href: '/dashboard/physiotherapists',
        active: (pathname: string) => pathname.startsWith('/dashboard/physiotherapists'),
    },
    {
        label: 'Usuarios',
        icon: Shield,
        href: '/dashboard/users',
        active: (pathname: string) => pathname.startsWith('/dashboard/users'),
    },
    {
        label: 'Expedientes',
        icon: FileText,
        href: '/dashboard/emr',
        active: (pathname: string) => pathname.startsWith('/dashboard/emr'),
    },
    {
        label: 'Finanzas',
        icon: FileText,
        href: '/dashboard/finance',
        active: (pathname: string) => pathname.startsWith('/dashboard/finance'),
    },
    {
        label: 'Configuración',
        icon: Settings,
        href: '/dashboard/settings',
        active: (pathname: string) => pathname.startsWith('/dashboard/settings'),
    },
]

export function DashboardSidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        const checkRole = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data: role, error } = await supabase.rpc('get_my_role')

                if (!error && role === 'super_admin') {
                    setIsAdmin(true)
                }
            }
        }
        checkRole()
    }, [supabase])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-[#0F172A] text-white border-r border-white/5 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900/0 to-slate-900/0 pointer-events-none" />

            <div className="px-6 py-4 flex-1 z-10">
                <Link href="/dashboard" className="flex items-center gap-2 mb-10 group">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-all duration-300">
                        <span className="font-bold text-white text-lg">C</span>
                    </div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 text-transparent bg-clip-text">
                        Clinova
                    </h1>
                </Link>

                <div className="space-y-2">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-xl transition-all duration-200 relative overflow-hidden",
                                route.active(pathname)
                                    ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-400 border border-blue-500/10"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {route.active(pathname) && (
                                <div className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-r-full" />
                            )}
                            <div className="flex items-center flex-1 z-10">
                                <route.icon className={cn("h-5 w-5 mr-3 transition-colors", route.active(pathname) ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300")} />
                                {route.label}
                            </div>
                        </Link>
                    ))}

                    {isAdmin && (
                        <Link
                            href="/dashboard/admin"
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer rounded-xl transition-all duration-200 relative overflow-hidden",
                                pathname.startsWith('/dashboard/admin')
                                    ? "bg-gradient-to-r from-red-600/20 to-orange-600/20 text-red-400 border border-red-500/10"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {pathname.startsWith('/dashboard/admin') && (
                                <div className="absolute left-0 top-0 h-full w-1 bg-red-500 rounded-r-full" />
                            )}
                            <div className="flex items-center flex-1 z-10">
                                <Shield className={cn("h-5 w-5 mr-3 transition-colors", pathname.startsWith('/dashboard/admin') ? "text-red-400" : "text-slate-500 group-hover:text-red-400")} />
                                Super Admin
                            </div>
                        </Link>
                    )}
                </div>
            </div>

            <div className="px-6 py-4 z-10">
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full p-3 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
                >
                    <LogOut className="h-5 w-5" />
                    Cerrar Sesión
                </button>
                <div className="text-xs text-slate-700 text-center pt-2">v2.1 (RLS Fix)</div>
            </div>
        </div>
    )
}
