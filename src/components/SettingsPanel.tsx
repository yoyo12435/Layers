import type { User } from 'firebase/auth'
import { MoonIcon, SunIcon, XIcon } from './icons'

interface SettingsPanelProps {
  user: User | null
  dark: boolean
  onToggleDark: () => void
  onSignOut: () => void
  onClose: () => void
}

export function SettingsPanel({ user, dark, onToggleDark, onSignOut, onClose }: SettingsPanelProps) {
  return (
    <div className="fixed inset-0 z-[800]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-full max-w-sm bg-white dark:bg-neutral-900 shadow-2xl flex flex-col layers-panel-in-left">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Settings</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400" aria-label="Close">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {user && (
            <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{user.displayName ?? 'Signed in'}</p>
                <p className="text-xs text-neutral-400 truncate">{user.email}</p>
              </div>
            </div>
          )}

          <div className="px-5 py-4 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center gap-2.5 text-sm font-medium text-neutral-800 dark:text-neutral-100">
              {dark ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
              {dark ? 'Dark mode' : 'Light mode'}
            </div>
            <button
              onClick={onToggleDark}
              role="switch"
              aria-checked={dark}
              aria-label="Toggle dark mode"
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${dark ? 'bg-neutral-900' : 'bg-neutral-300'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${dark ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="px-5 py-4">
            <button
              onClick={onSignOut}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
