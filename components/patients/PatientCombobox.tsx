'use client'

import { useState, useEffect, useRef } from 'react'
import { searchPatients } from '@/lib/actions/patients'
import { Check, ChevronsUpDown } from 'lucide-react'

interface Patient {
    id: string
    first_name: string
    last_name: string
    email: string | null
}

interface PatientComboboxProps {
    value?: string
    onChange: (value: string) => void
}

export default function PatientCombobox({ value, onChange }: PatientComboboxProps) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [patients, setPatients] = useState<Patient[]>([])
    const [loading, setLoading] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)

    // Fetch patients on query change
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length < 2) {
                setPatients([])
                return
            }
            setLoading(true)
            const data = await searchPatients(query)
            setPatients(data)
            setLoading(false)
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [wrapperRef])

    const selectedPatient = patients.find(p => p.id === value) || (value ? { first_name: 'Paciente', last_name: 'Seleccionado', id: value } : null)

    return (
        <div className="relative" ref={wrapperRef}>
            <div
                className="w-full flex items-center justify-between border rounded-md px-3 py-2 bg-slate-50 cursor-pointer"
                onClick={() => setOpen(!open)}
            >
                <span className={value ? "text-slate-900" : "text-slate-500"}>
                    {value
                        ? `${selectedPatient?.first_name} ${selectedPatient?.last_name}`
                        : "Seleccionar paciente..."}
                </span>
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
            </div>

            {open && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-50 max-h-60 overflow-auto">
                    <div className="p-2 border-b sticky top-0 bg-white">
                        <input
                            type="text"
                            placeholder="Buscar..."
                            className="w-full px-2 py-1 border rounded focus:outline-none focus:border-blue-500"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                    {loading && <div className="p-2 text-sm text-slate-500 text-center">Buscando...</div>}
                    {!loading && patients.length === 0 && (
                        <div className="p-2 text-sm text-slate-500 text-center">No se encontraron resultados.</div>
                    )}
                    {!loading && patients.map((patient) => (
                        <div
                            key={patient.id}
                            className="px-3 py-2 text-sm hover:bg-slate-100 cursor-pointer flex items-center justify-between"
                            onClick={() => {
                                onChange(patient.id)
                                setOpen(false)
                                setQuery('')
                            }}
                        >
                            <div>
                                <div className="font-medium text-slate-900">{patient.first_name} {patient.last_name}</div>
                                <div className="text-xs text-slate-500">{patient.email}</div>
                            </div>
                            {value === patient.id && <Check className="h-4 w-4 text-blue-600" />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
