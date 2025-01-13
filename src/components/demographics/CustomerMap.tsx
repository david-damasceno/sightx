import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Card } from "@/components/ui/card"

interface CustomerLocation {
  latitude: number
  longitude: number
  customerCount: number
}

interface CustomerMapProps {
  locations: CustomerLocation[]
  center?: [number, number]
}

export function CustomerMap({ locations, center = [-46.6333, -23.5505] }: CustomerMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<mapboxgl.Map | null>(null)
  const sourceAdded = useRef<boolean>(false)

  useEffect(() => {
    if (!mapContainer.current) return

    mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHNqOWh4NW0wMWZqMmtvNzVwOGN0Z2NyIn0.LwHlUJE_mJCRKGzx_LxqaA'

    if (!mapInstance.current) {
      mapInstance.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: center,
        zoom: 11
      })

      mapInstance.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

      mapInstance.current.on('load', () => {
        if (!mapInstance.current || sourceAdded.current) return

        // Add heatmap layer
        mapInstance.current.addSource('customers', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: locations.map(loc => ({
              type: 'Feature',
              properties: {
                customerCount: loc.customerCount
              },
              geometry: {
                type: 'Point',
                coordinates: [loc.longitude, loc.latitude]
              }
            }))
          }
        })

        mapInstance.current.addLayer({
          id: 'customers-heat',
          type: 'heatmap',
          source: 'customers',
          paint: {
            'heatmap-weight': [
              'interpolate',
              ['linear'],
              ['get', 'customerCount'],
              0, 0,
              10, 1
            ],
            'heatmap-intensity': 1,
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(33,102,172,0)',
              0.2, 'rgb(103,169,207)',
              0.4, 'rgb(209,229,240)',
              0.6, 'rgb(253,219,199)',
              0.8, 'rgb(239,138,98)',
              1, 'rgb(178,24,43)'
            ],
            'heatmap-radius': 30
          }
        })

        sourceAdded.current = true
      })
    }

    // Update source data when locations change
    if (mapInstance.current && sourceAdded.current) {
      const source = mapInstance.current.getSource('customers')
      if (source) {
        (source as mapboxgl.GeoJSONSource).setData({
          type: 'FeatureCollection',
          features: locations.map(loc => ({
            type: 'Feature',
            properties: {
              customerCount: loc.customerCount
            },
            geometry: {
              type: 'Point',
              coordinates: [loc.longitude, loc.latitude]
            }
          }))
        })
      }
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
        sourceAdded.current = false
      }
    }
  }, [locations, center])

  return (
    <Card className="p-0 overflow-hidden">
      <div ref={mapContainer} className="w-full h-[400px]" />
    </Card>
  )
}