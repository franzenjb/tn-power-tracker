'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import type { FeatureCollection } from 'geojson'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

interface OutageData {
  timestamp: string
  total_counties: number
  counties_affected: number
  total_customers_out: number
  total_customers_tracked: number
  outage_percent: number
  counties: {
    [county: string]: {
      customers_out: number
      customers_tracked: number
      timestamp: string
      source: string
      outage_percent: number
    }
  }
}

function getColorByOutage(percent: number): string {
  if (percent === 0) return 'transparent'
  if (percent < 1) return '#FEE'
  if (percent < 5) return '#FC9'
  if (percent < 10) return '#F96'
  if (percent < 20) return '#F33'
  return '#C00'
}

function MapUpdater({ data }: { data: OutageData | null }) {
  const map = useMap()

  useEffect(() => {
    if (data) {
      // Fit to Tennessee bounds
      map.fitBounds([
        [34.98, -90.31],
        [36.68, -81.65]
      ])
    }
  }, [data, map])

  return null
}

export default function OutageMap() {
  const [outageData, setOutageData] = useState<OutageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/data/current_outages.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch data')
        return res.json()
      })
      .then(data => {
        setOutageData(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })

    // Auto-refresh every 15 minutes
    const interval = setInterval(() => {
      fetch('/data/current_outages.json')
        .then(res => res.json())
        .then(data => setOutageData(data))
        .catch(console.error)
    }, 15 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rc-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading outage data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 font-bold mb-2">Error loading data</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full">
      {/* Stats panel */}
      {outageData && (
        <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-4 max-w-sm">
          <h2 className="text-rc-red font-bold text-lg mb-3">Tennessee Power Outages</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-black text-rc-dark-red">
                {outageData.total_customers_out.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">Customers Out</div>
            </div>

            <div>
              <div className="text-2xl font-black text-rc-dark-red">
                {outageData.counties_affected}
              </div>
              <div className="text-xs text-gray-600">Counties Affected</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Last updated: {new Date(outageData.timestamp).toLocaleTimeString()}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="text-xs font-bold mb-2">Outage Level</div>
            <div className="space-y-1">
              <div className="flex items-center">
                <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#FEE' }}></div>
                <span className="text-xs">&lt; 1%</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#FC9' }}></div>
                <span className="text-xs">1-5%</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#F96' }}></div>
                <span className="text-xs">5-10%</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#F33' }}></div>
                <span className="text-xs">10-20%</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 mr-2" style={{ backgroundColor: '#C00' }}></div>
                <span className="text-xs">&gt; 20%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <MapContainer
        center={[35.5, -86]}
        zoom={7}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {outageData && <MapUpdater data={outageData} />}

        {/* TODO: Add GeoJSON layer with county boundaries and outage data */}
      </MapContainer>
    </div>
  )
}
