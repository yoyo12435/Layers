import type { ReactNode } from 'react'

interface FabButtonProps {
  onClick: () => void
  children: ReactNode
  active?: boolean
  badge?: number
  label: string
}

export function FabButton({ onClick, children, active, badge, label }: FabButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`relative w-12 h-12 rounded-full shadow-lg border flex items-center justify-center transition-colors ${
        active ? 'bg-neutral-900 border-neutral-900 text-white' : 'bg-white border-neutral-200 text-neutral-700 active:bg-neutral-100'
      }`}
    >
      {children}
      {typeof badge === 'number' && badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-neutral-900 text-white text-[11px] font-semibold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center border-2 border-white">
          {badge}
        </span>
      )}
    </button>
  )
}
