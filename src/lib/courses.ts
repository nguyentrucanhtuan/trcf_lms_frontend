import { API_URL } from "./api"

/** Rich landing-page content stored as JSON in Course.content. */
export interface CourseContent {
  eyebrow?: string
  level?: string
  language?: string
  promo_duration?: string
  stats?: { num: string; label: string }[]
  outcomes?: { icon: string; title: string; desc: string }[]
  requirements?: string[]
  audiences?: string[]
  instructor?: {
    name: string
    role?: string
    bio?: string[]
    creds?: { icon: string; text: string }[]
  }
  reviews?: { rating: number; text: string; name: string; role?: string }[]
  includes?: string[]
  faqs?: { q: string; a: string }[]
}

export interface LessonBrief {
  id: number
  title: string
  position: number
  duration_minutes: number | null
  is_preview: boolean
  is_published: boolean
}

export interface SectionWithLessons {
  id: number
  course_id: number
  title: string
  description: string | null
  position: number
  lessons: LessonBrief[]
}

export interface CourseCategoryBrief {
  id: number
  name: string
  slug: string
}

export interface CoursePublic {
  id: number
  course_code: string
  name: string
  slug: string
  description: string | null
  content: string | null
  thumbnail_url: string | null
  status: string
  price: number
  sale_price: number | null
  categories: CourseCategoryBrief[]
}

export interface CourseDetail extends CoursePublic {
  sections: SectionWithLessons[]
  lessons: LessonBrief[]
}

export interface Page<T> {
  items: T[]
  total: number
  offset: number
  limit: number
}

/** Parse the JSON content blob; returns {} if missing/invalid. */
export function parseCourseContent(content: string | null): CourseContent {
  if (!content) return {}
  try {
    return JSON.parse(content) as CourseContent
  } catch {
    return {}
  }
}

export async function fetchCourseBySlug(
  slug: string,
): Promise<CourseDetail | null> {
  const res = await fetch(`${API_URL}/courses/slug/${slug}`, {
    cache: "no-store",
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Failed to load course (${res.status})`)
  return (await res.json()) as CourseDetail
}

export async function fetchCourseById(
  id: number,
): Promise<CourseDetail | null> {
  const res = await fetch(`${API_URL}/courses/${id}`, { cache: "no-store" })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Failed to load course (${res.status})`)
  return (await res.json()) as CourseDetail
}

export async function fetchPublishedCourses(
  limit = 12,
): Promise<CoursePublic[]> {
  const res = await fetch(
    `${API_URL}/courses/?status=published&limit=${limit}`,
    { cache: "no-store" },
  )
  if (!res.ok) throw new Error(`Failed to load courses (${res.status})`)
  const page = (await res.json()) as Page<CoursePublic>
  return page.items
}

/** Format VND integer to "1.290.000" (no currency symbol). */
export function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount)
}

/** Total minutes across all lessons of a course detail. */
export function totalMinutes(course: CourseDetail): number {
  const all = [
    ...course.lessons,
    ...course.sections.flatMap((s) => s.lessons),
  ]
  return all.reduce((sum, l) => sum + (l.duration_minutes ?? 0), 0)
}

export function countLessons(course: CourseDetail): number {
  return (
    course.lessons.length +
    course.sections.reduce((sum, s) => sum + s.lessons.length, 0)
  )
}

/** "1g 50p" / "45p" from a minute count. */
export function humanDuration(minutes: number): string {
  if (minutes <= 0) return "—"
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}p`
  if (m === 0) return `${h}g`
  return `${h}g ${m}p`
}

/** "mm:ss" guess for a lesson length (display only). */
export function lessonLength(minutes: number | null): string {
  if (!minutes || minutes <= 0) return ""
  return `${minutes}:00`
}
