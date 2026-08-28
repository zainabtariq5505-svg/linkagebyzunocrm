const HARDCODED_EMAIL = 'azozzuno@linkage.com'
const HARDCODED_PASSWORD = 'linkagewillbenumber1@69'
const AUTH_TOKEN_KEY = 'linkage_crm_auth_token'
const AUTH_TOKEN_EXPIRY_KEY = 'linkage_crm_auth_expiry'
const TOKEN_EXPIRY_HOURS = 24

/**
 * Authenticate user with email and password
 */
export function authenticateUser(email: string, password: string): boolean {
  return email === HARDCODED_EMAIL && password === HARDCODED_PASSWORD
}

/**
 * Create and store auth token
 */
export function createAuthToken(): string {
  const token = btoa(`${Date.now()}-${Math.random()}`)
  const expiryTime = Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000

  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_TOKEN_KEY, token)
    localStorage.setItem(AUTH_TOKEN_EXPIRY_KEY, expiryTime.toString())
  }

  return token
}

/**
 * Verify if user has valid auth token
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false

  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    const expiry = localStorage.getItem(AUTH_TOKEN_EXPIRY_KEY)

    if (!token || !expiry) return false

    const expiryTime = parseInt(expiry, 10)
    if (Date.now() > expiryTime) {
      clearAuthToken()
      return false
    }

    return true
  } catch {
    return false
  }
}

/**
 * Clear auth token (logout)
 */
export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_TOKEN_EXPIRY_KEY)
  }
}

/**
 * Get remaining time until token expires (in minutes)
 */
export function getTokenRemainingTime(): number {
  if (typeof window === 'undefined') return 0

  try {
    const expiry = localStorage.getItem(AUTH_TOKEN_EXPIRY_KEY)
    if (!expiry) return 0

    const expiryTime = parseInt(expiry, 10)
    const remainingMs = expiryTime - Date.now()
    return Math.max(0, Math.ceil(remainingMs / (60 * 1000)))
  } catch {
    return 0
  }
}
