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
// which made links too long to share reliably. Re-sharing a layer that
// already has a shareId updates that same doc in place (owner-only) so
// recipients can later "refresh" to pull in the latest content.
export async function buildShareUrl(layer: Layer, ownerUid: string): Promise<{ url: string; shareId: string }> {
  if (!db) throw new Error('Sharing requires sign-in to be set up first.')
  const shortId = layer.shareId ?? generateShortId()
  await setDoc(doc(db, SHARE_COLLECTION, shortId), {
    id: layer.id,
    name: layer.name,
    locations: layer.locations,
    visible: true,
    owned: false,
    ownerId: ownerUid,
    sharedAt: Date.now(),
  })
  const url = new URL(window.location.href)
  url.search = ''
  url.searchParams.set(SHARE_PARAM, shortId)
  return { url: url.toString(), shareId: shortId }
}

export function hasShareParam(): boolean {
  return new URL(window.location.href).searchParams.has(SHARE_PARAM)
}

export function getShareIdFromUrl(): string | null {
  return new URL(window.location.href).searchParams.get(SHARE_PARAM)
}

export async function fetchSharedLayer(shortId: string): Promise<Layer | null> {
  if (!db) return null
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

export async function readSharedLayerFromUrl(): Promise<Layer | null> {
  const shortId = getShareIdFromUrl()
  if (!shortId) return null
  return fetchSharedLayer(shortId)
}

export function clearShareParamFromUrl(): void {
  const url = new URL(window.location.href)
  url.searchParams.delete(SHARE_PARAM)
  window.history.replaceState({}, '', url.toString())
}
