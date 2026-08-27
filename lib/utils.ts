import { Video, Creator, DayStats, SlotStatus } from './types'

export function getCreatorStats(creator: Creator, videos: Video[]) {
  const creatorVideos = videos.filter(v => v.creatorId === creator.id)
  const totalVideos = creatorVideos.length
  const totalViews = creatorVideos.reduce((sum, v) => sum + v.views, 0)
  const averageViews = totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0
  const missedContent = creatorVideos.filter(v => v.status === 'Missed').length
  
  // Compliance: check recent 30 days
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
  const recentVideos = creatorVideos.filter(v => v.createdAt > thirtyDaysAgo)
  const compliance = recentVideos.length > 0 
    ? Math.round((recentVideos.filter(v => v.status === 'Approved').length / recentVideos.length) * 100)
    : 100

  return { totalVideos, totalViews, averageViews, missedContent, compliance }
}

export function getDayStats(date: string, videos: Video[], creators: Creator[], required: number): DayStats {
  const dayVideos = videos.filter(v => v.date === date)
  const added = dayVideos.filter(v => v.status !== 'Missed').length
  const approved = dayVideos.filter(v => v.status === 'Approved').length
  const rejected = dayVideos.filter(v => v.status === 'Rejected').length
  const missed = dayVideos.filter(v => v.status === 'Missed').length
  const totalViews = dayVideos.reduce((sum, v) => sum + v.views, 0)
  const averageViews = dayVideos.length > 0 ? Math.round(totalViews / dayVideos.length) : 0

  // Group videos by slot and creator
  const slots: SlotStatus[] = []
  const maxSlots = Math.max(required, dayVideos.length || 0)
  
  for (let i = 1; i <= maxSlots; i++) {
    const slotVideos = dayVideos.filter(v => v.slot === i)
    
    if (slotVideos.length === 0) {
      slots.push({
        slot: i,
        status: i <= required ? 'behind' : 'neutral',
      })
    } else {
      const video = slotVideos[0]
      const creator = creators.find(c => c.id === video.creatorId)
      
      let status: SlotStatus['status'] = 'neutral'
      if (video.status === 'Approved') status = 'complete'
      else if (video.status === 'Rejected') status = 'behind'
      else if (video.status === 'Added') status = 'partial'
      
      slots.push({
        slot: i,
        creatorId: video.creatorId,
        creatorName: creator?.name,
        status,
        views: video.views,
      })
    }
  }

  return {
    date,
    required,
    added,
    approved,
    rejected,
    missed,
    totalViews,
    averageViews,
    slots,
  }
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatNumber(num: number): string {
  return num.toLocaleString()
}

export function getDateString(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function getStartOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  return new Date(d.setDate(diff))
}

export function getDayName(dayOfWeek: number): string {
  const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return names[dayOfWeek]
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'complete':
    case 'Active':
    case 'Approved':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'partial':
    case 'Added':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case 'behind':
    case 'Rejected':
    case 'Missed':
    case 'Paused':
    case 'Inactive':
    case 'Breached':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case 'neutral':
      return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

export function getStatusBgColor(status: string): string {
  switch (status) {
    case 'complete':
      return '#10b981'
    case 'partial':
      return '#f59e0b'
    case 'behind':
      return '#ef4444'
    case 'neutral':
      return '#d1d5db'
    default:
      return '#d1d5db'
  }
}
