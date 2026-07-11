import { useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth'
import { auth, googleProvider, isFirebaseConfigured } from './firebase'

const AUTH_TIMEOUT_MS = 15000

function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new TimeoutError()), AUTH_TIMEOUT_MS)
    }),
  ])
}

class TimeoutError extends Error {}

function errorMessage(err: unknown): string {
  if (err instanceof TimeoutError) {
    return "That's taking too long. Check your connection and try again."
  }
  const code = (err as { code?: string })?.code
  if (code === 'auth/unauthorized-domain') {
    return "This site's domain isn't authorized for sign-in yet. Add it under Firebase Authentication → Settings → Authorized domains."
  }
  if (code === 'auth/popup-blocked') {
    return 'Your browser blocked the sign-in popup. Allow popups for this site and try again.'
  }
  if (code === 'auth/popup-closed-by-user') {
    return "The sign-in window closed before finishing. If you didn't close it yourself, this usually means the domain isn't authorized yet, or Google sign-in isn't fully enabled in Firebase."
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Google sign-in is not enabled for this Firebase project. Turn it on under Authentication → Sign-in method.'
  }
  if (code === 'auth/weak-password') {
    return 'Password should be at least 6 characters.'
  }
  if (code === 'auth/invalid-email') {
    return "That doesn't look like a valid email address."
  }
  if (code === 'auth/too-many-requests') {
    return 'Too many attempts. Wait a bit and try again.'
  }
  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return 'Incorrect password for that email.'
  }
  if (code) return `Sign-in failed (${code}).`
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

  const signInWithGoogle = async () => {
    if (!auth) return
    setError(null)
    try {
      await withTimeout(signInWithPopup(auth, googleProvider))
    } catch (err) {
      const code = (err as { code?: string })?.code
      if (code === 'auth/cancelled-popup-request') return
      if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
        try {
          await withTimeout(signInWithRedirect(auth, googleProvider))
        } catch (redirectErr) {
          setError(errorMessage(redirectErr))
        }
        return
      }
      setError(errorMessage(err))
    }
  }

  // Tries to create a new account with this email/password. If the email is
  // already registered, falls straight into signing that account in instead,
  // so submitting the same form again just logs you in.
  const continueWithEmail = async (email: string, password: string) => {
    if (!auth) return
    setError(null)
    try {
      await withTimeout(createUserWithEmailAndPassword(auth, email, password))
    } catch (err) {
      const code = (err as { code?: string })?.code
      if (code !== 'auth/email-already-in-use') {
        setError(errorMessage(err))
        return
      }
      try {
        await withTimeout(signInWithEmailAndPassword(auth, email, password))
      } catch (loginErr) {
        const loginCode = (loginErr as { code?: string })?.code
        if (loginCode === 'auth/wrong-password' || loginCode === 'auth/invalid-credential') {
          setError('This email is already registered — check your password.')
        } else {
          setError(errorMessage(loginErr))
        }
      }
    }
  }

  const signOut = () => {
    if (!auth) return
    firebaseSignOut(auth)
  }

  return { user, loading, signInWithGoogle, continueWithEmail, signOut, configured: isFirebaseConfigured, error }
}
