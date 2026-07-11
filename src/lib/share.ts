import type { Layer } from '../types'

const SHARE_PARAM = 'layer'

function toBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(
    value.length + ((4 - (value.length % 4)) % 4),
    '=',
  )
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export function encodeLayer(layer: Layer): string {
  const json = JSON.stringify(layer)
  const bytes = new TextEncoder().encode(json)
  return toBase64Url(bytes)
}

export function decodeLayer(encoded: string): Layer | null {
  try {
    const bytes = fromBase64Url(encoded)
    const json = new TextDecoder().decode(bytes)
    const layer = JSON.parse(json)
    if (!layer || typeof layer !== 'object' || !Array.isArray(layer.locations)) return null
    return layer as Layer
  } catch {
    return null
  }
}

export function buildShareUrl(layer: Layer): string {
  const url = new URL(window.location.href)
  url.search = ''
  url.searchParams.set(SHARE_PARAM, encodeLayer(layer))
  return url.toString()
}

export function readSharedLayerFromUrl(): Layer | null {
  const url = new URL(window.location.href)
  const encoded = url.searchParams.get(SHARE_PARAM)
  if (!encoded) return null
  return decodeLayer(encoded)
}

export function clearShareParamFromUrl(): void {
  const url = new URL(window.location.href)
  url.searchParams.delete(SHARE_PARAM)
  window.history.replaceState({}, '', url.toString())
}
