import { useState } from 'react'
import type { Category, Location } from '../types'
import { CATEGORIES, CATEGORY_COLORS, CATEGORY_LABELS } from '../types'
import { StarRating } from './StarRating'
import { TrashIcon, XIcon } from './icons'

export type LocationDraft = Omit<Location, 'id' | 'lat' | 'lng'>

interface LocationFormProps {
  title?: string
  submitLabel?: string
  initial?: Partial<LocationDraft>
  onSubmit: (location: LocationDraft) => void
  onCancel: () => void
  onDelete?: () => void
}

export function LocationForm({ title = 'New location', submitLabel = 'Add location', initial, onSubmit, onCancel, onDelete }: LocationFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [rating, setRating] = useState(initial?.rating ?? 0)
  const [category, setCategory] = useState<Category>(initial?.category ?? 'other')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ name: name.trim(), description: description.trim(), rating, category })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-neutral-200 rounded-xl p-4 shadow-xl flex flex-col gap-3"
    >
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-neutral-900 text-sm">{title}</h4>
        <div className="flex items-center gap-1">
          {onDelete && (
            <button type="button" onClick={onDelete} className="p-1 rounded text-neutral-400 hover:bg-red-50 hover:text-red-600" aria-label="Delete location">
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
          <button type="button" onClick={onCancel} className="p-1 rounded text-neutral-400 hover:bg-neutral-100" aria-label="Cancel">
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        className="border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-800"
        required
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        rows={2}
        className="border border-neutral-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-neutral-800"
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-500">Rating</span>
        <StarRating value={rating} onChange={setRating} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => {
          const color = CATEGORY_COLORS[c]
          const active = category === c
          return (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className="text-xs font-medium px-2.5 py-1 rounded-full border transition-colors"
              style={
                active
                  ? { color: 'white', backgroundColor: color, borderColor: color }
                  : { color, backgroundColor: `${color}1a`, borderColor: `${color}40` }
              }
            >
              {CATEGORY_LABELS[c]}
            </button>
          )
        })}
      </div>

      <button
        type="submit"
        className="mt-1 bg-neutral-900 text-white text-sm font-medium rounded-lg py-2 hover:bg-neutral-700 transition-colors"
      >
        {submitLabel}
      </button>
    </form>
  )
}
