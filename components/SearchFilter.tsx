'use client'

import { useState } from 'react'
import { Search, X } from 'lucide-react'

interface SearchFilterProps {
  onSearchChange: (query: string) => void
  onFilterChange?: (filters: Record<string, any>) => void
  placeholder?: string
  filterOptions?: { label: string; value: string; options: { label: string; value: string }[] }[]
}

export default function SearchFilter({
  onSearchChange,
  onFilterChange,
  placeholder = 'Search...',
  filterOptions = [],
}: SearchFilterProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<Record<string, string>>({})

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onSearchChange(value)
  }

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  const handleReset = () => {
    setSearchQuery('')
    setFilters({})
    onSearchChange('')
    onFilterChange?.({})
  }

  const hasActiveFilters = searchQuery || Object.values(filters).some(v => v)

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Filters */}
      {filterOptions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <select
              key={option.value}
              value={filters[option.value] || ''}
              onChange={(e) => handleFilterChange(option.value, e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">{option.label}</option>
              {option.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}

          {hasActiveFilters && (
            <button
              onClick={handleReset}
              className="px-3 py-2 bg-gray-200 dark:bg-slate-600 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500 transition-colors flex items-center gap-1 text-sm font-medium"
            >
              <X size={16} />
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  )
}
