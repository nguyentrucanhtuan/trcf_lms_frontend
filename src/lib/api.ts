import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "./auth"

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export class ApiError extends Error {
  status: number
  detail: unknown
  constructor(status: number, message: string, detail: unknown) {
    super(message)
    this.status = status
    this.detail = detail
  }
}

type QueryValue = string | number | boolean | null | undefined
interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown
  query?: Record<string, QueryValue>
  auth?: boolean
}

function buildUrl(
  path: string,
  query?: RequestOptions["query"],
): string {
  const url = new URL(path.startsWith("http") ? path : `${API_URL}${path}`)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue
      url.searchParams.set(key, String(value))
    }
  }
  return url.toString()
}

async function parseResponse(res: Response): Promise<unknown> {
  if (res.status === 204) return null
  const ct = res.headers.get("content-type") || ""
  if (ct.includes("application/json")) return res.json()
  return res.text()
}

let refreshPromise: Promise<boolean> | null = null

async function tryRefresh(): Promise<boolean> {
  if (refreshPromise) return refreshPromise
  const refresh = getRefreshToken()
  if (!refresh) return false
  refreshPromise = (async () => {
    try {
      const res = await fetch(buildUrl("/auth/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refresh }),
      })
      if (!res.ok) return false
      const data = (await res.json()) as {
        access_token: string
        refresh_token: string
      }
      setTokens(data.access_token, data.refresh_token)
      return true
    } catch {
      return false
    } finally {
      refreshPromise = null
    }
  })()
  return refreshPromise
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, query, auth = true, headers, ...rest } = options
  const url = buildUrl(path, query)

  const init: RequestInit = {
    ...rest,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(headers as Record<string, string> | undefined),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }

  const applyAuth = () => {
    const token = getAccessToken()
    if (auth && token) {
      ;(init.headers as Record<string, string>)["Authorization"] =
        `Bearer ${token}`
    }
  }
  applyAuth()

  let res = await fetch(url, init)

  if (res.status === 401 && auth) {
    const ok = await tryRefresh()
    if (ok) {
      applyAuth()
      res = await fetch(url, init)
    } else {
      clearSession()
    }
  }

  if (!res.ok) {
    const data = await parseResponse(res).catch(() => null)
    const message =
      (data && typeof data === "object" && "detail" in data
        ? String((data as { detail: unknown }).detail)
        : null) || res.statusText
    throw new ApiError(res.status, message, data)
  }

  return parseResponse(res) as Promise<T>
}
