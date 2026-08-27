'use client'

import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'
import { CRMData } from '@/lib/types'
import { loadData, updateDailyRequirement } from '@/lib/db'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function SettingsPage() {
  const [data, setData] = useState<CRMData | null>(null)
  const [requirements, setRequirements] = useState<Record<number, number>>({})
  const [saved, setSaved] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const crmData = loadData()
    setData(crmData)

    const reqs: Record<number, number> = {}
    crmData.dailyRequirements.forEach(r => {
      reqs[r.dayOfWeek] = r.requiredVideos
    })
    setRequirements(reqs)

    // Check dark mode preference
    const isDark = document.documentElement.classList.contains('dark')
    setDarkMode(isDark)
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
      setDarkMode(!darkMode)
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
    </div>
  )
}
