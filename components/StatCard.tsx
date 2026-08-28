'use client'

import { Target, Video, CheckCircle, Clock } from 'lucide-react'

interface StatCardProps {
  label: string
  value: number
  color: string
}

const getIcon = (label: string) => {
  switch (label) {
    case "Today's Required":
      return <Target size={24} />
    case "Videos Added":
      return <Video size={24} />
    case "Videos Approved":
      return <CheckCircle size={24} />
    case "Remaining":
      return <Clock size={24} />
    default:
      return null
  }
}

const getColorClass = (color: string) => {
  const colorMap: Record<string, string> = {
    'bg-blue-500': 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
    'bg-purple-500': 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
    'bg-green-500': 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
    'bg-orange-500': 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
  }
  return colorMap[color] || 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20'
}

export default function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">{label}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${getColorClass(color)} group-hover:scale-110 transition-transform`}>
          {getIcon(label)}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold text-gray-900 dark:text-white">{value}</span>
        <span className="text-xs font-medium text-gray-400 dark:text-slate-500">items</span>
      </div>
      <div className="mt-4 h-1 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} opacity-70 rounded-full transition-all duration-500`}
          style={{ width: `${Math.min((value / 10) * 100, 100)}%` }}
        ></div>
      </div>
    </div>
  )
}
