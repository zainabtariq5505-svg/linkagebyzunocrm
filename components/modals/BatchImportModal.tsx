'use client'

import { useState } from 'react'
import { X, Upload, AlertCircle, CheckCircle } from 'lucide-react'
import { addCreator, addVideo, loadData } from '@/lib/db'
import { parseCreatorsCSV, parseVideosCSV } from '@/lib/csvExport'
import { addActivityLog } from '@/lib/activityLog'

interface Props {
  onClose: () => void
}

export default function BatchImportModal({ onClose }: Props) {
  const [importType, setImportType] = useState<'creators' | 'videos'>('creators')
  const [csvContent, setCsvContent] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<any[]>([])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setCsvContent(content)
      setError('')
      setSuccess('')

      // Generate preview
      try {
        const lines = content.trim().split('\n')
        if (lines.length < 2) {
          setError('CSV must have headers and at least one row')
          return
        }

        if (importType === 'creators') {
          const parsed = parseCreatorsCSV(content)
          setPreview(parsed.slice(0, 3))
        } else {
          const data = loadData()
          const creatorMap = new Map(data.creators.map(c => [c.name, c.id]))
          const parsed = parseVideosCSV(content, creatorMap)
          setPreview(parsed.slice(0, 3))
        }
      } catch (err) {
        setError('Failed to parse CSV file')
      }
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    if (!csvContent) {
      setError('Please select a CSV file')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (importType === 'creators') {
        const creators = parseCreatorsCSV(csvContent)
        let imported = 0
        for (const creator of creators) {
          try {
            // AWAIT each save to Supabase!
            await addCreator(creator)
            imported++
          } catch (err) {
            console.error('Failed to add creator:', err)
          }
        }
        addActivityLog('batch_import', `Creators`, `Imported ${imported} creators`)
        setSuccess(`Successfully imported ${imported} creators!`)
      } else {
        const data = loadData()
        const creatorMap = new Map(data.creators.map(c => [c.name, c.id]))
        const videos = parseVideosCSV(csvContent, creatorMap)
        let imported = 0
        for (const video of videos) {
          try {
            // AWAIT each save to Supabase!
            await addVideo(video)
            imported++
          } catch (err) {
            console.error('Failed to add video:', err)
          }
        }
        addActivityLog('batch_import', `Videos`, `Imported ${imported} videos`)
        setSuccess(`Successfully imported ${imported} videos!`)
      }

      alert('✅ All data saved to cloud!')
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err) {
      setError('Import failed. Please check your CSV format.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Batch Import</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-slate-400" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Import Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
              What would you like to import?
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setImportType('creators')
                  setCsvContent('')
                  setPreview([])
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  importType === 'creators'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-300'
                }`}
              >
                Creators
              </button>
              <button
                onClick={() => {
                  setImportType('videos')
                  setCsvContent('')
                  setPreview([])
                }}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  importType === 'videos'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-300'
                }`}
              >
                Videos
              </button>
            </div>
          </div>

          {/* CSV Template Info */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Expected CSV Format</h3>
            {importType === 'creators' ? (
              <p className="text-sm text-blue-800 dark:text-blue-400 font-mono">
                Name, Instagram Username, Account Size, Status
              </p>
            ) : (
              <p className="text-sm text-blue-800 dark:text-blue-400 font-mono">
                Creator, Date, Slot, URL, Views, Likes, Comments, Status
              </p>
            )}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">
              Select CSV File
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-6 text-center">
              <Upload size={32} className="mx-auto mb-2 text-gray-400" />
              <label className="cursor-pointer">
                <span className="text-purple-600 hover:text-purple-700 font-medium">Click to upload</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={loading}
                />
              </label>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">or drag and drop</p>
            </div>
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">Preview</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-300 dark:border-slate-600">
                      {Object.keys(preview[0]).map((key) => (
                        <th key={key} className="px-3 py-2 text-left text-gray-700 dark:text-slate-300 font-medium">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, idx) => (
                      <tr key={idx} className="border-b border-gray-200 dark:border-slate-700">
                        {Object.values(row).map((value: any, col) => (
                          <td key={col} className="px-3 py-2 text-gray-600 dark:text-slate-400">
                            {String(value).substring(0, 30)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="flex gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle size={20} className="text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <CheckCircle size={20} className="text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!csvContent || loading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
            >
              {loading ? 'Importing...' : 'Import'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
