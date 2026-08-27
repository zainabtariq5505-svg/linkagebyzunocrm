'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { addCreator } from '@/lib/db'

interface Props {
  onClose: () => void
}

export default function AddCreatorModal({ onClose }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    instagramUsername: '',
    accountSize: '',
  })
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim() || !formData.instagramUsername.trim() || !formData.accountSize) {
      setError('Please fill in all fields')
      return
    }

    try {
      addCreator({
        name: formData.name.trim(),
        instagramUsername: formData.instagramUsername.trim(),
        accountSize: parseInt(formData.accountSize),
        status: 'Active',
      })
      
      // Reload page to show new creator
      window.location.reload()
    } catch (err) {
      setError('Failed to add creator')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-sm w-full mx-4 p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add Creator</h2>
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
              Creator Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Instagram Username
            </label>
            <input
              type="text"
              value={formData.instagramUsername}
              onChange={(e) => setFormData({ ...formData, instagramUsername: e.target.value })}
              placeholder="@johndoe"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Account Size
            </label>
            <input
              type="number"
              value={formData.accountSize}
              onChange={(e) => setFormData({ ...formData, accountSize: e.target.value })}
              placeholder="150000"
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 rounded-lg transition-colors mt-6"
          >
            Add Creator
          </button>
        </form>
      </div>
    </div>
  )
}
