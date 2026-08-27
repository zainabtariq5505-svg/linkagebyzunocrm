'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CRMData } from '@/lib/types'
import { loadData } from '@/lib/db'
import { getDayStats, getDateString } from '@/lib/utils'
import CalendarDayModal from '@/components/modals/CalendarDayModal'

export default function CalendarPage() {
  const [data, setData] = useState<CRMData | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    const crmData = loadData()
    setData(crmData)
  }, [])

  if (!data) return <div className="animate-pulse">Loading...</div>

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay()

  const days = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i))
  }

  const getDateStatus = (date: Date | null) => {
    if (!date) return null
    const dateStr = getDateString(date)
    const dayOfWeek = date.getDay()
    const required = data.dailyRequirements.find(r => r.dayOfWeek === dayOfWeek)?.requiredVideos || 0
    return getDayStats(dateStr, data.videos, data.creators, required)
  }

  const getStatusColor = (status: any) => {
    if (!status || status.required === 0) return 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300'
    if (status.approved === status.required) return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
    if (status.approved > 0) return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
    return 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Calendar</h1>
        <p className="text-gray-600 dark:text-slate-400 mt-1">Schedule and manage video slots</p>
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600 dark:text-slate-400" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
          >
            <ChevronRight size={20} className="text-gray-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-semibold text-gray-600 dark:text-slate-400 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, idx) => {
            const status = getDateStatus(date)
            const isToday = date && getDateString(date) === getDateString(new Date())
            const dateStr = date ? getDateString(date) : ''

            return (
              <button
                key={idx}
                onClick={() => date && setSelectedDate(dateStr)}
                disabled={!date}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all ${
                  !date
                    ? 'bg-transparent'
                    : `${getStatusColor(status)} hover:shadow-md ${isToday ? 'ring-2 ring-purple-500' : ''}`
                }`}
              >
                {date && (
                  <>
                    <span className="text-lg">{date.getDate()}</span>
                    {status && status.required > 0 && (
                      <span className="text-xs mt-1 opacity-75">
                        {status.approved}/{status.required}
                      </span>
                    )}
                  </>
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500"></div>
            <span className="text-gray-600 dark:text-slate-400">Complete</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500"></div>
            <span className="text-gray-600 dark:text-slate-400">Partial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500"></div>
            <span className="text-gray-600 dark:text-slate-400">Behind</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-gray-300 dark:bg-slate-600"></div>
            <span className="text-gray-600 dark:text-slate-400">Neutral</span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedDate && (
        <CalendarDayModal
          date={selectedDate}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  )
}
