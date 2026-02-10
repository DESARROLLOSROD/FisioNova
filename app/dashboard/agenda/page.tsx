'use client'

import { useState, useEffect, useCallback } from 'react'
import AdvancedCalendar from '@/components/calendar/AdvancedCalendar'
import AvailabilityBlockModal from '@/components/calendar/AvailabilityBlockModal'
import RecurringAppointmentModal from '@/components/calendar/RecurringAppointmentModal'
import { getAppointmentsForCalendar, updateAppointmentTime, createQuickAppointment, getPatientsForCalendar, getServicesForCalendar } from '@/lib/actions/appointments-calendar'
import { getAvailabilityBlocks, checkTimeSlotAvailability } from '@/lib/actions/availability'
import { SlotInfo } from 'react-big-calendar'
import { X, Plus, Calendar as CalendarIcon, User, Clock, Ban, Repeat } from 'lucide-react'

interface CalendarEvent {
    id: string
    title: string
    start: Date
    end: Date
    resource?: {
        patientId: string
        patientName: string
        serviceId: string
        serviceName: string
        status: string
        isBlock?: boolean
    }
}

export default function AgendaPage() {
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false)
    const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false)
    const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null)
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
    const [patients, setPatients] = useState<any[]>([])
    const [services, setServices] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        patientId: '',
        serviceId: '',
        notes: ''
    })

    // Load initial data
    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        // Get date range for current view (1 month)
        const now = new Date()
        const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        const endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0)

        const [appointmentsData, patientsData, servicesData, blocksData] = await Promise.all([
            getAppointmentsForCalendar(),
            getPatientsForCalendar(),
            getServicesForCalendar(),
            getAvailabilityBlocks(startDate, endDate)
        ])

        // Convert blocks to calendar events
        const blockEvents = blocksData.map((block: any) => ({
            id: `block-${block.id}`,
            title: `🚫 ${block.reason || 'Bloqueado'}`,
            start: new Date(block.start_time),
            end: new Date(block.end_time),
            resource: {
                patientId: '',
                patientName: '',
                serviceId: '',
                serviceName: '',
                status: 'blocked',
                isBlock: true,
                blockId: block.id
            }
        }))

        setEvents([...appointmentsData, ...blockEvents])
        setPatients(patientsData)
        setServices(servicesData)

        console.log('📊 Agenda Data Loaded:', {
            appointments: appointmentsData.length,
            blocks: blockEvents.length,
            patients: patientsData.length,
            services: servicesData.length
        })
    }

    // Handle event drop (drag & drop)
    const handleEventDrop = useCallback(async (eventId: string, start: Date, end: Date) => {
        setLoading(true)
        try {
            await updateAppointmentTime(eventId, start, end)
            await loadData()
        } catch (error) {
            console.error('Error updating appointment:', error)
            alert('Error al reagendar la cita')
        } finally {
            setLoading(false)
        }
    }, [])

    // Handle event resize
    const handleEventResize = useCallback(async (eventId: string, start: Date, end: Date) => {
        setLoading(true)
        try {
            await updateAppointmentTime(eventId, start, end)
            await loadData()
        } catch (error) {
            console.error('Error resizing appointment:', error)
            alert('Error al cambiar la duración')
        } finally {
            setLoading(false)
        }
    }, [])

    // Handle slot selection (create new appointment)
    const handleSelectSlot = useCallback(async (slotInfo: SlotInfo) => {
        // Check if slot is available
        const availability = await checkTimeSlotAvailability(slotInfo.start, slotInfo.end)

        if (!availability.available) {
            alert(`Este horario está bloqueado: ${availability.conflictingBlock?.reason || 'No disponible'}`)
            return
        }

        setSelectedSlot(slotInfo)
        setSelectedEvent(null)
        setFormData({ patientId: '', serviceId: '', notes: '' })
        setIsModalOpen(true)
    }, [])

    // Handle event selection (view/edit appointment)
    const handleSelectEvent = useCallback((event: CalendarEvent) => {
        setSelectedEvent(event)
        setSelectedSlot(null)
        setFormData({
            patientId: event.resource?.patientId || '',
            serviceId: event.resource?.serviceId || '',
            notes: ''
        })
        setIsModalOpen(true)
    }, [])

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedSlot) return

        setLoading(true)
        try {
            await createQuickAppointment({
                patientId: formData.patientId,
                serviceId: formData.serviceId,
                startTime: selectedSlot.start,
                endTime: selectedSlot.end,
                notes: formData.notes
            })
            await loadData()
            setIsModalOpen(false)
        } catch (error) {
            console.error('Error creating appointment:', error)
            alert('Error al crear la cita')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Agenda</h2>
                    <p className="text-muted-foreground">
                        Gestiona las citas de tu clínica
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsRecurringModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                    >
                        <Repeat className="h-4 w-4" />
                        Citas Recurrentes
                    </button>
                    <button
                        onClick={() => setIsBlockModalOpen(true)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2"
                    >
                        <Ban className="h-4 w-4" />
                        Bloquear Horario
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
                <span className="text-sm font-medium">Estados:</span>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-green-500"></div>
                    <span className="text-sm">Confirmada</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-orange-500"></div>
                    <span className="text-sm">Pendiente</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-red-500"></div>
                    <span className="text-sm">Cancelada</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gray-500"></div>
                    <span className="text-sm">Completada</span>
                </div>
            </div>

            {/* Calendar */}
            <AdvancedCalendar
                events={events}
                onEventDrop={handleEventDrop}
                onEventResize={handleEventResize}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
            />

            {/* Quick Appointment Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <CalendarIcon className="h-5 w-5" />
                                {selectedEvent ? 'Detalles de Cita' : 'Nueva Cita'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-1 hover:bg-gray-100 rounded-lg transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {selectedEvent ? (
                            <div className="p-6 space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Paciente</p>
                                    <p className="font-medium">{selectedEvent.resource?.patientName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Servicio</p>
                                    <p className="font-medium">{selectedEvent.resource?.serviceName}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Horario</p>
                                    <p className="font-medium">
                                        {selectedEvent.start.toLocaleString('es-MX')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Estado</p>
                                    <p className="font-medium capitalize">{selectedEvent.resource?.status}</p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        <User className="h-4 w-4 inline mr-1" />
                                        Paciente
                                    </label>
                                    <select
                                        value={formData.patientId}
                                        onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    >
                                        <option value="">Seleccionar paciente</option>
                                        {patients.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.first_name} {p.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Servicio
                                    </label>
                                    <select
                                        value={formData.serviceId}
                                        onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    >
                                        <option value="">Seleccionar servicio</option>
                                        {services.map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.name} - ${s.price}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        <Clock className="h-4 w-4 inline mr-1" />
                                        Horario
                                    </label>
                                    <p className="text-sm text-gray-600">
                                        {selectedSlot?.start.toLocaleString('es-MX')} - {selectedSlot?.end.toLocaleTimeString('es-MX')}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Notas (opcional)
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        rows={3}
                                        placeholder="Notas adicionales..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        'Creando...'
                                    ) : (
                                        <>
                                            <Plus className="h-4 w-4" />
                                            Crear Cita
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Availability Block Modal */}
            <AvailabilityBlockModal
                isOpen={isBlockModalOpen}
                onClose={() => setIsBlockModalOpen(false)}
                onSuccess={loadData}
            />

            {/* Recurring Appointment Modal */}
            <RecurringAppointmentModal
                isOpen={isRecurringModalOpen}
                onClose={() => setIsRecurringModalOpen(false)}
                onSuccess={loadData}
                patients={patients}
                services={services}
            />
        </div>
    )
}
