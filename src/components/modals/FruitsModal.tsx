'use client'

import { useState, useTransition } from 'react'
import { addMealEvent } from '@/app/actions/events'

function toLocalDatetimeValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

interface Props {
  onClose: () => void
}

export default function FruitsModal({ onClose }: Props) {
  const [time, setTime] = useState(toLocalDatetimeValue(new Date()))
  const [gr, setGr] = useState('')
  const [comp1, setComp1] = useState('')
  const [comp2, setComp2] = useState('')
  const [comp3, setComp3] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSave = () => {
    const quantity = parseInt(gr, 10)
    if (!gr || isNaN(quantity) || quantity <= 0) {
      setError('Veuillez saisir une quantité valide')
      return
    }
    setError('')
    startTransition(async () => {
      try {
        await addMealEvent({
          time: new Date(time).toISOString(),
          meal_type: 'fruit',
          quantity_gr: quantity,
          components: [comp1, comp2, comp3],
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
          <h2 className="text-xl font-bold text-gray-900">🍎 Fruits</h2>
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
          <label className="block text-sm font-medium text-gray-700">Quantité (gr)</label>
          <input
            type="number"
            inputMode="numeric"
            value={gr}
            onChange={(e) => setGr(e.target.value)}
            min={1}
            placeholder="80"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Composants</label>
          <input
            type="text"
            value={comp1}
            onChange={(e) => setComp1(e.target.value)}
            placeholder="Ex: pomme"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
          />
          <input
            type="text"
            value={comp2}
            onChange={(e) => setComp2(e.target.value)}
            placeholder="Ex: poire"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
          />
          <input
            type="text"
            value={comp3}
            onChange={(e) => setComp3(e.target.value)}
            placeholder="Ex: banane"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-base focus:border-blue-500 focus:outline-none"
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
            className="flex-1 rounded-xl bg-orange-500 px-4 py-3 text-base font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
          >
            {isPending ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}
