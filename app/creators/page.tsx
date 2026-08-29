'use client'

import { useEffect, useState } from 'react'
import { Trash2, Plus, Search } from 'lucide-react'
import { Creator, CRMData } from '@/lib/types'
import { loadData, deleteCreator } from '@/lib/db'
import { getCreatorStats, getStatusColor, formatNumber } from '@/lib/utils'
import EditCreatorModal from '@/components/modals/EditCreatorModal'
import AddCreatorModal from '@/components/modals/AddCreatorModal'

export default function CreatorsPage() {
  const [data, setData] = useState<CRMData | null>(null)
  const [search, setSearch] = useState('')
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  useEffect(() => {
    const crmData = loadData()
    setData(crmData)
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure? This will also delete all associated videos.')) {
      await deleteCreator(id)
      alert('✅ Creator deleted from cloud!')
      window.location.reload()
    }
  }

  if (!data) return <div className="animate-pulse">Loading...</div>

  const filteredCreators = data.creators.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.instagramUsername.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Creators</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">{filteredCreators.length} creators</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          <Plus size={18} />
          Add Creator
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or Instagram..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Creators Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">Instagram</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">Account Size</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 dark:text-white">Stats</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {filteredCreators.map((creator) => {
                const stats = getCreatorStats(creator, data.videos)
                return (
                  <tr key={creator.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 dark:text-white">{creator.name}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                      @{creator.instagramUsername}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                      {formatNumber(creator.accountSize)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded ${getStatusColor(creator.status)}`}>
                        {creator.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="text-sm space-y-1">
                        <p className="text-gray-900 dark:text-white">{stats.totalVideos} videos</p>
                        <p className="text-gray-600 dark:text-slate-400">{formatNumber(stats.totalViews)} views</p>
                        <p className="text-gray-600 dark:text-slate-400">{stats.compliance}% compliance</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedCreator(creator)
                            setShowEdit(true)
                          }}
                          className="p-2 hover:bg-gray-200 dark:hover:bg-slate-600 rounded transition-colors"
                          title="Edit"
                        >
                          <span className="text-gray-600 dark:text-slate-400">✎</span>
                        </button>
                        <button
                          onClick={() => handleDelete(creator.id)}
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

        {filteredCreators.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-600 dark:text-slate-400">No creators found</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAdd && <AddCreatorModal onClose={() => setShowAdd(false)} />}
      {showEdit && selectedCreator && (
        <EditCreatorModal creator={selectedCreator} onClose={() => setShowEdit(false)} />
      )}
    </div>
  )
}
