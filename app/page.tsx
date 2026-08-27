'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Calendar as CalendarIcon } from 'lucide-react'
import { CRMData, DayStats } from '@/lib/types'
import { loadData } from '@/lib/db'
import { getDayStats, formatNumber, getDateString } from '@/lib/utils'
import StatCard from '@/components/StatCard'
import AddCreatorModal from '@/components/modals/AddCreatorModal'
import AddVideoModal from '@/components/modals/AddVideoModal'

export default function Dashboard() {
  const router = useRouter()
  const [data, setData] = useState<CRMData | null>(null)
  const [todayStats, setTodayStats] = useState<DayStats | null>(null)
  const [showAddCreator, setShowAddCreator] = useState(false)
  const [showAddVideo, setShowAddVideo] = useState(false)

  useEffect(() => {
    const crmData = loadData()
    setData(crmData)

    // Calculate today's stats
    const today = getDateString(new Date())
    const dayOfWeek = new Date().getDay()
    const required = crmData.dailyRequirements.find(r => r.dayOfWeek === dayOfWeek)?.requiredVideos || 0
    const stats = getDayStats(today, crmData.videos, crmData.creators, required)
    setTodayStats(stats)
  }, [])

  if (!data || !todayStats) return <div className="animate-pulse">Loading...</div>

  const completeSlots = todayStats.slots.filter(s => s.status === 'complete').length
  const behindSlots = todayStats.slots.filter(s => s.status === 'behind').length

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-slate-400 mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowAddCreator(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
        >
          <Plus size={18} />
          Add Creator
        </button>
        <button
          onClick={() => setShowAddVideo(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
        >
          <Plus size={18} />
          Add Video
        </button>
        <button
          onClick={() => router.push('/calendar')}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors font-medium text-sm"
        >
          <CalendarIcon size={18} />
          Calendar
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Required"
          value={todayStats.required}
          color="bg-blue-500"
        />
        <StatCard
          label="Videos Added"
          value={todayStats.added}
          color="bg-purple-500"
        />
        <StatCard
          label="Videos Approved"
          value={todayStats.approved}
          color="bg-green-500"
        />
        <StatCard
          label="Remaining"
          value={Math.max(0, todayStats.required - todayStats.approved)}
          color="bg-orange-500"
        />
      </div>

      {/* Today's Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Today's Views</h3>
          <div className="space-y-3">
            <div>
              <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                {formatNumber(todayStats.totalViews)}
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-400">Total views</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-700 dark:text-slate-300">
                {formatNumber(todayStats.averageViews)}
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-400">Average per video</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Scheduled Today</h3>
          <div className="space-y-3">
            <div>
              <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                {data.creators.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-400">Active creators</p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-700 dark:text-slate-300">
                {completeSlots}
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-400">Slots filled</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-slate-400">Complete</span>
              <span className="font-semibold text-green-600 dark:text-green-400">{completeSlots}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-slate-400">Behind</span>
              <span className="font-semibold text-red-600 dark:text-red-400">{behindSlots}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-slate-400">Missing</span>
              <span className="font-semibold text-yellow-600 dark:text-yellow-400">{Math.max(0, todayStats.required - completeSlots - behindSlots)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Slot Status */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Today's Slots</h3>
        <div className="grid grid-cols-10 gap-2">
          {todayStats.slots.map((slot) => (
            <div
              key={slot.slot}
              className={`aspect-square rounded-lg flex items-center justify-center text-xs font-semibold text-white cursor-pointer hover:opacity-80 transition-opacity ${
                slot.status === 'complete'
                  ? 'bg-green-500'
                  : slot.status === 'partial'
                  ? 'bg-yellow-500'
                  : slot.status === 'behind'
                  ? 'bg-red-500'
                  : 'bg-gray-300 dark:bg-slate-600'
              }`}
              title={slot.creatorName || `Slot ${slot.slot}`}
            >
              {slot.slot}
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showAddCreator && <AddCreatorModal onClose={() => setShowAddCreator(false)} />}
      {showAddVideo && <AddVideoModal onClose={() => setShowAddVideo(false)} />}
    </div>
  )
}
