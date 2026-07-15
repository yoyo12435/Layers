import { COUNTRIES } from '../lib/countries'

interface CountrySelectProps {
  value: string | null
  onChange: (code: string) => void
  className?: string
  id?: string
}

export function CountrySelect({ value, onChange, className, id }: CountrySelectProps) {
  return (
    <select
      id={id}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className={
        className ??
        'w-full border border-neutral-300 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-neutral-800'
      }
    >
      <option value="" disabled>
        Select a country
      </option>
      {COUNTRIES.map((c) => (
        <option key={c.code} value={c.code}>
          {c.name}
        </option>
      ))}
    </select>
  )
}
