'use client'

import { useEffect, useState } from 'react'
import { Clock, Trash2 } from 'lucide-react'
import { loadActivityLog, clearActivityLog, getActivityStats } from '@/lib/activityLog'

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const activityLogs = loadActivityLog()
    setLogs(activityLogs)
    const stats = getActivityStats()
    setStats(stats)
  }, [])

  const handleClearLogs = () => {
    if (confirm('Clear all activity logs? This cannot be undone.')) {
      clearActivityLog()
      setLogs([])
      setStats({ totalLogs: 0, actionCounts: {}, lastActivity: null })
    }
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'add_creator': 'Added Creator',
      'edit_creator': 'Edited Creator',
      'delete_creator': 'Deleted Creator',
      'add_video': 'Added Video',
      'edit_video': 'Edited Video',
      'delete_video': 'Deleted Video',
      'login': 'User Login',
      'logout': 'User Logout',
      'backup': 'Created Backup',
      'restore': 'Restored Backup',
      'batch_import': 'Batch Import',
    }
    return labels[action] || action
  }

  const getActionColor = (action: string) => {
    if (action.includes('add') || action === 'backup') return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
    if (action.includes('edit')) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
    if (action.includes('delete')) return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
    if (action.includes('restore')) return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
    return 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300'
  }

  if (!stats) return <div className="animate-pulse">Loading...</div>

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Activity Logs</h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">Track all changes in your CRM</p>
        </div>
        <button
          onClick={handleClearLogs}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          <Trash2 size={18} />
          Clear Logs
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">Total Activities</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalLogs}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">Last Activity</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {stats.lastActivity ? new Date(stats.lastActivity).toLocaleTimeString() : 'None'}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">Action Types</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {Object.keys(stats.actionCounts).length}
          </p>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activities</h2>
        </div>

        {logs.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Clock size={32} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-slate-400">No activities recorded yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {logs.map((log) => (
              <div key={log.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getActionColor(log.action)}`}>
                        {getActionLabel(log.action)}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {log.target}
                      </span>
                    </div>
                    {log.details && (
                      <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">{log.details}</p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Breakdown */}
      {Object.keys(stats.actionCounts).length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Activity Breakdown</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {Object.entries(stats.actionCounts).map(([action, count]) => (
                <div key={action} className="flex justify-between items-center">
                  <span className="text-sm text-gray-700 dark:text-slate-300">{getActionLabel(action)}</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{count as number}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
