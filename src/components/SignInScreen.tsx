import { useState } from 'react'
import { GoogleIcon, LayersIcon } from './icons'

interface SignInScreenProps {
  configured: boolean
  error: string | null
  onSignInWithGoogle: () => void
  onContinueWithEmail: (email: string, password: string) => Promise<void>
}

export function SignInScreen({ configured, error, onSignInWithGoogle, onContinueWithEmail }: SignInScreenProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return
    setSubmitting(true)
    await onContinueWithEmail(email.trim(), password)
    setSubmitting(false)
  }

  return (
    <div className="h-svh w-full overflow-y-auto bg-neutral-50">
      <div className="min-h-full flex flex-col items-center px-6 pt-10 pb-10">
        <div className="w-12 h-12 rounded-2xl bg-neutral-900 flex items-center justify-center mb-4">
          <LayersIcon className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-semibold text-neutral-900 mb-1.5">Create your account</h1>
        <p className="text-sm text-neutral-500 mb-6 text-center max-w-xs">
          Sign in to see your layers and pins, and keep them synced across your devices.
        </p>

        {configured ? (
          <div className="w-full max-w-xs">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="border border-neutral-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-800"
              />
              <input
                type="password"
                autoComplete="current-password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="border border-neutral-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-800"
              />
              <button
                type="submit"
                disabled={submitting}
                className="bg-neutral-900 text-white text-sm font-medium rounded-xl py-3 disabled:opacity-60"
              >
                {submitting ? 'Please wait…' : 'Continue'}
              </button>
            </form>

            <p className="text-xs text-neutral-400 mt-2 text-center">
              Already have an account? Just enter your email and password again.
            </p>

            <div className="flex items-center gap-3 my-5">
              <div className="h-px flex-1 bg-neutral-200" />
              <span className="text-xs text-neutral-400">or</span>
              <div className="h-px flex-1 bg-neutral-200" />
            </div>

            <button
              onClick={onSignInWithGoogle}
              className="w-full flex items-center justify-center gap-3 bg-white border border-neutral-300 rounded-xl py-3 shadow-sm active:bg-neutral-50"
            >
              <GoogleIcon className="w-5 h-5" />
              <span className="text-sm font-medium text-neutral-800">Sign in with Google</span>
            </button>
          </div>
        ) : (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 max-w-xs text-center">
            Sign-in isn't configured yet. Add your Firebase project keys to enable sign-in.
          </p>
        )}

        {error && (
          <p className="mt-4 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 max-w-xs text-center">
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
