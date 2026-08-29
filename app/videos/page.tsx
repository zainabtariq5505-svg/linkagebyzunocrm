'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, Trash2, Plus, Edit2, Eye, Heart, MessageCircle } from 'lucide-react'
import { CRMData } from '@/lib/types'
import { loadData, deleteVideo } from '@/lib/db'
import { getStatusColor } from '@/lib/utils'
import AddVideoModal from '@/components/modals/AddVideoModal'
import EditVideoModal from '@/components/modals/EditVideoModal'
import SearchFilter from '@/components/SearchFilter'
import { addActivityLog } from '@/lib/activityLog'

export default function VideosPage() {
  const [data, setData] = useState<CRMData | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editingVideo, setEditingVideo] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({})

  useEffect(() => {
    const crmData = loadData()
    setData(crmData)
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm('Delete this video?')) {
      await deleteVideo(id)
      addActivityLog('delete_video', `Video ${id}`, 'Deleted video')
      alert('✅ Deleted from cloud!')
      window.location.reload()
    }
  }

  if (!data) return <div className="animate-pulse">Loading...</div>

  // Filter videos
  let filteredVideos = [...data.videos]

  // Search filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    filteredVideos = filteredVideos.filter(v => {
      const creator = data.creators.find(c => c.id === v.creatorId)
      return (
        creator?.name.toLowerCase().includes(query) ||
        v.videoUrl.toLowerCase().includes(query) ||
        v.notes?.toLowerCase().includes(query)
      )
    })
  }

  // Status filter
  if (filters.status) {
    filteredVideos = filteredVideos.filter(v => v.status === filters.status)
  }

  // Creator filter
  if (filters.creator) {
    filteredVideos = filteredVideos.filter(v => v.creatorId === filters.creator)
  }

  // Date range filter
  if (filters.dateFrom) {
    filteredVideos = filteredVideos.filter(v => v.date >= filters.dateFrom)
  }
  if (filters.dateTo) {
    filteredVideos = filteredVideos.filter(v => v.date <= filters.dateTo)
  }

  const sortedVideos = filteredVideos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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
            {sortedVideos.length} results • {approved} approved • {rejected} rejected • {missed} missed
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

      {/* Search & Filter */}
      <SearchFilter
        onSearchChange={setSearchQuery}
        onFilterChange={setFilters}
        placeholder="Search by creator, URL, or notes..."
        filterOptions={[
          {
            label: 'Status',
            value: 'status',
            options: [
              { label: 'Added', value: 'Added' },
              { label: 'Approved', value: 'Approved' },
              { label: 'Rejected', value: 'Rejected' },
              { label: 'Missed', value: 'Missed' },
            ],
          },
          {
            label: 'Creator',
            value: 'creator',
            options: data.creators.map(c => ({ label: c.name, value: c.id })),
          },
        ]}
      />

      {/* Videos Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">👤 Creator</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">📅 Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">#️⃣ Slot</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white"><Eye size={16} className="inline mr-1" /> Views</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white"><Heart size={16} className="inline mr-1" /> Likes</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white"><MessageCircle size={16} className="inline mr-1" /> Comments</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">✔️ Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 dark:text-white">⚙️ Actions</th>
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
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                      {video.likes || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                      {video.comments || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded inline-block ${getStatusColor(video.status)}`}>
                        {video.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingVideo(video)}
                          className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} className="text-purple-600 dark:text-purple-400" />
                        </button>
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
            <p className="text-gray-600 dark:text-slate-400">
              {data.videos.length === 0 ? 'No videos yet. Create your first one!' : 'No videos match your filters.'}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAdd && <AddVideoModal onClose={() => setShowAdd(false)} />}
      {editingVideo && <EditVideoModal video={editingVideo} onClose={() => setEditingVideo(null)} />}
    </div>
  )
}
