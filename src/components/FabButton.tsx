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
        active
          ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-900'
          : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 active:bg-neutral-100 dark:active:bg-neutral-800'
      }`}
    >
      {children}
      {typeof badge === 'number' && badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[11px] font-semibold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center border-2 border-white dark:border-neutral-900">
          {badge}
        </span>
      )}
    </button>
  )
}
