import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { Layer } from '../types'
import { db } from './firebase'

const SHARE_PARAM = 's'
const SHARE_COLLECTION = 'sharedLayers'
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

function generateShortId(length = 8): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('')
}

// Publishes a snapshot of the layer under a short random id instead of
// encoding the whole layer (name + every location) into the URL itself,
// which made links too long to share reliably.
export async function buildShareUrl(layer: Layer): Promise<string> {
  if (!db) throw new Error('Sharing requires sign-in to be set up first.')
  const shortId = generateShortId()
  await setDoc(doc(db, SHARE_COLLECTION, shortId), {
    id: layer.id,
    name: layer.name,
    locations: layer.locations,
    visible: true,
    owned: false,
    sharedAt: Date.now(),
  })
  const url = new URL(window.location.href)
  url.search = ''
  url.searchParams.set(SHARE_PARAM, shortId)
  return url.toString()
}

export function hasShareParam(): boolean {
  return new URL(window.location.href).searchParams.has(SHARE_PARAM)
}

export async function readSharedLayerFromUrl(): Promise<Layer | null> {
  const shortId = new URL(window.location.href).searchParams.get(SHARE_PARAM)
  if (!shortId || !db) return null
  try {
    const snap = await getDoc(doc(db, SHARE_COLLECTION, shortId))
    if (!snap.exists()) return null
    const data = snap.data()
    if (!data || !Array.isArray(data.locations)) return null
    return data as Layer
  } catch {
    return null
  }
}

export function clearShareParamFromUrl(): void {
  const url = new URL(window.location.href)
  url.searchParams.delete(SHARE_PARAM)
  window.history.replaceState({}, '', url.toString())
}
