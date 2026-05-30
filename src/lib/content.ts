import { API_URL } from "./api"
import type { Page } from "./courses"

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  display_order: number
  is_active: boolean
  thumbnail_url: string | null
}

export interface ArchivePublic {
  id: number
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  thumbnail_url: string | null
  status: string
  published_at: string | null
  author_id: number
  archive_category_id: number | null
  view_count: number
  created_at: string
  updated_at: string
}

export async function fetchCourseCategories(): Promise<Category[]> {
  const res = await fetch(
    `${API_URL}/course-categories/?is_active=true&limit=200`,
    { cache: "no-store" },
  )
  if (!res.ok) throw new Error(`Failed to load course categories (${res.status})`)
  const page = (await res.json()) as Page<Category>
  return [...page.items].sort((a, b) => a.display_order - b.display_order)
}

export async function fetchArchiveCategories(): Promise<Category[]> {
  const res = await fetch(
    `${API_URL}/archive-categories/?is_active=true&limit=200`,
    { cache: "no-store" },
  )
  if (!res.ok) throw new Error(`Failed to load content categories (${res.status})`)
  const page = (await res.json()) as Page<Category>
  return [...page.items].sort((a, b) => a.display_order - b.display_order)
}

export async function fetchPublishedArchives(limit = 50): Promise<ArchivePublic[]> {
  const res = await fetch(
    `${API_URL}/archives/?status=published&limit=${limit}`,
    { cache: "no-store" },
  )
  if (!res.ok) throw new Error(`Failed to load articles (${res.status})`)
  const page = (await res.json()) as Page<ArchivePublic>
  return page.items
}

export async function fetchArchiveBySlug(
  slug: string,
): Promise<ArchivePublic | null> {
  const res = await fetch(`${API_URL}/archives/slug/${slug}`, {
    cache: "no-store",
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Failed to load article (${res.status})`)
  return (await res.json()) as ArchivePublic
}

/** "20 / 05 / 2026" */
export function formatDate(iso: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  return `${dd} / ${mm} / ${d.getFullYear()}`
}

/** "20 / 05" (no year) */
export function formatDateShort(iso: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  const dd = String(d.getDate()).padStart(2, "0")
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  return `${dd} / ${mm}`
}

/** Estimate reading minutes from HTML content (~200 words/min). */
export function readingMinutes(content: string | null): number {
  if (!content) return 1
  const text = content.replace(/<[^>]+>/g, " ")
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}

/** "3.4k" / "612" */
export function formatViews(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`
  return String(n)
}
