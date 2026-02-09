'use client'

import { Dumbbell } from 'lucide-react'

export default function ExercisesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Mis Ejercicios</h1>
                <p className="text-slate-600 mt-2">Ejercicios asignados por tu fisioterapeuta</p>
            </div>

            <div className="text-center py-12 bg-white rounded-xl border">
                <Dumbbell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 mb-2">No tienes ejercicios asignados</p>
                <p className="text-sm text-slate-500">Tu fisioterapeuta te asignará ejercicios durante tus sesiones</p>
            </div>
        </div>
    )
}
