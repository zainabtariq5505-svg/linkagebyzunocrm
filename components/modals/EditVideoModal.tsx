'use client'

import { useState, useEffect } from 'react'
import { X, Loader } from 'lucide-react'
import { updateVideo, loadData } from '@/lib/db'
import { Creator, Video } from '@/lib/types'
import { fetchInstagramVideoStats, isValidInstagramVideoUrl } from '@/lib/instagram'
import { addActivityLog } from '@/lib/activityLog'

interface Props {
  video: Video
  onClose: () => void
}

export default function EditVideoModal({ video, onClose }: Props) {
  const [creators, setCreators] = useState<Creator[]>([])
  const [formData, setFormData] = useState({
    creatorId: video.creatorId,
    date: video.date,
    slot: video.slot.toString(),
    videoUrl: video.videoUrl,
    views: video.views.toString(),
    likes: (video.likes || '').toString(),
    comments: (video.comments || '').toString(),
    status: video.status,
    notes: video.notes || '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetchingStats, setFetchingStats] = useState(false)

  useEffect(() => {
    const data = loadData()
    setCreators(data.creators.filter(c => c.status === 'Active'))
  }, [])

  const handleFetchInstagramStats = async () => {
    if (!formData.videoUrl.trim()) {
      setError('Please enter a video URL first')
      return
    }

    if (!isValidInstagramVideoUrl(formData.videoUrl)) {
      setError('Please enter a valid Instagram URL (reel or post)')
      return
    }

    setFetchingStats(true)
    setError('')

    try {
      const stats = await fetchInstagramVideoStats(formData.videoUrl)
      if (stats) {
        setFormData(prev => ({
          ...prev,
          views: stats.views.toString(),
          likes: stats.likes.toString(),
          comments: stats.comments.toString(),
        }))
      } else {
        setError('Could not fetch Instagram stats. Please enter manually.')
      }
    } catch (err) {
      setError('Failed to fetch Instagram stats')
    } finally {
      setFetchingStats(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!formData.creatorId || !formData.date || !formData.slot || !formData.videoUrl) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    if (!formData.views) {
      setError('Please enter views or fetch from Instagram')
      setLoading(false)
      return
    }

    try {
      updateVideo(video.id, {
        creatorId: formData.creatorId,
        date: formData.date,
        slot: parseInt(formData.slot),
        videoUrl: formData.videoUrl.trim(),
        views: parseInt(formData.views),
        likes: formData.likes ? parseInt(formData.likes) : undefined,
        comments: formData.comments ? parseInt(formData.comments) : undefined,
        status: formData.status,
        notes: formData.notes.trim() || undefined,
      })

      addActivityLog('edit_video', `Video ${video.id}`, `Updated video details`)
      window.location.reload()
    } catch (err) {
      setError('Failed to update video')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-sm w-full mx-4 p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Edit Video</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Creator
            </label>
            <select
              value={formData.creatorId}
              onChange={(e) => setFormData({ ...formData, creatorId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={fetchingStats || loading}
            >
              <option value="">Select a creator</option>
              {creators.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={fetchingStats || loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Slot
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.slot}
                onChange={(e) => setFormData({ ...formData, slot: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={fetchingStats || loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Video URL (Instagram)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://instagram.com/reel/..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={fetchingStats || loading}
              />
              <button
                type="button"
                onClick={handleFetchInstagramStats}
                disabled={fetchingStats || loading || !formData.videoUrl.trim()}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2"
              >
                {fetchingStats ? <Loader size={16} className="animate-spin" /> : 'Fetch'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-2">
                Views
              </label>
              <input
                type="number"
                value={formData.views}
                onChange={(e) => setFormData({ ...formData, views: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={fetchingStats || loading}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-2">
                Likes
              </label>
              <input
                type="number"
                value={formData.likes}
                onChange={(e) => setFormData({ ...formData, likes: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={fetchingStats || loading}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-slate-300 mb-2">
                Comments
              </label>
              <input
                type="number"
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                disabled={fetchingStats || loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={fetchingStats || loading}
            >
              <option value="Added">Added</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Missed">Missed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add notes..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={fetchingStats || loading}
            />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={fetchingStats || loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-2.5 rounded-lg transition-colors mt-6"
          >
            {loading ? 'Updating...' : 'Update Video'}
          </button>
        </form>
      </div>
    </div>
  )
}
