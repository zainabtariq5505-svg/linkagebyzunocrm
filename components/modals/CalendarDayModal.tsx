'use client'

import { useState, useEffect } from 'react'
import { X, Trash2 } from 'lucide-react'
import { CRMData, Video } from '@/lib/types'
import { loadData, deleteVideo, updateVideo } from '@/lib/db'
import { getDayStats } from '@/lib/utils'

interface Props {
  date: string
  onClose: () => void
}

export default function CalendarDayModal({ date, onClose }: Props) {
  const [data, setData] = useState<CRMData | null>(null)
  const [dayStats, setDayStats] = useState<any>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState<any>(null)

  useEffect(() => {
    const crmData = loadData()
    setData(crmData)

    const dayOfWeek = new Date(date).getDay()
    const required = crmData.dailyRequirements.find(r => r.dayOfWeek === dayOfWeek)?.requiredVideos || 0
    const stats = getDayStats(date, crmData.videos, crmData.creators, required)
    setDayStats(stats)
  }, [date])

  const dayVideos = data ? data.videos.filter(v => v.date === date) : []

  const handleDelete = (id: string) => {
    if (confirm('Delete this video?')) {
      deleteVideo(id)
      window.location.reload()
    }
  }

  const handleUpdateStatus = (videoId: string, newStatus: string) => {
    updateVideo(videoId, { status: newStatus as any })
    setEditingId(null)
    window.location.reload()
  }

  if (!data || !dayStats) return null

  const formatDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{formatDate}</h2>
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">
              {dayStats.approved} of {dayStats.required} slots filled
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-slate-700">
          <div>
            <p className="text-xs text-gray-600 dark:text-slate-400">Total Views</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{dayStats.totalViews}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-slate-400">Average Views</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{dayStats.averageViews}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 dark:text-slate-400">Remaining</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {Math.max(0, dayStats.required - dayStats.approved)}
            </p>
          </div>
        </div>

        {/* Videos List */}
        <div className="space-y-3">
          {dayVideos.length === 0 ? (
            <p className="text-gray-600 dark:text-slate-400 text-center py-8">No videos scheduled for this day</p>
          ) : (
            dayVideos.map((video: Video) => {
              const creator = data.creators.find(c => c.id === video.creatorId)
              return (
                <div
                  key={video.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{creator?.name}</p>
                    <p className="text-sm text-gray-600 dark:text-slate-400">
                      Slot {video.slot} • {video.views} views
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {editingId === video.id ? (
                      <select
                        value={editStatus}
                        onChange={(e) => {
                          handleUpdateStatus(video.id, e.target.value)
                        }}
                        className="px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="Added">Added</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Missed">Missed</option>
                      </select>
                    ) : (
                      <span
                        onClick={() => {
                          setEditingId(video.id)
                          setEditStatus(video.status)
                        }}
                        className={`text-xs font-semibold px-2.5 py-1 rounded cursor-pointer ${
                          video.status === 'Approved'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : video.status === 'Rejected'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : video.status === 'Missed'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}
                      >
                        {video.status}
                      </span>
                    )}

                    <button
                      onClick={() => handleDelete(video.id)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                    >
                      <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-medium py-2.5 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}
