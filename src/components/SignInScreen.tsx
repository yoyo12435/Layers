import { GoogleIcon, LayersIcon } from './icons'

interface SignInScreenProps {
  configured: boolean
  onSignIn: () => void
}

export function SignInScreen({ configured, onSignIn }: SignInScreenProps) {
  return (
    <div className="h-svh w-full flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 px-6">
      <div className="w-14 h-14 rounded-2xl bg-neutral-900 dark:bg-white flex items-center justify-center mb-5">
        <LayersIcon className="w-7 h-7 text-white dark:text-neutral-900" />
      </div>
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white mb-1.5">Layers</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 text-center max-w-xs">
        Sign in to see your layers and pins, and keep them synced across your devices.
      </p>

      {configured ? (
        <button
          onClick={onSignIn}
          className="flex items-center gap-3 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-full pl-4 pr-5 py-3 shadow-sm active:bg-neutral-50 dark:active:bg-neutral-800"
        >
          <GoogleIcon className="w-5 h-5" />
          <span className="text-sm font-medium text-neutral-800 dark:text-neutral-100">Sign in with Google</span>
        </button>
      ) : (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 max-w-xs text-center">
          Sign-in isn't configured yet. Add your Firebase project keys to enable Google sign-in.
        </p>
      )}
    </div>
  )
}
