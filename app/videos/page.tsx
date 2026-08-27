'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, Trash2, Plus } from 'lucide-react'
import { CRMData } from '@/lib/types'
import { loadData, deleteVideo, updateVideo } from '@/lib/db'
import { getStatusColor } from '@/lib/utils'
import AddVideoModal from '@/components/modals/AddVideoModal'

export default function VideosPage() {
  const [data, setData] = useState<CRMData | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState<string>('')

  useEffect(() => {
    const crmData = loadData()
    setData(crmData)
  }, [])

  const handleDelete = (id: string) => {
    if (confirm('Delete this video?')) {
      deleteVideo(id)
      window.location.reload()
    }
  }

  const handleStatusChange = (videoId: string, newStatus: string) => {
    updateVideo(videoId, { status: newStatus as any })
    setEditingId(null)
    window.location.reload()
  }

  if (!data) return <div className="animate-pulse">Loading...</div>

  const sortedVideos = [...data.videos].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  const approved = data.videos.filter(v => v.status === 'Approved').length
  const rejected = data.videos.filter(v => v.status === 'Rejected').length
  const missed = data.videos.filter(v => v.status === 'Missed').length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Videos</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">
            {data.videos.length} total • {approved} approved • {rejected} rejected • {missed} missed
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          <Plus size={18} />
          Add Video
        </button>
      </div>

      {/* Videos Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">Creator</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">Slot</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">Views</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">Notes</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {sortedVideos.map((video) => {
                const creator = data.creators.find(c => c.id === video.creatorId)
                const date = new Date(video.date)
                const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })

                return (
                  <tr key={video.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 dark:text-white">{creator?.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                      {formattedDate}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                      {video.slot}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {video.views.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === video.id ? (
                        <select
                          value={editStatus}
                          onChange={(e) => handleStatusChange(video.id, e.target.value)}
                          className="px-2 py-1 text-xs border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                          className={`text-xs font-semibold px-2.5 py-1 rounded cursor-pointer inline-block ${getStatusColor(video.status)}`}
                        >
                          {video.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400 max-w-xs truncate">
                      {video.notes || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <a
                          href={video.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                          title="Open Video"
                        >
                          <ExternalLink size={16} className="text-blue-600 dark:text-blue-400" />
                        </a>
                        <button
                          onClick={() => handleDelete(video.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {sortedVideos.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-600 dark:text-slate-400">No videos yet. Create your first one!</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showAdd && <AddVideoModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}
