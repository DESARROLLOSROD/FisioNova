'use client'

import { createClinic } from '@/lib/actions/admin'
import { useRouter } from 'next/navigation'
import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'

// Initial State for the form
const initialState = {
    message: '',
    error: undefined,
}

export default function NewClinicPage() {
    const router = useRouter()
    // @ts-ignore - Types for useActionState can be tricky with Server Actions in some versions
    const [state, formAction, isPending] = useActionState(createClinic, initialState)

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Registrar Nueva Clínica</h2>
                <p className="text-muted-foreground">
                    Ingresa los datos para dar de alta una nueva clínica en la plataforma.
                </p>
            </div>

            <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                <form action={formAction} className="space-y-4">

                    {state?.message && (
                        <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                            {state.message}
                        </div>
                    )}

                    <div className="grid gap-2">
                        <label htmlFor="name" className="text-sm font-medium">Nombre de la Clínica</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Ej. Clínica FisioNova Centro"
                        />
                        {state?.error?.name && <p className="text-sm text-destructive">{state.error.name}</p>}
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="slug" className="text-sm font-medium">Slug (Identificador URL)</label>
                        <input
                            id="slug"
                            name="slug"
                            type="text"
                            required
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Ej. fisionova-centro"
                        />
                        <p className="text-xs text-muted-foreground">Solo letras minúsculas, números y guiones. Sin espacios.</p>
                        {state?.error?.slug && <p className="text-sm text-destructive">{state.error.slug}</p>}
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="address" className="text-sm font-medium">Dirección</label>
                        <input
                            id="address"
                            name="address"
                            type="text"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Calle Principal #123"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label htmlFor="phone" className="text-sm font-medium">Teléfono</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="55 1234 5678"
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="email" className="text-sm font-medium">Email de Contacto</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="contacto@clinica.com"
                            />
                            {state?.error?.email && <p className="text-sm text-destructive">{state.error.email}</p>}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                        >
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Registrar Clínica
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
