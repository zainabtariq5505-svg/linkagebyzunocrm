import { CRMData, Creator, Video } from './types'

/**
 * Convert data to CSV string
 */
function toCSV(headers: string[], data: any[][]): string {
  const csvHeaders = headers.map(h => `"${h}"`).join(',')
  const csvRows = data.map(row =>
    row.map(cell => {
      if (cell === null || cell === undefined) return '""'
      const str = String(cell).replace(/"/g, '""')
      return `"${str}"`
    }).join(',')
  )
  return [csvHeaders, ...csvRows].join('\n')
}

/**
 * Download CSV file
 */
function downloadCSV(filename: string, csv: string): void {
  if (typeof window === 'undefined') return

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export creators to CSV
 */
export function exportCreatorsToCSV(creators: Creator[]): void {
  const headers = ['ID', 'Name', 'Instagram Username', 'Account Size', 'Status', 'Created At']
  const data = creators.map(c => [
    c.id,
    c.name,
    c.instagramUsername,
    c.accountSize,
    c.status,
    new Date(c.createdAt).toLocaleString(),
  ])

  const csv = toCSV(headers, data)
  downloadCSV(`creators_${new Date().toISOString().split('T')[0]}.csv`, csv)
}

/**
 * Export videos to CSV
 */
export function exportVideosToCSV(videos: Video[], creators: Creator[]): void {
  const creatorMap = new Map(creators.map(c => [c.id, c.name]))

  const headers = ['ID', 'Creator', 'Date', 'Slot', 'URL', 'Views', 'Likes', 'Comments', 'Status', 'Notes', 'Created At']
  const data = videos.map(v => [
    v.id,
    creatorMap.get(v.creatorId) || 'Unknown',
    v.date,
    v.slot,
    v.videoUrl,
    v.views,
    v.likes || '',
    v.comments || '',
    v.status,
    v.notes || '',
    new Date(v.createdAt).toLocaleString(),
  ])

  const csv = toCSV(headers, data)
  downloadCSV(`videos_${new Date().toISOString().split('T')[0]}.csv`, csv)
}

/**
 * Export analytics summary
 */
export function exportAnalyticsToCSV(data: CRMData): void {
  const totalCreators = data.creators.length
  const totalVideos = data.videos.length
  const totalViews = data.videos.reduce((sum, v) => sum + v.views, 0)
  const totalLikes = data.videos.reduce((sum, v) => sum + (v.likes || 0), 0)
  const totalComments = data.videos.reduce((sum, v) => sum + (v.comments || 0), 0)

  const videosByStatus: Record<string, number> = {}
  data.videos.forEach(v => {
    videosByStatus[v.status] = (videosByStatus[v.status] || 0) + 1
  })

  const creatorsByStatus: Record<string, number> = {}
  data.creators.forEach(c => {
    creatorsByStatus[c.status] = (creatorsByStatus[c.status] || 0) + 1
  })

  const headers = ['Metric', 'Value']
  const rows: any[][] = [
    ['Total Creators', totalCreators],
    ['Active Creators', creatorsByStatus['Active'] || 0],
    ['Paused Creators', creatorsByStatus['Paused'] || 0],
    ['Inactive Creators', creatorsByStatus['Inactive'] || 0],
    ['Breached Creators', creatorsByStatus['Breached'] || 0],
    ['', ''],
    ['Total Videos', totalVideos],
    ['Added Videos', videosByStatus['Added'] || 0],
    ['Approved Videos', videosByStatus['Approved'] || 0],
    ['Rejected Videos', videosByStatus['Rejected'] || 0],
    ['Missed Videos', videosByStatus['Missed'] || 0],
    ['', ''],
    ['Total Views', totalViews],
    ['Total Likes', totalLikes],
    ['Total Comments', totalComments],
    ['Average Views per Video', Math.round(totalViews / totalVideos) || 0],
    ['Engagement Rate', `${((totalLikes + totalComments) / totalViews * 100).toFixed(2)}%`],
  ]

  const csv = toCSV(headers, rows)
  downloadCSV(`analytics_${new Date().toISOString().split('T')[0]}.csv`, csv)
}

/**
 * Parse CSV file into creators
 */
export function parseCreatorsCSV(csv: string): Omit<Creator, 'id' | 'createdAt'>[] {
  const lines = csv.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  const nameIdx = headers.findIndex(h => h.includes('name'))
  const instagramIdx = headers.findIndex(h => h.includes('instagram'))
  const sizeIdx = headers.findIndex(h => h.includes('size') || h.includes('account'))
  const statusIdx = headers.findIndex(h => h.includes('status'))

  const creators: Omit<Creator, 'id' | 'createdAt'>[] = []

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map(p => p.trim())
    if (parts.length < 2) continue

    creators.push({
      name: parts[nameIdx] || `Creator ${i}`,
      instagramUsername: parts[instagramIdx] || '',
      accountSize: parseInt(parts[sizeIdx]) || 0,
      status: (parts[statusIdx] || 'Active') as any,
    })
  }

  return creators
}

/**
 * Parse CSV file into videos
 */
export function parseVideosCSV(csv: string, creatorMap: Map<string, string>): Omit<Video, 'id' | 'createdAt'>[] {
  const lines = csv.trim().split('\n')
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
  const creatorIdx = headers.findIndex(h => h.includes('creator'))
  const dateIdx = headers.findIndex(h => h.includes('date'))
  const slotIdx = headers.findIndex(h => h.includes('slot'))
  const urlIdx = headers.findIndex(h => h.includes('url'))
  const viewsIdx = headers.findIndex(h => h.includes('views'))
  const likesIdx = headers.findIndex(h => h.includes('likes'))
  const commentsIdx = headers.findIndex(h => h.includes('comments'))
  const statusIdx = headers.findIndex(h => h.includes('status'))

  const videos: Omit<Video, 'id' | 'createdAt'>[] = []

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map(p => p.trim())
    if (parts.length < 4) continue

    const creatorName = parts[creatorIdx]
    let creatorId = ''
    
    // Find creator ID by name
    for (const [id, name] of creatorMap.entries()) {
      if (name === creatorName) {
        creatorId = id
        break
      }
    }

    if (!creatorId) continue

    videos.push({
      creatorId,
      date: parts[dateIdx] || new Date().toISOString().split('T')[0],
      slot: parseInt(parts[slotIdx]) || 1,
      videoUrl: parts[urlIdx] || '',
      views: parseInt(parts[viewsIdx]) || 0,
      likes: parts[likesIdx] ? parseInt(parts[likesIdx]) : undefined,
      comments: parts[commentsIdx] ? parseInt(parts[commentsIdx]) : undefined,
      status: (parts[statusIdx] || 'Added') as any,
      notes: parts[9] || undefined,
    })
  }

  return videos
}
