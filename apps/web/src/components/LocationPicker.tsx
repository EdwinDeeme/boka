'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Navigation, Loader2, CheckCircle2 } from 'lucide-react'

export type LatLng = { lat: number; lng: number }

interface LocationPickerProps {
  value: LatLng | null
  onChange: (coords: LatLng, address?: string) => void
}

// San Isidro de El General center
const DEFAULT_CENTER: LatLng = { lat: 9.3747, lng: -83.7034 }
const DEFAULT_ZOOM = 15

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletMap = useRef<import('leaflet').Map | null>(null)
  const markerRef = useRef<import('leaflet').Marker | null>(null)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gpsError, setGpsError] = useState('')
  const [address, setAddress] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // Reverse geocode using Nominatim (free, no key)
  async function reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=es`,
        { headers: { 'Accept-Language': 'es' } }
      )
      const data = await res.json()
      return data.display_name ?? ''
    } catch {
      return ''
    }
  }

  async function placeMarker(lat: number, lng: number, map: import('leaflet').Map) {
    const L = (await import('leaflet')).default
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
    } else {
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:36px;height:36px;background:#f97316;border:3px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 4px 12px rgba(249,115,22,0.5)"></div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
      })
      markerRef.current = L.marker([lat, lng], { icon, draggable: true }).addTo(map)
      markerRef.current.on('dragend', async () => {
        const pos = markerRef.current!.getLatLng()
        const addr = await reverseGeocode(pos.lat, pos.lng)
        setAddress(addr)
        onChange({ lat: pos.lat, lng: pos.lng }, addr)
      })
    }
    map.setView([lat, lng], DEFAULT_ZOOM)
    const addr = await reverseGeocode(lat, lng)
    setAddress(addr)
    onChange({ lat, lng }, addr)
  }

  // Init map
  useEffect(() => {
    if (!mounted || !mapRef.current || leafletMap.current) return

    let map: import('leaflet').Map

    async function init() {
      const L = (await import('leaflet')).default

      // Fix default icon paths broken by webpack
      // @ts-expect-error _getIconUrl
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      map = L.map(mapRef.current!, {
        center: value ? [value.lat, value.lng] : [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
        attributionControl: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map)

      leafletMap.current = map

      // Click to place marker
      map.on('click', async (e) => {
        await placeMarker(e.latlng.lat, e.latlng.lng, map)
      })

      // If value already set, place marker
      if (value) {
        await placeMarker(value.lat, value.lng, map)
      }
    }

    init()

    return () => {
      map?.remove()
      leafletMap.current = null
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted])

  async function handleGPS() {
    if (!navigator.geolocation) {
      setGpsError('Tu navegador no soporta geolocalización.')
      return
    }
    setGpsLoading(true)
    setGpsError('')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        if (leafletMap.current) {
          await placeMarker(lat, lng, leafletMap.current)
        }
        setGpsLoading(false)
      },
      (err) => {
        setGpsLoading(false)
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Permiso de ubicación denegado. Actívalo en tu navegador.')
        } else {
          setGpsError('No se pudo obtener tu ubicación.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  if (!mounted) return null

  return (
    <div className="space-y-3">
      {/* Map container */}
      <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: '280px' }}>
        <div ref={mapRef} className="w-full h-full" />

        {/* GPS button — overlaid on map */}
        <div className="absolute bottom-3 right-3 z-[1000]">
          <motion.button
            type="button"
            whileTap={{ scale: 0.93 }}
            onClick={handleGPS}
            disabled={gpsLoading}
            className="flex items-center gap-2 bg-white border border-gray-200 shadow-lg rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
          >
            {gpsLoading
              ? <Loader2 size={15} className="animate-spin text-brand-500" />
              : <Navigation size={15} className="text-brand-500" />
            }
            {gpsLoading ? 'Obteniendo...' : 'Mi ubicación exacta'}
          </motion.button>
        </div>

        {/* Hint overlay when no marker yet */}
        <AnimatePresence>
          {!value && (
            <motion.div
              initial={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-[999]"
            >
              <div className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-2 shadow-md">
                <MapPin size={16} className="text-brand-500 shrink-0" />
                <span className="text-sm text-gray-600 font-medium">Toca el mapa o usa tu GPS</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* GPS error */}
      <AnimatePresence>
        {gpsError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-xs text-red-500 font-medium"
          >
            {gpsError}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Confirmed address */}
      <AnimatePresence>
        {value && address && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-start gap-2 bg-brand-50 border border-brand-200 rounded-xl px-3 py-2.5"
          >
            <CheckCircle2 size={15} className="text-brand-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-brand-700 mb-0.5">Ubicación seleccionada</p>
              <p className="text-xs text-brand-600 leading-relaxed">{address}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy note */}
      <p className="text-xs text-gray-400 leading-relaxed">
        Tu dirección será eliminada de nuestro sistema una vez que la entrega sea completada.
      </p>
    </div>
  )
}
