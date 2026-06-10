import { apiFetch } from "./api"
import type { Page } from "./courses"
import type { CouponValidateResult, Order } from "./types"

export interface StudentMe {
  id: number
  user_id: number
  student_code: string
  full_name: string
  status: string
}

export interface EnrollmentRow {
  id: number
  student_id: number
  course_id: number
  status: string
}

export type VideoType = "auto" | "youtube" | "vimeo" | "drive" | "file"

export interface LessonFull {
  id: number
  course_id: number
  section_id: number | null
  title: string
  content: string | null
  video_url: string | null
  video_type: VideoType
  duration_minutes: number | null
  position: number
  is_preview: boolean
  is_published: boolean
}

export interface ProgressRow {
  id: number
  student_id: number
  lesson_id: number
  completed_at: string | null
  seconds_watched: number
}

type Resolved = { kind: "iframe" | "video"; src: string }

/** YouTube → /embed iframe. Handles watch, youtu.be, embed, shorts, live, v/. */
function youtubeEmbed(u: string): Resolved | null {
  const m =
    u.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([\w-]{11})/,
    ) || u.match(/[?&]v=([\w-]{11})/)
  return m
    ? { kind: "iframe", src: `https://www.youtube.com/embed/${m[1]}` }
    : null
}

/**
 * Vimeo → player iframe. Keeps the privacy hash (from `/123/HASH` path or
 * `?h=HASH` query) so unlisted/private videos still play.
 */
function vimeoEmbed(u: string): Resolved | null {
  const m = u.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/(\w+))?/)
  if (!m) return null
  const hash = u.match(/[?&]h=(\w+)/)?.[1] ?? m[2]
  const src = `https://player.vimeo.com/video/${m[1]}${hash ? `?h=${hash}` : ""}`
  return { kind: "iframe", src }
}

/** Google Drive → /preview iframe (file must be shared "Anyone with the link"). */
function driveEmbed(u: string): Resolved | null {
  const m = u.match(/\/file\/d\/([\w-]+)/) || u.match(/[?&]id=([\w-]+)/)
  return m
    ? { kind: "iframe", src: `https://drive.google.com/file/d/${m[1]}/preview` }
    : null
}

/**
 * Resolve a lesson video into a playable embed.
 *
 * `type` lets the admin force a provider (so unusual URL formats still work);
 * `auto` (default) detects the provider from the URL. The raw-URL fallback is
 * a last resort — note YouTube/Vimeo refuse to embed their *page* URLs, which
 * is why forcing the type or pasting a proper link matters.
 */
export function resolveVideo(
  url: string | null,
  type: VideoType = "auto",
): Resolved | null {
  if (!url) return null
  const u = url.trim()
  if (!u) return null

  switch (type) {
    case "youtube":
      return youtubeEmbed(u) ?? { kind: "iframe", src: u }
    case "vimeo":
      return vimeoEmbed(u) ?? { kind: "iframe", src: u }
    case "drive":
      return driveEmbed(u) ?? { kind: "iframe", src: u }
    case "file":
      return { kind: "video", src: u }
    default:
      return (
        youtubeEmbed(u) ??
        vimeoEmbed(u) ??
        driveEmbed(u) ??
        (/\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(u)
          ? { kind: "video", src: u }
          : { kind: "iframe", src: u })
      )
  }
}

export const learning = {
  me: () => apiFetch<StudentMe>("/students/me"),

  // All enrollments for the current student. The backend forces the
  // student_id filter to the authenticated user, so no argument is needed.
  myEnrollments: () =>
    apiFetch<Page<EnrollmentRow>>("/enrollments/", {
      query: { limit: 200 },
    }),

  enrollmentsForCourse: (courseId: number) =>
    apiFetch<Page<EnrollmentRow>>("/enrollments/", {
      query: { course_id: courseId },
    }),

  lesson: (lessonId: number) => apiFetch<LessonFull>(`/lessons/${lessonId}`),

  progress: (studentId: number, courseId: number) =>
    apiFetch<ProgressRow[]>("/lesson-progress/", {
      query: { student_id: studentId, course_id: courseId },
    }),

  markProgress: (body: {
    student_id: number
    lesson_id: number
    mark_completed: boolean
    seconds_watched?: number
  }) =>
    apiFetch<ProgressRow>("/lesson-progress/", {
      method: "POST",
      body: { seconds_watched: 0, ...body },
    }),
}

export const orders = {
  create: (body: {
    student_id: number
    payment_method_id: number
    items: { course_id: number }[]
    coupon_code?: string
  }) =>
    apiFetch<{ id: number; order_code: string }>("/orders/", {
      method: "POST",
      body,
    }),

  payMock: (orderId: number) =>
    apiFetch<{ id: number; order_code: string; payment_status: string }>(
      `/orders/${orderId}/pay-mock`,
      { method: "POST" },
    ),

  byCode: (code: string) => apiFetch<Order>(`/orders/code/${code}`),
}

export const coupons = {
  validate: (code: string, subtotal: number) =>
    apiFetch<CouponValidateResult>("/coupons/validate", {
      method: "POST",
      query: { code, subtotal },
      auth: false,
    }),
}
