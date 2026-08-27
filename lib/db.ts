import { getSupabaseClient, isSupabaseConfigured } from './supabase'
import { CRMData, Creator, Video } from './types'
import {
  loadData as loadFromLocal,
  saveData as saveToLocal,
  addCreator as addCreatorLocal,
  updateCreator as updateCreatorLocal,
  deleteCreator as deleteCreatorLocal,
  addVideo as addVideoLocal,
  updateVideo as updateVideoLocal,
  deleteVideo as deleteVideoLocal,
  updateDailyRequirement as updateDailyRequirementLocal,
  updateSettings as updateSettingsLocal,
} from './storage'

// Check if we should use Supabase (only on client side)
const USE_SUPABASE = typeof window !== 'undefined' && isSupabaseConfigured()

/**
 * Sync data from Supabase to localStorage on app load
 */
export async function initializeDB() {
  if (!USE_SUPABASE) return

  try {
    const client = getSupabaseClient()
    if (!client) return

    // Fetch all data from Supabase
    const [creatorsRes, videosRes, settingsRes] = await Promise.all([
      client.from('creators').select('*'),
      client.from('videos').select('*'),
      client.from('settings').select('*').single(),
    ])

    if (creatorsRes.data && videosRes.data && settingsRes.data) {
      // Convert Supabase data to local format and save
      const data: CRMData = {
        creators: creatorsRes.data,
        videos: videosRes.data,
        dailyRequirements: settingsRes.data.dailyRequirements || [],
        settings: {
          accentColor: settingsRes.data.accentColor || '#8B5CF6',
          darkMode: settingsRes.data.darkMode || false,
        },
      }
      saveToLocal(data)
      console.log('✓ Data synced from Supabase')
    }
  } catch (error) {
    console.warn('Could not sync from Supabase, using local storage:', error)
  }
}

/**
 * Load CRM data
 */
export function loadData(): CRMData {
  return loadFromLocal()
}

/**
 * Save CRM data to both local and Supabase (if configured)
 */
export function saveData(data: CRMData): void {
  // Always save to local storage
  saveToLocal(data)

  // Also sync to Supabase if configured
  if (USE_SUPABASE) {
    syncToSupabase(data)
  }
}

/**
 * Sync data to Supabase
 */
async function syncToSupabase(data: CRMData) {
  try {
    const client = getSupabaseClient()
    if (!client) return

    // Upsert creators
    if (data.creators.length > 0) {
      await client.from('creators').upsert(data.creators, { onConflict: 'id' })
    }

    // Upsert videos
    if (data.videos.length > 0) {
      await client.from('videos').upsert(data.videos, { onConflict: 'id' })
    }

    // Update settings
    await client.from('settings').upsert(
      {
        id: 1,
        dailyRequirements: data.dailyRequirements,
        accentColor: data.settings.accentColor,
        darkMode: data.settings.darkMode,
        updatedAt: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )

    console.log('✓ Data synced to Supabase')
  } catch (error) {
    console.warn('Could not sync to Supabase:', error)
    // Silently fail - local storage is backup
  }
}

/**
 * Creator operations
 */
export function addCreator(creator: Omit<Creator, 'id' | 'createdAt'>): Creator {
  const newCreator = addCreatorLocal(creator)
  const data = loadFromLocal()
  saveData(data)
  return newCreator
}

export function updateCreator(id: string, updates: Partial<Creator>): Creator | null {
  const result = updateCreatorLocal(id, updates)
  if (result) {
    const data = loadFromLocal()
    saveData(data)
  }
  return result
}

export function deleteCreator(id: string): boolean {
  const result = deleteCreatorLocal(id)
  if (result) {
    const data = loadFromLocal()
    saveData(data)
  }
  return result
}

/**
 * Video operations
 */
export function addVideo(video: Omit<Video, 'id' | 'createdAt'>): Video {
  const newVideo = addVideoLocal(video)
  const data = loadFromLocal()
  saveData(data)
  return newVideo
}

export function updateVideo(id: string, updates: Partial<Video>): Video | null {
  const result = updateVideoLocal(id, updates)
  if (result) {
    const data = loadFromLocal()
    saveData(data)
  }
  return result
}

export function deleteVideo(id: string): boolean {
  const result = deleteVideoLocal(id)
  if (result) {
    const data = loadFromLocal()
    saveData(data)
  }
  return result
}

/**
 * Settings operations
 */
export function updateDailyRequirement(dayOfWeek: number, requiredVideos: number): void {
  updateDailyRequirementLocal(dayOfWeek, requiredVideos)
  const data = loadFromLocal()
  saveData(data)
}

export function updateSettings(settings: Partial<CRMData['settings']>): void {
  updateSettingsLocal(settings)
  const data = loadFromLocal()
  saveData(data)
}
