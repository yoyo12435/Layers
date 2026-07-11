import { useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithRedirect, signOut as firebaseSignOut, type User } from 'firebase/auth'
import { auth, googleProvider, isFirebaseConfigured } from './firebase'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(isFirebaseConfigured)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }
    return onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  const signIn = () => {
    if (!auth) return
    signInWithRedirect(auth, googleProvider)
  }

  const signOut = () => {
    if (!auth) return
    firebaseSignOut(auth)
  }

  return { user, loading, signIn, signOut, configured: isFirebaseConfigured }
}
