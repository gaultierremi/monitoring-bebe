'use client'

import { useState, useTransition } from 'react'
import { addBottleEvent } from '@/app/actions/events'

function toLocalDatetimeValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

interface Props {
  onClose: () => void
}

export default function BiberonModal({ onClose }: Props) {
  const [time, setTime] = useState(toLocalDatetimeValue(new Date()))
  const [ml, setMl] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    const quantity = parseInt(ml, 10)
    if (!ml || isNaN(quantity) || quantity <= 0) {
      setError('Veuillez saisir une quantité valide')
      return
    }
    setError('')
    startTransition(async () => {
      try {
        await addBottleEvent({
          time: new Date(time).toISOString(),
          quantity_ml: quantity,
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
          <h2 className="text-xl font-bold text-gray-900">🍼 Biberon</h2>
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
          <label className="block text-sm font-medium text-gray-700">Quantité (ml)</label>
          <input
            type="number"
            inputMode="numeric"
            value={ml}
            onChange={(e) => setMl(e.target.value)}
            min={1}
            max={500}
            placeholder="120"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
            autoFocus
          />
        </div>

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
