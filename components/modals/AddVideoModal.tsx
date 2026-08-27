'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { addVideo, loadData } from '@/lib/db'
import { Creator } from '@/lib/types'
import { getDateString } from '@/lib/utils'

interface Props {
  onClose: () => void
}

export default function AddVideoModal({ onClose }: Props) {
  const [creators, setCreators] = useState<Creator[]>([])
  const [formData, setFormData] = useState({
    creatorId: '',
    date: getDateString(new Date()),
    slot: '1',
    videoUrl: '',
    views: '',
    status: 'Added' as const,
    notes: '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    const data = loadData()
    setCreators(data.creators.filter(c => c.status === 'Active'))
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.creatorId || !formData.date || !formData.slot || !formData.videoUrl || !formData.views) {
      setError('Please fill in all required fields')
      return
    }

    try {
      addVideo({
        creatorId: formData.creatorId,
        date: formData.date,
        slot: parseInt(formData.slot),
        videoUrl: formData.videoUrl.trim(),
        views: parseInt(formData.views),
        status: formData.status,
        notes: formData.notes.trim() || undefined,
      })

      window.location.reload()
    } catch (err) {
      setError('Failed to add video')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-sm w-full mx-4 p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add Video</h2>
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
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Views
              </label>
              <input
                type="number"
                value={formData.views}
                onChange={(e) => setFormData({ ...formData, views: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Video URL
            </label>
            <input
              type="url"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              placeholder="https://instagram.com/p/..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
            />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 rounded-lg transition-colors mt-6"
          >
            Add Video
          </button>
        </form>
      </div>
    </div>
  )
}
