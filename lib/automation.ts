import { CRMData } from './types'
import { calculateCreatorMetrics } from './metrics'

export interface AutomationRule {
  id: string
  name: string
  type: 'auto_slot' | 'compliance_alert' | 'low_engagement' | 'missing_slot' | 'performance_alert'
  enabled: boolean
  threshold?: number
  action: string
  createdAt: number
}

export interface AutomationAlert {
  id: string
  ruleId: string
  type: string
  targetId: string // creator or video ID
  targetName: string
  message: string
  severity: 'info' | 'warning' | 'critical'
  timestamp: number
  read: boolean
}

const AUTOMATION_RULES_KEY = 'linkage_automation_rules'
const AUTOMATION_ALERTS_KEY = 'linkage_automation_alerts'

/**
 * Load automation rules
 */
export function loadAutomationRules(): AutomationRule[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(AUTOMATION_RULES_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    console.error('Failed to load automation rules')
  }

  return getDefaultRules()
}

/**
 * Get default automation rules
 */
export function getDefaultRules(): AutomationRule[] {
  return [
    {
      id: 'rule_compliance_alert',
      name: 'Compliance Alert',
      type: 'compliance_alert',
      enabled: true,
      threshold: 80, // Alert if below 80% compliance
      action: 'send_alert',
      createdAt: Date.now(),
    },
    {
      id: 'rule_low_engagement',
      name: 'Low Engagement Alert',
      type: 'low_engagement',
      enabled: true,
      threshold: 2, // Alert if engagement rate below 2%
      action: 'send_alert',
      createdAt: Date.now(),
    },
    {
      id: 'rule_missing_slot',
      name: 'Missing Slot Alert',
      type: 'missing_slot',
      enabled: true,
      action: 'send_alert',
      createdAt: Date.now(),
    },
    {
      id: 'rule_performance_alert',
      name: 'Performance Alert',
      type: 'performance_alert',
      enabled: true,
      threshold: 1000, // Alert if views below 1000
      action: 'send_alert',
      createdAt: Date.now(),
    },
  ]
}

/**
 * Save automation rules
 */
export function saveAutomationRules(rules: AutomationRule[]): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(AUTOMATION_RULES_KEY, JSON.stringify(rules))
  } catch (error) {
    console.error('Failed to save automation rules:', error)
  }
}

/**
 * Load automation alerts
 */
export function loadAutomationAlerts(): AutomationAlert[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(AUTOMATION_ALERTS_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch {
    console.error('Failed to load automation alerts')
  }

  return []
}

/**
 * Add automation alert
 */
export function addAutomationAlert(alert: Omit<AutomationAlert, 'id'>): void {
  if (typeof window === 'undefined') return

  try {
    const alerts = loadAutomationAlerts()
    const newAlert: AutomationAlert = {
      ...alert,
      id: `alert_${Date.now()}`,
    }
    alerts.unshift(newAlert)
    localStorage.setItem(AUTOMATION_ALERTS_KEY, JSON.stringify(alerts))
  } catch (error) {
    console.error('Failed to add automation alert:', error)
  }
}

/**
 * Clear automation alerts
 */
export function clearAutomationAlerts(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTOMATION_ALERTS_KEY)
  }
}

/**
 * Auto-assign slots to creators
 */
export function autoAssignSlots(data: CRMData, date: string, requiredSlots: number): string[] {
  const createdVideoIds: string[] = []
  const dateVideos = data.videos.filter(v => v.date === date)

  // Get active creators
  const activeCreators = data.creators.filter(c => c.status === 'Active')

  // Assign remaining slots to creators
  for (let i = dateVideos.length; i < requiredSlots && i < activeCreators.length; i++) {
    // Slot assignment logic would go here
    // Note: In real implementation, this would call addVideo
  }

  return createdVideoIds
}

/**
 * Check compliance and generate alerts
 */
