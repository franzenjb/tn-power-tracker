'use client'

import { useEffect, useState } from 'react'

interface OutageData {
  summary: {
    utilitiesTracked: number
    totalCustomersOut: number
    totalCustomersTracked: number
    nationalOutageRate: number
    coveragePercent: string
  }
  utilities: Array<{
    utility: string
    state: string
    rank: number
    customersOut: number
    customersTracked: number
    percentOut: number
    status: string
  }>
  timestamp: string
}

export default function Home() {
  const [data, setData] = useState<OutageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/outages/live')
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
              <h1 className="text-4xl font-black">US Power Outage Tracker</h1>
              <p className="text-xl opacity-90">Real-Time National Coverage</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-sm text-gray-500 mb-2">Total Customers Out</div>
            <div className="text-4xl font-bold text-rc-red">
              {data.summary.totalCustomersOut.toLocaleString()}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-sm text-gray-500 mb-2">Customers Tracked</div>
            <div className="text-4xl font-bold text-gray-800">
              {(data.summary.totalCustomersTracked / 1000000).toFixed(1)}M
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-sm text-gray-500 mb-2">National Outage Rate</div>
            <div className="text-4xl font-bold text-green-600">
              {data.summary.nationalOutageRate.toFixed(3)}%
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-sm text-gray-500 mb-2">US Coverage</div>
            <div className="text-4xl font-bold text-blue-600">
              {data.summary.coveragePercent}%
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-2xl font-bold text-gray-800">
              Live Utilities ({data.summary.utilitiesTracked} Active)
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Utility</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Customers Out</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Customers</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Outage %</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.utilities.map((util, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{util.rank}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {util.utility}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {util.state}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-rc-red">
                      {util.customersOut.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                      {util.customersTracked.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className={`font-medium ${util.percentOut > 1 ? 'text-red-600' : 'text-green-600'}`}>
                        {util.percentOut.toFixed(2)}%
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
          <p className="mt-2">American Red Cross • Power Outage Tracker • Beta</p>
          <p className="mt-1">Tracking {data.summary.coveragePercent}% of US households</p>
        </div>
      </div>
    </div>
  )
}
