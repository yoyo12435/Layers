import type { User } from 'firebase/auth'
import { XIcon } from './icons'

interface SettingsPanelProps {
  user: User | null
  onSignOut: () => void
  onClose: () => void
}

export function SettingsPanel({ user, onSignOut, onClose }: SettingsPanelProps) {
  return (
    <div className="fixed inset-0 z-[800]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col layers-panel-in-left">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">Settings</h2>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-500" aria-label="Close">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {user && (
            <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-neutral-200" />
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">{user.displayName ?? 'Signed in'}</p>
                <p className="text-xs text-neutral-400 truncate">{user.email}</p>
              </div>
            </div>
          )}

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
