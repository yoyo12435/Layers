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
