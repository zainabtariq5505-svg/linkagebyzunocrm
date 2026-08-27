import { CRMData, Creator, Video, DailyRequirement } from './types'

// Helper function to get daily requirement
export function getDailyRequirement(requirements: DailyRequirement[], dayOfWeek: number): number {
  return requirements.find(r => r.dayOfWeek === dayOfWeek)?.requiredVideos || 0
}

const STORAGE_KEY = 'linkage_crm_data'

const DEFAULT_DATA: CRMData = {
  creators: [],
  videos: [],
  dailyRequirements: [
    { dayOfWeek: 0, requiredVideos: 0 }, // Sunday
    { dayOfWeek: 1, requiredVideos: 10 }, // Monday
    { dayOfWeek: 2, requiredVideos: 10 }, // Tuesday
    { dayOfWeek: 3, requiredVideos: 10 }, // Wednesday
    { dayOfWeek: 4, requiredVideos: 10 }, // Thursday
    { dayOfWeek: 5, requiredVideos: 10 }, // Friday
    { dayOfWeek: 6, requiredVideos: 20 }, // Saturday
  ],
  settings: {
    accentColor: '#8B5CF6',
    darkMode: false,
  },
}

function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const test = '__test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

export function loadData(): CRMData {
  if (!isLocalStorageAvailable()) {
    return DEFAULT_DATA
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load data from storage:', error)
  }

  return DEFAULT_DATA
}

export function saveData(data: CRMData): void {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage not available')
    return
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save data to storage:', error)
  }
}

export function addCreator(creator: Omit<Creator, 'id' | 'createdAt'>): Creator {
  const data = loadData()
  const newCreator: Creator = {
    ...creator,
    id: `creator_${Date.now()}`,
    createdAt: Date.now(),
  }
  data.creators.push(newCreator)
  saveData(data)
  return newCreator
}

export function updateCreator(id: string, updates: Partial<Creator>): Creator | null {
  const data = loadData()
  const creator = data.creators.find(c => c.id === id)
  if (!creator) return null
  
  Object.assign(creator, updates)
  saveData(data)
  return creator
}

export function deleteCreator(id: string): boolean {
  const data = loadData()
  const index = data.creators.findIndex(c => c.id === id)
  if (index === -1) return false
  
  data.creators.splice(index, 1)
  // Also delete all videos for this creator
  data.videos = data.videos.filter(v => v.creatorId !== id)
  saveData(data)
  return true
}

export function addVideo(video: Omit<Video, 'id' | 'createdAt'>): Video {
  const data = loadData()
  const newVideo: Video = {
    ...video,
    id: `video_${Date.now()}`,
    createdAt: Date.now(),
  }
  data.videos.push(newVideo)
  saveData(data)
  return newVideo
}

export function updateVideo(id: string, updates: Partial<Video>): Video | null {
  const data = loadData()
  const video = data.videos.find(v => v.id === id)
  if (!video) return null
  
  Object.assign(video, updates)
  saveData(data)
  return video
}

export function deleteVideo(id: string): boolean {
  const data = loadData()
  const index = data.videos.findIndex(v => v.id === id)
  if (index === -1) return false
  
  data.videos.splice(index, 1)
  saveData(data)
  return true
}

export function updateDailyRequirement(dayOfWeek: number, requiredVideos: number): void {
  const data = loadData()
  const requirement = data.dailyRequirements.find(r => r.dayOfWeek === dayOfWeek)
  if (requirement) {
    requirement.requiredVideos = requiredVideos
    saveData(data)
  }
}

export function updateSettings(settings: Partial<CRMData['settings']>): void {
  const data = loadData()
  Object.assign(data.settings, settings)
  saveData(data)
}
