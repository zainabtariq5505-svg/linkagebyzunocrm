'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { CRMData } from '@/lib/types'
import { loadData } from '@/lib/db'
import { formatNumber, getDateString } from '@/lib/utils'

export default function AnalyticsPage() {
  const [data, setData] = useState<CRMData | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d')
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    const crmData = loadData()
    setData(crmData)

    // Generate chart data
    const days = timeRange === '7d' ? 7 : 30
    const today = new Date()
    const data_points = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = getDateString(date)

      const dayVideos = crmData.videos.filter(v => v.date === dateStr)
      const totalViews = dayVideos.reduce((sum, v) => sum + v.views, 0)
      const averageViews = dayVideos.length > 0 ? Math.round(totalViews / dayVideos.length) : 0

      data_points.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        views: totalViews,
        average: averageViews,
        videos: dayVideos.length,
      })
    }

    setChartData(data_points)
  }, [timeRange])

  if (!data) return <div className="animate-pulse">Loading...</div>

  const approved = data.videos.filter(v => v.status === 'Approved').length
  const rejected = data.videos.filter(v => v.status === 'Rejected').length
  const missed = data.videos.filter(v => v.status === 'Missed').length
  const totalViews = data.videos.reduce((sum, v) => sum + v.views, 0)
  const totalVideos = data.videos.length
  const averageViews = totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-600 dark:text-slate-400 mt-1">View performance metrics and trends</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Total Videos</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalVideos}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Total Views</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(totalViews)}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Avg Views</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(averageViews)}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Approved</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{approved}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">Rejected/Missed</p>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{rejected + missed}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Views Over Time</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('7d')}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                timeRange === '7d'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('30d')}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                timeRange === '30d'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Line type="monotone" dataKey="views" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-600 dark:text-slate-400">
            No data available
          </div>
        )}
      </div>

      {/* Status Breakdown */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Status Breakdown</h2>
        <div className="space-y-4">
          {[
            { label: 'Approved', value: approved, color: 'bg-green-500' },
            { label: 'Rejected', value: rejected, color: 'bg-red-500' },
            { label: 'Missed', value: missed, color: 'bg-orange-500' },
            { label: 'Added', value: data.videos.filter(v => v.status === 'Added').length, color: 'bg-yellow-500' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-sm text-gray-600 dark:text-slate-400">{item.label}</span>
              <span className="ml-auto text-sm font-semibold text-gray-900 dark:text-white">{item.value}</span>
              <span className="text-sm text-gray-600 dark:text-slate-400">
                ({totalVideos > 0 ? Math.round((item.value / totalVideos) * 100) : 0}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
