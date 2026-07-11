import { useState } from 'react'
import { PlusIcon, XIcon } from './icons'

interface NewLayerButtonProps {
  onCreate: (name: string) => void
}

export function NewLayerButton({ onCreate }: NewLayerButtonProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm font-medium border border-dashed border-neutral-300 text-neutral-500 hover:text-neutral-800 hover:border-neutral-400 rounded-xl px-4 py-3 w-full justify-center mb-10"
      >
        <PlusIcon className="w-4 h-4" />
        New layer
      </button>
    )
  }

  const submit = () => {
    const trimmed = name.trim()
    if (trimmed) onCreate(trimmed)
    setName('')
    setOpen(false)
  }

  return (
    <div className="flex items-center gap-2 mb-10">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit()
          if (e.key === 'Escape') setOpen(false)
        }}
        placeholder="Layer name"
        className="flex-1 border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-800"
      />
      <button onClick={submit} className="bg-neutral-900 text-white text-sm font-medium rounded-lg px-4 py-2 hover:bg-neutral-700">
        Create
      </button>
      <button onClick={() => setOpen(false)} className="p-2 rounded-lg text-neutral-400 hover:bg-neutral-100">
        <XIcon className="w-4 h-4" />
      </button>
    </div>
  )
}
