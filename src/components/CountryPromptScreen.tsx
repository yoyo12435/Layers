import { useState } from 'react'
import { LayersIcon } from './icons'
import { CountrySelect } from './CountrySelect'

interface CountryPromptScreenProps {
  onSubmit: (countryCode: string) => void
}

export function CountryPromptScreen({ onSubmit }: CountryPromptScreenProps) {
  const [country, setCountry] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!country) return
    onSubmit(country)
  }

  return (
    <div className="h-svh w-full overflow-y-auto bg-neutral-50">
      <div className="min-h-full flex flex-col items-center px-6 pt-10 pb-10">
        <div className="w-12 h-12 rounded-2xl bg-neutral-900 flex items-center justify-center mb-4">
          <LayersIcon className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-semibold text-neutral-900 mb-1.5">Where are you based?</h1>
        <p className="text-sm text-neutral-500 mb-6 text-center max-w-xs">
          This narrows down address search results to your country. You can change it later in Settings.
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-3">
          <CountrySelect value={country} onChange={setCountry} />
          <button
            type="submit"
            disabled={!country}
            className="bg-neutral-900 text-white text-sm font-medium rounded-xl py-3 disabled:opacity-60"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  )
}
