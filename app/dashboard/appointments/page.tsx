'use client'

import Calendar from '@/components/agenda/Calendar'
import AppointmentModal from '@/components/agenda/AppointmentModal'
import AppointmentDetailsModal from '@/components/agenda/AppointmentDetailsModal'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PageHeader from '@/components/ui/PageHeader'

export default function AppointmentsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    // Details Modal State
    const [selectedEvent, setSelectedEvent] = useState<any>(null)
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)

    const handleSelectEvent = (event: any) => {
        setSelectedEvent(event)
        setIsDetailsOpen(true)
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Agenda" description="Visualiza y administra tus citas médicas.">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
                >
                    Nueva Cita
                </button>
            </PageHeader>
            <Calendar
                key={refreshKey}
                onSelectEvent={handleSelectEvent}
            />

            <AppointmentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                refreshCalendar={() => setRefreshKey(prev => prev + 1)}
            />

            <AppointmentDetailsModal
                isOpen={isDetailsOpen}
                onClose={() => setIsDetailsOpen(false)}
                event={selectedEvent}
            />
        </div>
    )
}
