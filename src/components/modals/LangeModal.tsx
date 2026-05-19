'use client'

import { useState, useTransition } from 'react'
import { addDiaperEvent } from '@/app/actions/events'
import type { DiaperPooConsistency, DiaperSubType } from '@/types'

function toLocalDatetimeValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

interface Props {
  onClose: () => void
}

export default function LangeModal({ onClose }: Props) {
  const [time, setTime] = useState(toLocalDatetimeValue(new Date()))
  const [type, setType] = useState<DiaperSubType>('pee')
  const [consistency, setConsistency] = useState<DiaperPooConsistency>('normal')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    setError('')
    startTransition(async () => {
      try {
        await addDiaperEvent({
          time: new Date(time).toISOString(),
          type,
          poo_consistency: type === 'poo' ? consistency : undefined,
        })
        onClose()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur lors de la sauvegarde')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-0">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 space-y-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">🧷 Lange</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Heure</label>
          <input
            type="datetime-local"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <div className="grid grid-cols-2 gap-2">
            {(['pee', 'poo'] as DiaperSubType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded-xl py-3 text-base font-medium border-2 transition ${
                  type === t
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {t === 'pee' ? '💧 Pipi' : '💩 Caca'}
              </button>
            ))}
          </div>
        </div>

        {type === 'poo' && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Consistance</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: 'normal', label: 'Normal' },
                { value: 'soft', label: 'Mou' },
                { value: 'liquid', label: 'Liquide' },
              ] as { value: DiaperPooConsistency; label: string }[]).map((c) => (
                <button
                  key={c.value}
                  onClick={() => setConsistency(c.value)}
                  className={`rounded-xl py-2.5 text-sm font-medium border-2 transition ${
                    consistency === c.value
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isPending ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}
