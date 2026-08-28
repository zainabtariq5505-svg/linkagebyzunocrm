'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Calendar } from 'lucide-react'
import { CRMData, DayStats } from '@/lib/types'
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
    // Load data from Supabase first, then fallback to localStorage
    const loadInitialData = async () => {
      const { loadDataFromSupabase } = await import('@/lib/db')
      const crmData = await loadDataFromSupabase()
      setData(crmData)

      // Calculate today's stats
      const today = getDateString(new Date())
      const dayOfWeek = new Date().getDay()
      const required = crmData.dailyRequirements.find(r => r.dayOfWeek === dayOfWeek)?.requiredVideos || 0
      const stats = getDayStats(today, crmData.videos, crmData.creators, required)
      setTodayStats(stats)
    }

    loadInitialData()
  }, [])

  if (!data || !todayStats) return <div className="animate-pulse">Loading...</div>

  const completeSlots = todayStats.slots.filter(s => s.status === 'complete').length
  const behindSlots = todayStats.slots.filter(s => s.status === 'behind').length

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with Logo */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <img src="/logo.svg" alt="Linkage Logo" className="w-8 h-8" />
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600">Dashboard</h1>
          </div>
          <p className="text-gray-600 dark:text-slate-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <img src="/logo.svg" alt="Linkage" className="w-12 h-12 opacity-20" />
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
          <Calendar size={18} />
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
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800/30 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Today's Views</h3>
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatNumber(todayStats.totalViews)}
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-400">Total views today</p>
            </div>
            <div className="pt-2 border-t border-blue-200 dark:border-blue-800/50">
              <p className="text-xl font-semibold text-gray-700 dark:text-slate-300">
                {formatNumber(todayStats.averageViews)}
              </p>
              <p className="text-xs text-gray-600 dark:text-slate-400">Average per video</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-900/10 rounded-xl border border-purple-200 dark:border-purple-800/30 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Scheduled Today</h3>
            <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {data.creators.length}
              </p>
              <p className="text-sm text-gray-600 dark:text-slate-400">Active creators</p>
            </div>
            <div className="pt-2 border-t border-purple-200 dark:border-purple-800/50">
              <p className="text-xl font-semibold text-gray-700 dark:text-slate-300">
                {completeSlots}
              </p>
              <p className="text-xs text-gray-600 dark:text-slate-400">Slots filled</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/10 rounded-xl border border-green-200 dark:border-green-800/30 p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Daily Status</h3>
            <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 dark:text-slate-400">✓ Complete</span>
              <span className="font-bold text-green-600 dark:text-green-400">{completeSlots}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 dark:text-slate-400">⚠ Behind</span>
              <span className="font-bold text-red-600 dark:text-red-400">{behindSlots}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600 dark:text-slate-400">— Missing</span>
              <span className="font-bold text-yellow-600 dark:text-yellow-400">{Math.max(0, todayStats.required - completeSlots - behindSlots)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Slot Status */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Today's Slots</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Real-time slot allocation</p>
          </div>
          <div className="flex gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-slate-400">Complete</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-slate-400">Partial</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-slate-400">Behind</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-10 gap-2">
          {todayStats.slots.map((slot) => (
            <div
              key={slot.slot}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-bold text-white cursor-pointer hover:shadow-lg transition-all transform hover:scale-110 ${
                slot.status === 'complete'
                  ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg'
                  : slot.status === 'partial'
                  ? 'bg-gradient-to-br from-yellow-500 to-yellow-600'
                  : slot.status === 'behind'
                  ? 'bg-gradient-to-br from-red-500 to-red-600'
                  : 'bg-gray-300 dark:bg-slate-600'
              }`}
              title={slot.creatorName || `Slot ${slot.slot}`}
            >
              <span>{slot.slot}</span>
              {slot.creatorName && <span className="text-xs opacity-75">({slot.creatorName.charAt(0)})</span>}
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
