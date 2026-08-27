import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

export function getSupabaseClient() {
  if (typeof window === 'undefined') return null
  
  if (!supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    
    if (url && key) {
      try {
        supabaseClient = createClient(url, key)
      } catch (error) {
        console.warn('Failed to create Supabase client:', error)
        return null
      }
    }
  }
  
  return supabaseClient
}

export const supabase = {
  async from(table: string) {
    const client = getSupabaseClient()
    if (!client) return null
    return client.from(table)
  }
}

export const isSupabaseConfigured = () => {
  if (typeof window === 'undefined') return false
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return !!(url && key && url !== '' && key !== '')
}
