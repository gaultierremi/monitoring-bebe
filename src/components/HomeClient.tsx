'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { EventWithDetails } from '@/types'
import BiberonModal from './modals/BiberonModal'
import LangeModal from './modals/LangeModal'
import LegumesModal from './modals/LegumesModal'
import FruitsModal from './modals/FruitsModal'
import DodoModal from './modals/DodoModal'

type ModalType = 'biberon' | 'lange' | 'legumes' | 'fruits' | 'dodo' | null

interface Props {
  events: EventWithDetails[]
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getEventTime(event: EventWithDetails): string {
  if (event.bottle_events) return event.bottle_events.time
  if (event.diaper_events) return event.diaper_events.time
  if (event.meal_events) return event.meal_events.time
  if (event.sleep_events) return event.sleep_events.start_time
  return event.created_at
}

function EventLine({ event }: { event: EventWithDetails }) {
  if (event.bottle_events) {
    return (
      <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
        <span className="text-xl w-7 text-center">🍼</span>
        <span className="text-sm text-gray-500 w-12 shrink-0">
          {formatTime(event.bottle_events.time)}
        </span>
        <span className="text-sm font-medium text-gray-800">
          {event.bottle_events.quantity_ml} ml
        </span>
      </div>
    )
  }

  if (event.diaper_events) {
    const d = event.diaper_events
    const consistencyFr: Record<string, string> = {
      normal: 'normal',
      soft: 'mou',
      liquid: 'liquide',
    }
    const label =
      d.type === 'pee'
        ? 'pipi'
        : d.poo_consistency
          ? `caca — ${consistencyFr[d.poo_consistency] ?? d.poo_consistency}`
          : 'caca'
    return (
      <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
        <span className="text-xl w-7 text-center">🧷</span>
        <span className="text-sm text-gray-500 w-12 shrink-0">{formatTime(d.time)}</span>
        <span className="text-sm font-medium text-gray-800">{label}</span>
      </div>
    )
  }

  if (event.meal_events) {
    const m = event.meal_events
    const label = `${m.quantity_gr} gr ${m.meal_type === 'veggie' ? 'légumes' : 'fruits'}`
    return (
      <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
        <span className="text-xl w-7 text-center">{m.meal_type === 'veggie' ? '🥦' : '🍎'}</span>
        <span className="text-sm text-gray-500 w-12 shrink-0">{formatTime(m.time)}</span>
        <span className="text-sm font-medium text-gray-800">{label}</span>
      </div>
    )
  }

  if (event.sleep_events) {
    const s = event.sleep_events
    const typeFr = s.type === 'nap' ? 'sieste' : 'nuit'
    const start = formatTime(s.start_time)
    const end = s.end_time ? formatTime(s.end_time) : '(en cours)'
    return (
      <div className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
        <span className="text-xl w-7 text-center">💤</span>
        <span className="text-sm text-gray-500 w-12 shrink-0">{start}</span>
        <span className="text-sm font-medium text-gray-800">
          {typeFr} {start}→{end}
        </span>
      </div>
    )
  }

  return null
}

export default function HomeClient({ events }: Props) {
  const [openModal, setOpenModal] = useState<ModalType>(null)
  const router = useRouter()

  const handleClose = () => {
    setOpenModal(null)
    router.refresh()
  }

  const sortedEvents = [...events].sort((a, b) => {
    return new Date(getEventTime(b)).getTime() - new Date(getEventTime(a)).getTime()
  })

  const btnBase =
    'flex flex-col items-center justify-center gap-2 rounded-2xl font-semibold text-white shadow-md active:scale-95 transition-transform'

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="px-4 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-gray-900">🍼 Bibi</h1>
      </header>

      {/* Main buttons */}
      <main className="flex-1 flex flex-col justify-center gap-3 px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setOpenModal('biberon')}
            className={`${btnBase} bg-blue-500 h-28 text-lg`}
          >
            <span className="text-3xl">🍼</span>
            Biberon
          </button>
          <button
            onClick={() => setOpenModal('lange')}
            className={`${btnBase} bg-yellow-500 h-28 text-lg`}
          >
            <span className="text-3xl">🧷</span>
            Lange
          </button>
          <button
            onClick={() => setOpenModal('legumes')}
            className={`${btnBase} bg-green-500 h-28 text-lg`}
          >
            <span className="text-3xl">🥦</span>
            Légumes
          </button>
          <button
            onClick={() => setOpenModal('fruits')}
            className={`${btnBase} bg-orange-500 h-28 text-lg`}
          >
            <span className="text-3xl">🍎</span>
            Fruits
          </button>
        </div>
        <button
          onClick={() => setOpenModal('dodo')}
          className={`${btnBase} bg-indigo-500 h-20 text-lg w-full`}
        >
          <span className="text-3xl">💤</span>
          Dodo
        </button>
      </main>

      {/* Event list */}
      <section className="px-4 pb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Aujourd&apos;hui
        </h2>
        <div className="rounded-2xl bg-white shadow-sm px-4">
          {sortedEvents.length === 0 ? (
            <p className="text-center text-gray-400 py-6 text-sm">Aucun event aujourd&apos;hui</p>
          ) : (
            sortedEvents.map((event) => <EventLine key={event.id} event={event} />)
          )}
        </div>
      </section>

      {/* Modals */}
      {openModal === 'biberon' && <BiberonModal onClose={handleClose} />}
      {openModal === 'lange' && <LangeModal onClose={handleClose} />}
      {openModal === 'legumes' && <LegumesModal onClose={handleClose} />}
      {openModal === 'fruits' && <FruitsModal onClose={handleClose} />}
      {openModal === 'dodo' && <DodoModal onClose={handleClose} />}
    </div>
  )
}
