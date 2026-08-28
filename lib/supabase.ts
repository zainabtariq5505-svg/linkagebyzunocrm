import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or API key')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Type definitions for database tables
 */
export interface Creator {
  id: string
  name: string
  email?: string
  status: 'Active' | 'Inactive'
  joinDate: string
  instagramHandle?: string
  notes?: string
  createdAt: number
  updatedAt: number
}

export interface Video {
  id: string
  creatorId: string
  date: string
  slot: number
  videoUrl: string
  views: number
  likes?: number
  comments?: number
  status: 'Added' | 'Approved' | 'Rejected' | 'Missed'
  notes?: string
  createdAt: number
  updatedAt: number
}

export interface DailyRequirement {
  id: string
  dayOfWeek: number
  requiredVideos: number
  createdAt: number
  updatedAt: number
}

export interface ActivityLog {
  id: string
  action: string
  targetType: string
  targetId: string
  targetName?: string
  details?: string
  timestamp: number
}

export interface AutomationRule {
  id: string
  name: string
  type: string
  enabled: boolean
  threshold?: number
  action: string
  createdAt: number
  updatedAt: number
}

export interface AutomationAlert {
  id: string
  ruleId: string
  type: string
  targetId: string
  targetName?: string
  message: string
  severity: 'info' | 'warning' | 'critical'
  timestamp: number
  read: boolean
}

/**
 * Helper functions for database operations
 */

export async function getCreators(): Promise<Creator[]> {
  const { data, error } = await supabase
    .from('creators')
    .select('*')
    .order('createdAt', { ascending: false })

  if (error) {
    console.error('Error fetching creators:', error)
    return []
  }
  return data || []
}

export async function getVideos(): Promise<Video[]> {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .order('createdAt', { ascending: false })

  if (error) {
    console.error('Error fetching videos:', error)
    return []
  }
  return data || []
}

export async function getDailyRequirements(): Promise<DailyRequirement[]> {
  const { data, error } = await supabase
    .from('dailyRequirements')
    .select('*')
    .order('dayOfWeek', { ascending: true })

  if (error) {
    console.error('Error fetching daily requirements:', error)
    return []
  }
  return data || []
}

export async function getActivityLogs(): Promise<ActivityLog[]> {
  const { data, error } = await supabase
    .from('activityLogs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(1000)

  if (error) {
    console.error('Error fetching activity logs:', error)
    return []
  }
  return data || []
}

export async function getAutomationRules(): Promise<AutomationRule[]> {
  const { data, error } = await supabase
    .from('automationRules')
    .select('*')
    .order('createdAt', { ascending: false })

  if (error) {
    console.error('Error fetching automation rules:', error)
    return []
  }
  return data || []
}

export async function getAutomationAlerts(): Promise<AutomationAlert[]> {
  const { data, error } = await supabase
    .from('automationAlerts')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(100)

  if (error) {
    console.error('Error fetching alerts:', error)
    return []
  }
  return data || []
}

export async function insertActivityLog(log: Omit<ActivityLog, 'id'>): Promise<ActivityLog | null> {
  const { data, error } = await supabase
    .from('activityLogs')
    .insert([{ id: `log_${Date.now()}`, ...log }])
    .select()
    .single()

  if (error) {
    console.error('Error inserting activity log:', error)
    return null
  }
  return data
}

export async function insertAutomationAlert(alert: Omit<AutomationAlert, 'id'>): Promise<AutomationAlert | null> {
  const { data, error } = await supabase
    .from('automationAlerts')
    .insert([{ id: `alert_${Date.now()}`, ...alert }])
    .select()
    .single()

  if (error) {
    console.error('Error inserting alert:', error)
    return null
  }
  return data
}

export async function updateAutomationAlert(id: string, updates: Partial<AutomationAlert>): Promise<AutomationAlert | null> {
  const { data, error } = await supabase
    .from('automationAlerts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating alert:', error)
    return null
  }
  return data
}

export async function deleteAutomationAlerts(): Promise<boolean> {
  const { error } = await supabase
    .from('automationAlerts')
    .delete()
    .neq('id', '')

  if (error) {
    console.error('Error deleting alerts:', error)
    return false
  }
  return true
}
