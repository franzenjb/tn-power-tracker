'use client'

import { useEffect, useState } from 'react'

interface OutageData {
  summary: {
    utilitiesTracked: number
    totalCustomersOut: number
    totalCustomersTracked: number
    stateOutageRate: string
  }
  utilities: Array<{
    utility: string
    county: string
    customersOut: number
    customersTracked: number
    percentOut: string
    status: string
    lastUpdated?: string
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
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-sm text-gray-500 mb-2">TN Customers Tracked</div>
            <div className="text-4xl font-bold text-gray-800">
              {(data.summary.totalCustomersTracked / 1000000).toFixed(2)}M
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {data.summary.utilitiesTracked} utilities reporting
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-sm text-gray-500 mb-2">State Outage Rate</div>
            <div className="text-4xl font-bold text-green-600">
              {data.summary.stateOutageRate}%
            </div>
            <div className="text-xs text-gray-400 mt-1">
              More accurate than PowerOutage.us
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-2xl font-bold text-gray-800">
              Tennessee Utilities ({data.summary.utilitiesTracked} Reporting)
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Direct API access to all major TN utilities - updated every 60 seconds
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utility</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">County/Region</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Customers Out</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Customers</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Outage %</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.utilities
                  .sort((a, b) => b.customersOut - a.customersOut)
                  .map((util, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {util.utility}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {util.county}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-rc-red">
                      {util.customersOut.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                      {util.customersTracked.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className={`font-medium ${parseFloat(util.percentOut) > 1 ? 'text-red-600' : 'text-green-600'}`}>
                        {util.percentOut}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      {util.status === 'success' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Error
                        </span>
                      )}
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
          <p className="mt-1">Tracking {(data.summary.totalCustomersTracked / 1000000).toFixed(2)}M customers across {data.summary.utilitiesTracked} Tennessee utilities</p>
          <p className="mt-1 text-xs">
            Direct API access provides more accurate data than PowerOutage.us for Tennessee
          </p>
        </div>
      </div>
    </div>
  )
}
