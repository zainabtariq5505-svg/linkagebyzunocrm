'use client'

interface StatCardProps {
  label: string
  value: number
  color: string
}

export default function StatCard({ label, value, color }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-sm font-medium text-gray-600 dark:text-slate-400 mb-2">{label}</p>
      <div className="flex items-end gap-3">
        <span className="text-4xl font-bold text-gray-900 dark:text-white">{value}</span>
        <div className={`w-12 h-12 rounded-lg ${color} opacity-10`}></div>
      </div>
    </div>
  )
}
