export interface ActivityLog {
  id: string
  timestamp: number
  action: 'add_creator' | 'edit_creator' | 'delete_creator' | 'add_video' | 'edit_video' | 'delete_video' | 'login' | 'logout' | 'backup' | 'restore' | 'batch_import'
  target: string // creator name, video ID, etc
  details?: string
  userId?: string
}

const ACTIVITY_LOG_KEY = 'linkage_activity_log'
const MAX_LOGS = 1000

export function loadActivityLog(): ActivityLog[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(ACTIVITY_LOG_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    console.error('Failed to load activity log')
  }

  return []
}

export function addActivityLog(
  action: ActivityLog['action'],
  target: string,
  details?: string
): void {
  if (typeof window === 'undefined') return

  try {
    const logs = loadActivityLog()
    const newLog: ActivityLog = {
      id: `log_${Date.now()}`,
      timestamp: Date.now(),
      action,
      target,
      details,
    }

    logs.unshift(newLog) // Add to beginning
    
    // Keep only last 1000 logs
    if (logs.length > MAX_LOGS) {
      logs.splice(MAX_LOGS)
    }

    localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(logs))
  } catch (error) {
    console.error('Failed to add activity log:', error)
  }
}

export function getActivityLogsByAction(action: ActivityLog['action']): ActivityLog[] {
  return loadActivityLog().filter(log => log.action === action)
}

export function getActivityLogsByDateRange(startDate: Date, endDate: Date): ActivityLog[] {
  const start = startDate.getTime()
  const end = endDate.getTime()
  return loadActivityLog().filter(log => log.timestamp >= start && log.timestamp <= end)
}

export function clearActivityLog(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ACTIVITY_LOG_KEY)
  }
}

export function getActivityStats() {
  const logs = loadActivityLog()
  const actions: Record<string, number> = {}

  logs.forEach(log => {
    actions[log.action] = (actions[log.action] || 0) + 1
  })

  return {
    totalLogs: logs.length,
    actionCounts: actions,
    lastActivity: logs[0]?.timestamp,
    oldestActivity: logs[logs.length - 1]?.timestamp,
  }
}
