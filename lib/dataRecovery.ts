import { CRMData } from './types'

const BACKUP_STORAGE_KEYS = [
  'linkage_crm_data',
  'crm_data',
  'linkage_data',
  'creators_data',
  'videos_data',
]

const BACKUP_KEYS_LEGACY = [
  'localStorage_backup',
  'app_data_backup',
  'crm_backup',
]

/**
 * Try to recover data from multiple possible storage locations
 */
export function recoverData(): CRMData | null {
  if (typeof window === 'undefined') return null

  try {
    // Try primary storage key first
    for (const key of BACKUP_STORAGE_KEYS) {
      const data = localStorage.getItem(key)
      if (data) {
        try {
          const parsed = JSON.parse(data)
          if (parsed && parsed.creators && parsed.videos) {
            console.log(`✓ Recovered data from storage key: ${key}`)
            return parsed
          }
        } catch {
          // Invalid JSON, continue
        }
      }
    }

    // Try legacy backup keys
    for (const key of BACKUP_KEYS_LEGACY) {
      const data = localStorage.getItem(key)
      if (data) {
        try {
          const parsed = JSON.parse(data)
          if (parsed && parsed.creators && parsed.videos) {
            console.log(`✓ Recovered data from legacy key: ${key}`)
            return parsed
          }
        } catch {
          // Invalid JSON, continue
        }
      }
    }

    // Try to recover individual creator and video data
    const recoveredData = recoverFromIndividualKeys()
    if (recoveredData) {
      console.log('✓ Recovered data from individual storage keys')
      return recoveredData
    }

    return null
  } catch (error) {
    console.error('Data recovery failed:', error)
    return null
  }
}

/**
 * Try to recover data from individual creator/video storage
 */
function recoverFromIndividualKeys(): CRMData | null {
  if (typeof window === 'undefined') return null

  try {
    const creators: any[] = []
    const videos: any[] = []

    // Look for any keys that might contain creator or video data
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key) continue

      const value = localStorage.getItem(key)
      if (!value) continue

      try {
        const parsed = JSON.parse(value)

        // Check if it looks like a creator
        if (
          typeof parsed === 'object' &&
          parsed.id &&
          parsed.name &&
          parsed.instagramUsername &&
          !creators.find(c => c.id === parsed.id)
        ) {
          creators.push(parsed)
        }

        // Check if it looks like a video
        if (
          typeof parsed === 'object' &&
          parsed.id &&
          parsed.creatorId &&
          parsed.videoUrl &&
          !videos.find(v => v.id === parsed.id)
        ) {
          videos.push(parsed)
        }
      } catch {
        // Not JSON, skip
      }
    }

    if (creators.length > 0 || videos.length > 0) {
      return {
        creators,
        videos,
        dailyRequirements: [
          { dayOfWeek: 0, requiredVideos: 0 },
          { dayOfWeek: 1, requiredVideos: 10 },
          { dayOfWeek: 2, requiredVideos: 10 },
          { dayOfWeek: 3, requiredVideos: 10 },
          { dayOfWeek: 4, requiredVideos: 10 },
          { dayOfWeek: 5, requiredVideos: 10 },
          { dayOfWeek: 6, requiredVideos: 20 },
        ],
        settings: {
          accentColor: '#8B5CF6',
          darkMode: false,
        },
      }
    }

    return null
  } catch (error) {
    console.error('Individual key recovery failed:', error)
    return null
  }
}

/**
 * Create a backup of current data to multiple locations
 */
export function backupData(data: CRMData): void {
  if (typeof window === 'undefined') return

  try {
    const dataString = JSON.stringify(data)
    
    // Save to primary location
    localStorage.setItem('linkage_crm_data', dataString)
    
    // Create timestamped backup
    const timestamp = new Date().toISOString()
    localStorage.setItem(`linkage_crm_backup_${timestamp}`, dataString)
    
    // Keep only the 3 most recent backups
    const backupKeys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('linkage_crm_backup_')) {
        backupKeys.push(key)
      }
    }
    
    if (backupKeys.length > 3) {
      backupKeys.sort().slice(0, -3).forEach(key => {
        localStorage.removeItem(key)
      })
    }

    console.log('✓ Data backed up successfully')
  } catch (error) {
    console.warn('Backup failed:', error)
  }
}

/**
 * Get list of available backups
 */
export function getAvailableBackups(): Array<{ key: string; timestamp: string }> {
  if (typeof window === 'undefined') return []

  const backups = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('linkage_crm_backup_')) {
      const timestamp = key.replace('linkage_crm_backup_', '')
      backups.push({ key, timestamp })
    }
  }
  
  return backups.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

/**
 * Restore from a specific backup
 */
export function restoreFromBackup(backupKey: string): CRMData | null {
  if (typeof window === 'undefined') return null

  try {
    const data = localStorage.getItem(backupKey)
    if (data) {
      const parsed = JSON.parse(data)
      localStorage.setItem('linkage_crm_data', data)
      console.log(`✓ Restored from backup: ${backupKey}`)
      return parsed
    }
    return null
  } catch (error) {
    console.error('Restore from backup failed:', error)
    return null
  }
}
