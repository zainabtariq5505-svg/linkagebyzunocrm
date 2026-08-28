'use client'

import { useEffect, useState } from 'react'
import { Save, RotateCcw, AlertCircle, Download, Upload } from 'lucide-react'
import { CRMData } from '@/lib/types'
import { loadData, updateDailyRequirement } from '@/lib/db'
import { getAvailableBackups, restoreFromBackup } from '@/lib/dataRecovery'
import { exportCreatorsToCSV, exportVideosToCSV, exportAnalyticsToCSV } from '@/lib/csvExport'
import BatchImportModal from '@/components/modals/BatchImportModal'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function SettingsPage() {
  const [data, setData] = useState<CRMData | null>(null)
  const [requirements, setRequirements] = useState<Record<number, number>>({})
  const [saved, setSaved] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [backups, setBackups] = useState<Array<{ key: string; timestamp: string }>>([])
  const [restoring, setRestoring] = useState(false)
  const [showBatchImport, setShowBatchImport] = useState(false)

  useEffect(() => {
    const crmData = loadData()
    setData(crmData)

    const reqs: Record<number, number> = {}
    crmData.dailyRequirements.forEach(r => {
      reqs[r.dayOfWeek] = r.requiredVideos
    })
    setRequirements(reqs)

    // Load theme preference
    const themePreference = localStorage.getItem('theme-preference') || 'light'
    const isDark = themePreference === 'dark'
    if (typeof document !== 'undefined') {
      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    setDarkMode(isDark)

    // Load available backups
    setBackups(getAvailableBackups())
  }, [])

  const handleRequirementChange = (dayOfWeek: number, value: number) => {
    setRequirements(prev => ({
      ...prev,
      [dayOfWeek]: value
    }))
  }

  const handleSave = () => {
    Object.entries(requirements).forEach(([day, count]) => {
      updateDailyRequirement(parseInt(day), count)
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggleDarkMode = () => {
    if (typeof document !== 'undefined') {
      const html = document.documentElement
      html.classList.toggle('dark')
      const newDarkMode = !darkMode
      setDarkMode(newDarkMode)
      // Persist preference
      localStorage.setItem('theme-preference', newDarkMode ? 'dark' : 'light')
    }
  }

  const handleRestoreBackup = (backupKey: string) => {
    if (confirm('Are you sure you want to restore this backup? Current data will be replaced.')) {
      setRestoring(true)
      const recovered = restoreFromBackup(backupKey)
      if (recovered) {
        window.location.reload()
      } else {
        alert('Failed to restore backup')
        setRestoring(false)
      }
    }
  }

  if (!data) return <div className="animate-pulse">Loading...</div>

  const totalRequired = Object.values(requirements).reduce((sum, val) => sum + val, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-slate-400 mt-1">Configure your CRM preferences</p>
      </div>

      {/* Daily Requirements */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Daily Video Requirements</h2>
        
        <div className="space-y-4 mb-6">
          {DAYS.map((day, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300">{day}</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={requirements[idx] || 0}
                  onChange={(e) => handleRequirementChange(idx, parseInt(e.target.value) || 0)}
                  className="w-16 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-center focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <span className="text-sm text-gray-600 dark:text-slate-400">videos/day</span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
            Total weekly requirement: <span className="font-semibold text-gray-900 dark:text-white">{totalRequired}</span> videos
          </p>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
          >
            <Save size={18} />
            Save Changes
          </button>
          {saved && (
            <p className="text-sm text-green-600 dark:text-green-400 mt-2">✓ Settings saved successfully</p>
          )}
        </div>
      </div>

      {/* Data Recovery & Backups */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Data & Backups</h2>
        
        <div className="mb-6">
          <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg mb-4">
            <AlertCircle size={20} className="text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-300">
              <p className="font-medium">Automatic Backups</p>
              <p className="mt-1">Your data is automatically backed up when you save. Click "Restore" to recover from a previous backup.</p>
            </div>
          </div>

          {backups.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
                Available Backups ({backups.length})
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {backups.map((backup) => (
                  <div key={backup.key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(backup.timestamp).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                        {backup.key}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRestoreBackup(backup.key)}
                      disabled={restoring}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm rounded-lg transition-colors font-medium flex items-center gap-1"
                    >
                      <RotateCcw size={14} />
                      Restore
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-slate-400">
              No backups available yet. They will be created automatically as you work.
            </p>
          )}
        </div>
      </div>

      {/* Export Data */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Export Data</h2>
        
        <div className="space-y-3">
          <button
            onClick={() => exportCreatorsToCSV(data.creators)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium text-left"
          >
            <Download size={18} />
            <span>Export Creators as CSV</span>
          </button>
          <button
            onClick={() => exportVideosToCSV(data.videos, data.creators)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium text-left"
          >
            <Download size={18} />
            <span>Export Videos as CSV</span>
          </button>
          <button
            onClick={() => exportAnalyticsToCSV(data)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium text-left"
          >
            <Download size={18} />
            <span>Export Analytics Report</span>
          </button>
        </div>
      </div>

      {/* Import Data */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Import Data</h2>
        
        <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
          Import creators or videos from a CSV file for bulk operations.
        </p>

        <button
          onClick={() => setShowBatchImport(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
        >
          <Upload size={18} />
          Batch Import
        </button>
      </div>

      {/* Appearance */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Appearance</h2>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-slate-300">Dark Mode</p>
            <p className="text-sm text-gray-600 dark:text-slate-400 mt-1">Toggle dark theme</p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              darkMode ? 'bg-purple-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                darkMode ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">About this CRM</h3>
        <p className="text-sm text-blue-800 dark:text-blue-400">
          Linkage Creator CRM v1.0.0 — A lightweight admin tool for managing creator content and scheduling.
        </p>
        <p className="text-xs text-blue-700 dark:text-blue-500 mt-2">
          All data is stored locally in your browser and never leaves your device.
        </p>
      </div>

      {/* Modal */}
      {showBatchImport && <BatchImportModal onClose={() => setShowBatchImport(false)} />}
    </div>
  )
}
