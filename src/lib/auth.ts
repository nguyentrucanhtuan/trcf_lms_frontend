import type { User } from "./types"

const ACCESS_KEY = "trcf_access_token"
const REFRESH_KEY = "trcf_refresh_token"
const USER_KEY = "trcf_user"

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null
  return window.localStorage.getItem(REFRESH_KEY)
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null
  const raw = window.localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function setSession(args: {
  access: string
  refresh: string
  user: User
}) {
  window.localStorage.setItem(ACCESS_KEY, args.access)
  window.localStorage.setItem(REFRESH_KEY, args.refresh)
  window.localStorage.setItem(USER_KEY, JSON.stringify(args.user))
}

export function setTokens(access: string, refresh: string) {
  window.localStorage.setItem(ACCESS_KEY, access)
  window.localStorage.setItem(REFRESH_KEY, refresh)
}

export function clearSession() {
  window.localStorage.removeItem(ACCESS_KEY)
  window.localStorage.removeItem(REFRESH_KEY)
  window.localStorage.removeItem(USER_KEY)
}
