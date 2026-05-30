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

export interface LessonFull {
  id: number
  course_id: number
  section_id: number | null
  title: string
  content: string | null
  video_url: string | null
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

/**
 * Resolve a lesson video URL into a playable embed.
 * - YouTube (watch / youtu.be / embed) → iframe embed
 * - Google Drive (file/d, open?id, uc?id) → /preview iframe (file must be shared
 *   "Anyone with the link")
 * - Vimeo → player iframe
 * - Direct file (.mp4/.webm/...) → native <video>
 * - Anything else → assume an embeddable iframe URL
 */
export function resolveVideo(
  url: string | null,
): { kind: "iframe" | "video"; src: string } | null {
  if (!url) return null
  const u = url.trim()

  const yt = u.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/,
  )
  if (yt) return { kind: "iframe", src: `https://www.youtube.com/embed/${yt[1]}` }

  if (u.includes("drive.google.com")) {
    const gd =
      u.match(/\/file\/d\/([\w-]+)/) || u.match(/[?&]id=([\w-]+)/)
    if (gd) {
      return {
        kind: "iframe",
        src: `https://drive.google.com/file/d/${gd[1]}/preview`,
      }
    }
  }

  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vm) return { kind: "iframe", src: `https://player.vimeo.com/video/${vm[1]}` }

  if (/\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(u)) {
    return { kind: "video", src: u }
  }

  return { kind: "iframe", src: u }
}

export const learning = {
  me: () => apiFetch<StudentMe>("/students/me"),

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
