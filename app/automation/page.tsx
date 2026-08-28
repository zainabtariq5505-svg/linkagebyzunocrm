'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, Bell, CheckCircle, Zap, TrendingDown, BarChart3, Clock } from 'lucide-react'
import {
  loadAutomationRules,
  saveAutomationRules,
  runAutomationChecks,
  getActiveAlerts,
  markAlertAsRead,
  AutomationRule,
  AutomationAlert,
} from '@/lib/automation'
import { loadData } from '@/lib/db'
import { getDateString } from '@/lib/utils'
import { CRMData } from '@/lib/types'

export default function AutomationPage() {
  const [data, setData] = useState<CRMData | null>(null)
  const [rules, setRules] = useState<AutomationRule[]>([])
  const [alerts, setAlerts] = useState<AutomationAlert[]>([])
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const crmData = loadData()
    setData(crmData)
    
    const automationRules = loadAutomationRules()
    setRules(automationRules)

    // Run automation checks
    const today = getDateString(new Date())
    const dayOfWeek = new Date().getDay()
    const dailyRequirement = crmData.dailyRequirements.find(r => r.dayOfWeek === dayOfWeek)?.requiredVideos || 0
    const generatedAlerts = runAutomationChecks(crmData, today, dailyRequirement)
    
    // Combine with saved alerts
    const savedAlerts = getActiveAlerts()
    setAlerts([...generatedAlerts, ...savedAlerts].slice(0, 20))
  }, [])

  const handleToggleRule = (ruleId: string) => {
    const updated = rules.map(r => 
      r.id === ruleId ? { ...r, enabled: !r.enabled } : r
    )
    setRules(updated)
    saveAutomationRules(updated)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleUpdateThreshold = (ruleId: string, newThreshold: number) => {
    const updated = rules.map(r =>
      r.id === ruleId ? { ...r, threshold: newThreshold } : r
    )
    setRules(updated)
    saveAutomationRules(updated)
  }

  const handleMarkAsRead = (alertId: string) => {
    markAlertAsRead(alertId)
    setAlerts(alerts.map(a => a.id === alertId ? { ...a, read: true } : a))
  }

  const getRuleIcon = (type: string) => {
    switch (type) {
      case 'compliance_alert': return <CheckCircle size={20} className="text-blue-600 dark:text-blue-400" />
      case 'low_engagement': return <TrendingDown size={20} className="text-orange-600 dark:text-orange-400" />
      case 'missing_slot': return <BarChart3 size={20} className="text-red-600 dark:text-red-400" />
      case 'performance_alert': return <Zap size={20} className="text-purple-600 dark:text-purple-400" />
      default: return <Bell size={20} className="text-gray-600 dark:text-gray-400" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700'
      case 'warning': return 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700'
      default: return 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'
    }
  }

  if (!data) return <div className="animate-pulse">Loading...</div>

  const unreadCount = alerts.filter(a => !a.read).length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Automation</h1>
        <p className="text-gray-600 dark:text-slate-400 mt-1">
          Configure automated alerts and rules for your CRM
        </p>
      </div>

      {/* Alerts Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Bell size={24} className="text-purple-600 dark:text-purple-400" />
            <p className="text-sm text-gray-600 dark:text-slate-400">Active Alerts</p>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{unreadCount}</p>
          <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">Unread</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Zap size={24} className="text-blue-600 dark:text-blue-400" />
            <p className="text-sm text-gray-600 dark:text-slate-400">Rules Enabled</p>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{rules.filter(r => r.enabled).length}/{rules.length}</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Clock size={24} className="text-green-600 dark:text-green-400" />
            <p className="text-sm text-gray-600 dark:text-slate-400">Last Check</p>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">Now</p>
        </div>
      </div>

      {/* Automation Rules */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Automation Rules</h2>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-slate-700">
          {rules.map(rule => (
            <div key={rule.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getRuleIcon(rule.type)}
                    <h3 className="font-medium text-gray-900 dark:text-white">{rule.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
                    {rule.type === 'compliance_alert' && 'Alert when creator compliance drops below threshold'}
                    {rule.type === 'low_engagement' && 'Alert for videos with low engagement rates'}
                    {rule.type === 'missing_slot' && 'Alert when daily slots are not filled'}
                    {rule.type === 'performance_alert' && 'Alert for underperforming videos'}
                  </p>

                  {rule.threshold && (
                    <div className="flex items-center gap-4">
                      <label className="text-sm text-gray-700 dark:text-slate-300">
                        Threshold:
                        <input
                          type="number"
                          value={rule.threshold}
                          onChange={(e) => handleUpdateThreshold(rule.id, parseInt(e.target.value))}
                          className="ml-2 w-16 px-2 py-1 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        />
                        {rule.type === 'compliance_alert' && '%'}
                        {rule.type === 'low_engagement' && '%'}
                        {rule.type === 'performance_alert' && ' views'}
                      </label>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleToggleRule(rule.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    rule.enabled
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                      : 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-900/50'
                  }`}
                >
                  {rule.enabled ? '✓ Enabled' : 'Disabled'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {saved && (
          <div className="px-6 py-3 bg-green-50 dark:bg-green-900/20 border-t border-green-200 dark:border-green-800">
            <p className="text-sm text-green-700 dark:text-green-300">✓ Automation rules updated</p>
          </div>
        )}
      </div>

      {/* Active Alerts */}
      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Alerts</h2>
        </div>

        {alerts.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <CheckCircle size={48} className="mx-auto mb-4 text-green-400" />
            <p className="text-gray-600 dark:text-slate-400">No alerts at the moment</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {alerts.map(alert => (
              <div
                key={alert.id}
                className={`px-6 py-4 border-l-4 ${getSeverityColor(alert.severity)} ${
                  !alert.read ? 'bg-opacity-50' : 'opacity-75'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle size={18} className={alert.severity === 'critical' ? 'text-red-600' : 'text-yellow-600'} />
                      <span className="font-medium text-sm text-gray-900 dark:text-white">{alert.targetName}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        alert.severity === 'critical'
                          ? 'bg-red-200 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                          : 'bg-yellow-200 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'
                      }`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-slate-300 mb-2">{alert.message}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>

                  {!alert.read && (
                    <button
                      onClick={() => handleMarkAsRead(alert.id)}
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">Automation Features</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>✓ Compliance tracking - Alert when creators miss approval targets</li>
          <li>✓ Engagement monitoring - Detect underperforming videos</li>
          <li>✓ Slot management - Get alerts for unfilled daily slots</li>
          <li>✓ Performance insights - Track video performance automatically</li>
          <li>✓ Customizable thresholds - Set your own alert parameters</li>
        </ul>
      </div>
    </div>
  )
}
