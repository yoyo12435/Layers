export interface GeoPosition {
  lat: number
  lng: number
  accuracy: number
}

export function geolocationErrorMessage(err: unknown): string {
  const code = (err as GeolocationPositionError | undefined)?.code
  if (code === 1) {
    return "Location access is blocked for this site. Enable it in your browser or phone's site settings, then try again."
  }
  if (code === 2) {
    return "Couldn't determine your location. Make sure location services are turned on for your browser."
  }
  if (code === 3) {
    return 'Finding your location took too long. Try again outdoors or with a clearer signal.'
  }
  if (err instanceof Error && !('code' in err)) return err.message
  return "Couldn't get your location. Check your device's location settings."
}

// Web pages can't deep-link into a phone's OS-level Settings app — there's
// no JS API for that on iOS or Android — so the best a "shortcut" can do is
// point at the exact steps for this device instead of guessing at generic
// wording.
export function locationPermissionSteps(): string[] {
  const ua = navigator.userAgent
  if (/iPhone|iPad|iPod/.test(ua)) {
    return ['Open the Settings app', 'Scroll down to Safari (or your browser)', 'Tap Location, then choose "Allow" or "Ask Next Time"']
  }
  if (/Android/.test(ua)) {
    return ['Tap the lock or info icon next to the address bar', 'Tap Permissions (or Site settings)', 'Set Location to Allow']
  }
  return ['Click the lock or info icon next to the address bar', 'Open Site settings', 'Set Location to Allow']
}

function requestPosition(options: PositionOptions): Promise<GeoPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy }),
      (err) => reject(err),
      options,
    )
  })
}

export async function getCurrentPosition(): Promise<GeoPosition> {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported on this device.')
  }
  try {
    return await requestPosition({ enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 })
  } catch (err) {
    // Permission denial won't be fixed by retrying with different accuracy
    // settings, so surface it immediately instead of waiting on a retry.
    if ((err as GeolocationPositionError)?.code === 1) throw err
    // High-accuracy GPS often stalls indoors or on the first fix; fall back
    // to a coarser, faster network/wifi-based location.
    return await requestPosition({ enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 })
  }
}
