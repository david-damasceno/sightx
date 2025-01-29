import { useEffect, useRef } from "react"
import { Loader } from "@googlemaps/js-api-loader"
import { supabase } from "@/integrations/supabase/client"

export function BackgroundMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)

  useEffect(() => {
    const initMap = async () => {
      try {
        const { data: { secret } } = await supabase.functions.invoke('get-google-maps-key')
        
        if (!secret) {
          console.error('Google Maps API key not found')
          return
        }

        const loader = new Loader({
          apiKey: secret,
          version: "weekly",
        })

        const google = await loader.load()
        
        if (!mapRef.current) return

        const mapOptions = {
          center: { lat: -23.5505, lng: -46.6333 }, // São Paulo
          zoom: 12,
          disableDefaultUI: true,
          styles: [
            {
              featureType: "all",
              elementType: "geometry",
              stylers: [{ color: "#242f3e" }],
            },
            {
              featureType: "all",
              elementType: "labels.text.stroke",
              stylers: [{ color: "#242f3e" }],
            },
            {
              featureType: "all",
              elementType: "labels.text.fill",
              stylers: [{ color: "#746855" }],
            },
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#17263c" }],
            },
          ],
        }

        mapInstanceRef.current = new google.maps.Map(mapRef.current, mapOptions)
      } catch (error) {
        console.error('Error initializing map:', error)
      }
    }

    initMap()

    return () => {
      // Cleanup
      mapInstanceRef.current = null
    }
  }, [])

  return (
    <div 
      ref={mapRef} 
      className="absolute inset-0 z-0 opacity-50"
      aria-hidden="true"
    />
  )
}