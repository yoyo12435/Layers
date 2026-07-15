import { useCallback, useEffect, useState } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from './firebase'

export function useUserProfile(uid: string | null) {
  const [country, setCountryState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid || !db) {
      setCountryState(null)
      setLoading(false)
      return
    }
    setLoading(true)
    return onSnapshot(
      doc(db, 'users', uid),
      (snap) => {
        const data = snap.data()
        setCountryState((data?.country as string | undefined) ?? null)
        setLoading(false)
      },
      () => {
        // Firestore rules for this doc may not be deployed yet — fail open
        // rather than leaving loading stuck forever.
        setCountryState(null)
        setLoading(false)
      },
    )
  }, [uid])

  const setCountry = useCallback(
    (countryCode: string) => {
      if (!uid || !db) return
      setDoc(doc(db, 'users', uid), { country: countryCode }, { merge: true })
    },
    [uid],
  )

  return { country, setCountry, loading }
}
