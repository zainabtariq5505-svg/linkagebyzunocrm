import { Video } from './types'

export interface PeriodStats {
  totalViews: number
  totalLikes: number
  totalComments: number
  averageViews: number
  videoCount: number
  avgEngagement: number
}

/**
 * Get date range (e.g., last 7 days)
 */
function getDateRange(days: number): string[] {
  const dates: string[] = []
  const today = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(date.toISOString().split('T')[0])
  }

  return dates
}

/**
 * Calculate stats for a period
 */
export function calculatePeriodStats(videos: Video[], days: number): PeriodStats {
  const dateRange = getDateRange(days)
  const periodVideos = videos.filter(v => dateRange.includes(v.date))

  if (periodVideos.length === 0) {
    return {
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      averageViews: 0,
      videoCount: 0,
      avgEngagement: 0,
    }
  }

  const totalViews = periodVideos.reduce((sum, v) => sum + (v.views || 0), 0)
  const totalLikes = periodVideos.reduce((sum, v) => sum + (v.likes || 0), 0)
  const totalComments = periodVideos.reduce((sum, v) => sum + (v.comments || 0), 0)
  const videoCount = periodVideos.length
  const averageViews = Math.floor(totalViews / videoCount)

  // Calculate average engagement rate
  const engagementRates = periodVideos.map(v => {
    const views = v.views || 1
    const engagement = ((v.likes || 0) + (v.comments || 0)) / views
    return engagement * 100
  })
  const avgEngagement = engagementRates.reduce((a, b) => a + b, 0) / engagementRates.length

  return {
    totalViews,
    totalLikes,
    totalComments,
    averageViews,
    videoCount,
    avgEngagement: Math.round(avgEngagement * 100) / 100,
  }
}

/**
 * Get last 7 days stats
 */
export function getLast7DaysStats(videos: Video[]): PeriodStats {
  return calculatePeriodStats(videos, 7)
}

/**
 * Get last 30 days stats
 */
export function getLast30DaysStats(videos: Video[]): PeriodStats {
  return calculatePeriodStats(videos, 30)
}

/**
 * Get today's stats
 */
export function getTodayStats(videos: Video[]): PeriodStats {
  const today = new Date().toISOString().split('T')[0]
  const todayVideos = videos.filter(v => v.date === today)

  if (todayVideos.length === 0) {
    return {
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      averageViews: 0,
      videoCount: 0,
      avgEngagement: 0,
    }
  }

  const totalViews = todayVideos.reduce((sum, v) => sum + (v.views || 0), 0)
  const totalLikes = todayVideos.reduce((sum, v) => sum + (v.likes || 0), 0)
  const totalComments = todayVideos.reduce((sum, v) => sum + (v.comments || 0), 0)
  const videoCount = todayVideos.length
  const averageViews = Math.floor(totalViews / videoCount)

  const engagementRates = todayVideos.map(v => {
    const views = v.views || 1
    return (((v.likes || 0) + (v.comments || 0)) / views) * 100
  })
  const avgEngagement = engagementRates.reduce((a, b) => a + b, 0) / engagementRates.length

  return {
    totalViews,
    totalLikes,
    totalComments,
    averageViews,
    videoCount,
    avgEngagement: Math.round(avgEngagement * 100) / 100,
  }
}
