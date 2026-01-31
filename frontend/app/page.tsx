'use client'

import { useEffect, useState } from 'react'

interface OutageData {
  summary: {
    countiesReporting: number
    totalCustomersOut: number
    totalCustomersTracked: number
    stateOutageRate: string
  }
  counties: Array<{
    county: string
    customersOut: number
    customersTracked: number
    percentOut: string
    utilities: string[]
    lastUpdated: string
  }>
  timestamp: string
  state: string
}

export default function Home() {
  const [data, setData] = useState<OutageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/outages/tennessee')
        const json = await response.json()
        setData(json)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 60000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-gray-600">Loading live outage data...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-red-600">Error loading data</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-rc-red text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-white rounded mr-4 flex items-center justify-center">
              <span className="text-rc-red text-3xl font-black">+</span>
            </div>
            <div>
              <h1 className="text-4xl font-black">Tennessee Power Outage Tracker</h1>
              <p className="text-xl opacity-90">Real-Time Data from All Major TN Utilities</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-sm text-gray-500 mb-2">Total Customers Out</div>
            <div className="text-4xl font-bold text-rc-red">
              {data.summary.totalCustomersOut.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Across {data.summary.countiesReporting} TN counties
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-sm text-gray-500 mb-2">TN Customers Tracked</div>
            <div className="text-4xl font-bold text-gray-800">
              {(data.summary.totalCustomersTracked / 1000000).toFixed(2)}M
            </div>
            <div className="text-xs text-gray-400 mt-1">
              County-level data from direct APIs
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-sm text-gray-500 mb-2">State Outage Rate</div>
            <div className="text-4xl font-bold text-green-600">
              {data.summary.stateOutageRate}%
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {data.counties.filter(c => c.customersOut > 0).length} counties affected
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-2xl font-bold text-gray-800">
              Tennessee Counties ({data.summary.countiesReporting} Reporting)
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              County-level outage data from direct utility APIs - updated every 60 seconds
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">County</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Customers Out</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Customers</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Outage %</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utilities</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.counties.map((county, idx) => (
                  <tr key={idx} className={`hover:bg-gray-50 ${county.customersOut > 0 ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {county.county} County
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-rc-red">
                      {county.customersOut.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                      {county.customersTracked.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className={`font-medium ${parseFloat(county.percentOut) > 1 ? 'text-red-600' : 'text-green-600'}`}>
                        {county.percentOut}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate">
                        {county.utilities.join(', ')}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Last updated: {new Date(data.timestamp).toLocaleString()}</p>
          <p className="mt-2">American Red Cross • Tennessee Power Outage Tracker</p>
          <p className="mt-1">
            Tracking {(data.summary.totalCustomersTracked / 1000000).toFixed(2)}M customers across {data.summary.countiesReporting} Tennessee counties
          </p>
          <p className="mt-1 text-xs font-semibold text-green-700">
            ✓ County-level data from direct utility APIs - More accurate than PowerOutage.us
          </p>
        </div>
      </div>
    </div>
  )
}
