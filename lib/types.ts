export type CreatorStatus = 'Active' | 'Paused' | 'Inactive' | 'Breached'
export type VideoStatus = 'Added' | 'Approved' | 'Rejected' | 'Missed'

export interface Creator {
  id: string
  name: string
  instagramUsername: string
  accountSize: number
  status: CreatorStatus
  createdAt: number
}

export interface Video {
  id: string
  creatorId: string
  date: string
  slot: number
  videoUrl: string
  views: number
  status: VideoStatus
  notes?: string
  createdAt: number
}

export interface DailyRequirement {
  dayOfWeek: number // 0 = Sunday, 1 = Monday, etc.
  requiredVideos: number
}

export interface CRMData {
  creators: Creator[]
  videos: Video[]
  dailyRequirements: DailyRequirement[]
  settings: {
    accentColor: string
    darkMode: boolean
  }
}

export interface DayStats {
  date: string
  required: number
  added: number
  approved: number
  rejected: number
  missed: number
  totalViews: number
  averageViews: number
  slots: SlotStatus[]
}

export interface SlotStatus {
  slot: number
  creatorId?: string
  creatorName?: string
  status: 'complete' | 'partial' | 'behind' | 'neutral'
  views?: number
}
