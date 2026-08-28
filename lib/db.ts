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
import { supabase } from './supabase'

/**
 * Load CRM data - tries Supabase first, falls back to localStorage
 */
export async function loadDataFromSupabase(): Promise<CRMData> {
  try {
    if (!supabase) {
      console.warn('Supabase not configured, using localStorage only')
      return loadFromLocal()
    }

    // Fetch from Supabase
    const [creatorsRes, videosRes, reqRes] = await Promise.all([
      supabase.from('creators').select('*'),
      supabase.from('videos').select('*'),
      supabase.from('dailyRequirements').select('*'),
    ])

    if (creatorsRes.data && videosRes.data && reqRes.data) {
      const data: CRMData = {
        creators: creatorsRes.data.map((c: any) => ({
          id: c.id,
          name: c.name,
          instagramUsername: c.instagramHandle || '',
          accountSize: 0,
          status: c.status,
          createdAt: c.createdAt,
        })),
        videos: videosRes.data.map((v: any) => ({
          id: v.id,
          creatorId: v.creatorId,
          date: v.date,
          slot: v.slot,
          videoUrl: v.videoUrl,
          views: v.views || 0,
          likes: v.likes,
          comments: v.comments,
          status: v.status,
          notes: v.notes,
          createdAt: v.createdAt,
        })),
        dailyRequirements: reqRes.data.map((r: any) => ({
          dayOfWeek: r.dayOfWeek,
          requiredVideos: r.requiredVideos,
        })),
        settings: {
          accentColor: '#8B5CF6',
          darkMode: false,
        },
      }
      
      // Save to localStorage as backup
      saveToLocal(data)
      console.log('✓ Data loaded from Supabase')
      return data
    }
  } catch (error) {
    console.warn('Supabase load failed, using localStorage:', error)
  }

  return loadFromLocal()
}

/**
 * Load CRM data - synchronous version for client components
 */
export function loadData(): CRMData {
  return loadFromLocal()
}

/**
 * Save CRM data to Supabase
 */
export async function saveDataToSupabase(data: CRMData): Promise<void> {
  try {
    // Save creators
    if (data.creators.length > 0) {
      for (const creator of data.creators) {
        const { error } = await supabase
          .from('creators')
          .upsert(
            {
              id: creator.id,
              name: creator.name,
              status: creator.status,
              instagramHandle: creator.instagramUsername,
              createdAt: creator.createdAt,
              updatedAt: Date.now(),
            },
            { onConflict: 'id' }
          )
        if (error) console.error('Error saving creator:', error)
      }
    }

    // Save videos
    if (data.videos.length > 0) {
      for (const video of data.videos) {
        const { error } = await supabase
          .from('videos')
          .upsert(
            {
              id: video.id,
              creatorId: video.creatorId,
              date: video.date,
              slot: video.slot,
              videoUrl: video.videoUrl,
              views: video.views,
              likes: video.likes || 0,
              comments: video.comments || 0,
              status: video.status,
              notes: video.notes,
              createdAt: video.createdAt,
              updatedAt: Date.now(),
            },
            { onConflict: 'id' }
          )
        if (error) console.error('Error saving video:', error)
      }
    }

    // Save daily requirements
    for (const req of data.dailyRequirements) {
      const { error } = await supabase
        .from('dailyRequirements')
        .upsert(
          {
            id: `req_${req.dayOfWeek}`,
            dayOfWeek: req.dayOfWeek,
            requiredVideos: req.requiredVideos,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          { onConflict: 'id' }
        )
      if (error) console.error('Error saving daily requirement:', error)
    }

    console.log('✓ Data saved to Supabase')
  } catch (error) {
    console.error('Error syncing to Supabase:', error)
  }
}

/**
 * Creator operations
 */
export function addCreator(creator: Omit<Creator, 'id' | 'createdAt'>): Creator {
  const newCreator = addCreatorLocal(creator)
  const data = loadFromLocal()
  saveToLocal(data)
  // Also save to Supabase in background
  saveDataToSupabase(data)
  return newCreator
}

export function updateCreator(id: string, updates: Partial<Creator>): Creator | null {
  const result = updateCreatorLocal(id, updates)
  if (result) {
    const data = loadFromLocal()
    saveToLocal(data)
    // Also save to Supabase in background
    saveDataToSupabase(data)
  }
  return result
}

export function deleteCreator(id: string): boolean {
  const result = deleteCreatorLocal(id)
  if (result) {
    const data = loadFromLocal()
    saveToLocal(data)
    // Also save to Supabase in background
    saveDataToSupabase(data)
  }
  return result
}

/**
 * Video operations
 */
export function addVideo(video: Omit<Video, 'id' | 'createdAt'>): Video {
  const newVideo = addVideoLocal(video)
  const data = loadFromLocal()
  saveToLocal(data)
  // Also save to Supabase in background
  saveDataToSupabase(data)
  return newVideo
}

export function updateVideo(id: string, updates: Partial<Video>): Video | null {
  const result = updateVideoLocal(id, updates)
  if (result) {
    const data = loadFromLocal()
    saveToLocal(data)
    // Also save to Supabase in background
    saveDataToSupabase(data)
  }
  return result
}

export function deleteVideo(id: string): boolean {
  const result = deleteVideoLocal(id)
  if (result) {
    const data = loadFromLocal()
    saveToLocal(data)
    // Also save to Supabase in background
    saveDataToSupabase(data)
  }
  return result
}

/**
 * Settings operations
 */
export function updateDailyRequirement(dayOfWeek: number, requiredVideos: number): void {
  updateDailyRequirementLocal(dayOfWeek, requiredVideos)
  const data = loadFromLocal()
  saveToLocal(data)
  // Also save to Supabase in background
  saveDataToSupabase(data)
}

export function updateSettings(settings: Partial<CRMData['settings']>): void {
  updateSettingsLocal(settings)
  const data = loadFromLocal()
  saveToLocal(data)
  // Also save to Supabase in background
  saveDataToSupabase(data)
}
