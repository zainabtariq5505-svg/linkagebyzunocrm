import { CRMData, Creator, Video } from './types'

export interface VideoMetrics {
  views: number
  likes: number
  comments: number
  engagementRate: number // (likes + comments) / views * 100
  totalEngagement: number // likes + comments
}

export interface CreatorMetrics {
  totalVideos: number
  totalViews: number
  totalLikes: number
  totalComments: number
  averageViews: number
  averageLikes: number
  averageComments: number
  engagementRate: number
  complianceRate: number // approved / total
  approvalRate: number // approved / total
}

/**
 * Calculate metrics for a video
 */
export function calculateVideoMetrics(video: Video): VideoMetrics {
  const likes = video.likes || 0
  const comments = video.comments || 0
  const views = video.views
  const totalEngagement = likes + comments
  const engagementRate = views > 0 ? (totalEngagement / views) * 100 : 0

  return {
    views,
    likes,
    comments,
    engagementRate,
    totalEngagement,
  }
}

/**
 * Calculate metrics for a creator
 */
export function calculateCreatorMetrics(creator: Creator, videos: Video[]): CreatorMetrics {
  const creatorVideos = videos.filter(v => v.creatorId === creator.id)
  const totalVideos = creatorVideos.length

  if (totalVideos === 0) {
    return {
      totalVideos: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      averageViews: 0,
      averageLikes: 0,
      averageComments: 0,
      engagementRate: 0,
      complianceRate: 0,
      approvalRate: 0,
    }
  }

  const totalViews = creatorVideos.reduce((sum, v) => sum + v.views, 0)
  const totalLikes = creatorVideos.reduce((sum, v) => sum + (v.likes || 0), 0)
  const totalComments = creatorVideos.reduce((sum, v) => sum + (v.comments || 0), 0)
  const approvedVideos = creatorVideos.filter(v => v.status === 'Approved').length

  return {
    totalVideos,
    totalViews,
    totalLikes,
    totalComments,
    averageViews: Math.round(totalViews / totalVideos),
    averageLikes: Math.round(totalLikes / totalVideos),
    averageComments: Math.round(totalComments / totalVideos),
    engagementRate: totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0,
    complianceRate: (approvedVideos / totalVideos) * 100,
    approvalRate: (approvedVideos / totalVideos) * 100,
  }
}

/**
 * Get top performing videos
 */
export function getTopVideos(videos: Video[], limit: number = 5): (Video & { metrics: VideoMetrics })[] {
  return videos
    .map(v => ({ ...v, metrics: calculateVideoMetrics(v) }))
    .sort((a, b) => b.metrics.engagementRate - a.metrics.engagementRate)
    .slice(0, limit)
}

/**
 * Get bottom performing videos
 */
export function getBottomVideos(videos: Video[], limit: number = 5): (Video & { metrics: VideoMetrics })[] {
  return videos
    .filter(v => v.views > 0) // Only videos with views
    .map(v => ({ ...v, metrics: calculateVideoMetrics(v) }))
    .sort((a, b) => a.metrics.engagementRate - b.metrics.engagementRate)
    .slice(0, limit)
}

/**
 * Get top performing creators
 */
export function getTopCreators(
  creators: Creator[],
  videos: Video[],
  limit: number = 5
): (Creator & { metrics: CreatorMetrics })[] {
  return creators
    .map(c => ({ ...c, metrics: calculateCreatorMetrics(c, videos) }))
    .filter(c => c.metrics.totalVideos > 0)
    .sort((a, b) => b.metrics.engagementRate - a.metrics.engagementRate)
    .slice(0, limit)
}

/**
 * Get bottom performing creators
 */
export function getBottomCreators(
  creators: Creator[],
  videos: Video[],
  limit: number = 5
): (Creator & { metrics: CreatorMetrics })[] {
  return creators
    .map(c => ({ ...c, metrics: calculateCreatorMetrics(c, videos) }))
    .filter(c => c.metrics.totalVideos > 0)
    .sort((a, b) => a.metrics.engagementRate - b.metrics.engagementRate)
    .slice(0, limit)
}

/**
 * Get trend data for a date range
 */
export function getVideoTrend(videos: Video[], days: number = 7) {
  const now = new Date()
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  const trendData: Record<string, { views: number; count: number; engagement: number }> = {}

  videos.forEach(v => {
    const videoDate = new Date(v.date)
    if (videoDate >= startDate && videoDate <= now) {
      const dateStr = v.date
      if (!trendData[dateStr]) {
        trendData[dateStr] = { views: 0, count: 0, engagement: 0 }
      }
      trendData[dateStr].views += v.views
      trendData[dateStr].count += 1
      trendData[dateStr].engagement += (v.likes || 0) + (v.comments || 0)
    }
  })

  return Object.entries(trendData).map(([date, data]) => ({
    date,
    averageViews: Math.round(data.views / data.count),
    totalViews: data.views,
    videoCount: data.count,
    engagement: data.engagement,
    engagementRate: (data.engagement / data.views * 100).toFixed(2),
  }))
}

/**
 * Get performance badge for video
 */
export function getPerformanceBadge(metrics: VideoMetrics): 'excellent' | 'good' | 'average' | 'poor' {
  const rate = metrics.engagementRate
  if (rate >= 5) return 'excellent'
  if (rate >= 3) return 'good'
  if (rate >= 1) return 'average'
  return 'poor'
}

/**
 * Get overall CRM metrics
 */
export function getOverallMetrics(data: CRMData) {
  const totalCreators = data.creators.length
  const activeCreators = data.creators.filter(c => c.status === 'Active').length
  const totalVideos = data.videos.length
  const approvedVideos = data.videos.filter(v => v.status === 'Approved').length
  const totalViews = data.videos.reduce((sum, v) => sum + v.views, 0)
  const totalLikes = data.videos.reduce((sum, v) => sum + (v.likes || 0), 0)
  const totalComments = data.videos.reduce((sum, v) => sum + (v.comments || 0), 0)

  return {
    totalCreators,
    activeCreators,
    totalVideos,
    approvedVideos,
    approvalRate: totalVideos > 0 ? (approvedVideos / totalVideos) * 100 : 0,
    totalViews,
    totalLikes,
    totalComments,
    averageViews: totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0,
    engagementRate: totalViews > 0 ? ((totalLikes + totalComments) / totalViews) * 100 : 0,
  }
}