export function checkComplianceAlerts(data: CRMData, rules: AutomationRule[]): AutomationAlert[] {
  const alerts: AutomationAlert[] = []
  const complianceRule = rules.find(r => r.type === 'compliance_alert' && r.enabled)

  if (!complianceRule) return alerts

  data.creators.forEach(creator => {
    const metrics = calculateCreatorMetrics(creator, data.videos)
    
    if (complianceRule.threshold && metrics.complianceRate < complianceRule.threshold) {
      alerts.push({
        id: `alert_${Date.now()}_${creator.id}`,
        ruleId: complianceRule.id,
        type: 'compliance_alert',
        targetId: creator.id,
        targetName: creator.name,
        message: `⚠️ ${creator.name}'s compliance rate is ${metrics.complianceRate.toFixed(0)}%. Below target of ${complianceRule.threshold}%`,
        severity: metrics.complianceRate < 50 ? 'critical' : 'warning',
        timestamp: Date.now(),
        read: false,
      })
    }
  })

  return alerts
}

/**
 * Check for low engagement and generate alerts
 */
export function checkEngagementAlerts(data: CRMData, rules: AutomationRule[]): AutomationAlert[] {
  const alerts: AutomationAlert[] = []
  const engagementRule = rules.find(r => r.type === 'low_engagement' && r.enabled)

  if (!engagementRule) return alerts

  data.videos.forEach(video => {
    const likes = video.likes || 0
    const comments = video.comments || 0
    const engagementRate = video.views > 0 ? ((likes + comments) / video.views) * 100 : 0

    if (engagementRule.threshold && engagementRate < engagementRule.threshold && video.views > 0) {
      const creator = data.creators.find(c => c.id === video.creatorId)
      alerts.push({
        id: `alert_${Date.now()}_${video.id}`,
        ruleId: engagementRule.id,
        type: 'low_engagement',
        targetId: video.id,
        targetName: `${creator?.name || 'Unknown'}'s video`,
        message: `📉 Low engagement: ${engagementRate.toFixed(2)}% (${likes + comments} engagements on ${video.views} views)`,
        severity: engagementRate === 0 ? 'critical' : 'warning',
        timestamp: Date.now(),
        read: false,
      })
    }
  })

  return alerts
}

/**
 * Check for missing slots
 */
export function checkMissingSlots(data: CRMData, date: string, requiredSlots: number): AutomationAlert[] {
  const alerts: AutomationAlert[] = []
  const dateVideos = data.videos.filter(v => v.date === date && v.status !== 'Missed')
  const missingSlots = Math.max(0, requiredSlots - dateVideos.length)

  if (missingSlots > 0) {
    alerts.push({
      id: `alert_${Date.now()}_missing_slots`,
      ruleId: 'rule_missing_slot',
      type: 'missing_slot',
      targetId: date,
      targetName: new Date(date).toLocaleDateString(),
      message: `📋 Missing ${missingSlots} video${missingSlots > 1 ? 's' : ''} for ${new Date(date).toLocaleDateString()} (${dateVideos.length}/${requiredSlots} filled)`,
      severity: missingSlots > 5 ? 'critical' : 'warning',
      timestamp: Date.now(),
      read: false,
    })
  }

  return alerts
}

/**
 * Run all automation checks
 */
export function runAutomationChecks(data: CRMData, todayDate: string, dailyRequirement: number): AutomationAlert[] {
  const rules = loadAutomationRules()
  const allAlerts: AutomationAlert[] = []

  // Compliance checks
  allAlerts.push(...checkComplianceAlerts(data, rules))

  // Engagement checks
  allAlerts.push(...checkEngagementAlerts(data, rules))

  // Missing slots
  allAlerts.push(...checkMissingSlots(data, todayDate, dailyRequirement))

  return allAlerts
}

/**
 * Get active alerts
 */
export function getActiveAlerts(): AutomationAlert[] {
  const alerts = loadAutomationAlerts()
  return alerts.filter(a => !a.read).slice(0, 10) // Last 10 unread
}

/**
 * Mark alert as read
 */
export function markAlertAsRead(alertId: string): void {
  if (typeof window === 'undefined') return

  try {
    const alerts = loadAutomationAlerts()
    const alert = alerts.find(a => a.id === alertId)
    if (alert) {
      alert.read = true
      localStorage.setItem(AUTOMATION_ALERTS_KEY, JSON.stringify(alerts))
    }
  } catch (error) {
    console.error('Failed to mark alert as read:', error)
  }
}
