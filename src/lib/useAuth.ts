import { useEffect, useState } from 'react'
import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { auth, googleProvider, isFirebaseConfigured } from './firebase'

function errorMessage(err: unknown): string {
  const code = (err as { code?: string })?.code
  if (code === 'auth/unauthorized-domain') {
    return "This site's domain isn't authorized for sign-in yet. Add it under Firebase Authentication → Settings → Authorized domains."
  }
  if (code === 'auth/popup-blocked') {
    return 'Your browser blocked the sign-in popup. Allow popups for this site and try again.'
  }
  if (typeof err === 'object' && err && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
    return (err as { message: string }).message
  }
  return 'Sign-in failed. Please try again.'
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }
    getRedirectResult(auth).catch((err) => setError(errorMessage(err)))
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  const signIn = async () => {
    if (!auth) return
    setError(null)
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      const code = (err as { code?: string })?.code
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return
      if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
        try {
          await signInWithRedirect(auth, googleProvider)
        } catch (redirectErr) {
          setError(errorMessage(redirectErr))
        }
        return
      }
      setError(errorMessage(err))
    }
  }

  const signOut = () => {
    if (!auth) return
    firebaseSignOut(auth)
  }

  return { user, loading, signIn, signOut, configured: isFirebaseConfigured, error }
}
