"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getStoredUser } from "@/lib/auth"
import { learning } from "@/lib/learning"
import {
  humanDuration,
  lessonLength,
  type CourseContent,
  type SectionWithLessons,
} from "@/lib/courses"

/**
 * Course CTA that adapts to the viewer:
 * - enrolled student  → "Vào học" link to the learning page
 * - everyone else     → the normal "Đăng ký" link to checkout
 * Renders the checkout link on first paint (SSR-safe) and upgrades to
 * "Vào học" after mount once enrollment is confirmed.
 */
export function CourseCta({
  slug,
  courseId,
  enrollLabel,
}: {
  slug: string
  courseId: number
  enrollLabel: string
}) {
  const [mounted, setMounted] = useState(false)
  const [isStudent, setIsStudent] = useState(false)

  useEffect(() => {
    const u = getStoredUser()
    setIsStudent(u?.role === "student")
    setMounted(true)
  }, [])

  const enrolledQ = useQuery({
    queryKey: ["my-enroll-course", courseId],
    enabled: mounted && isStudent,
    queryFn: async () => {
      const page = await learning.enrollmentsForCourse(courseId)
      return page.items.some((e) => e.status !== "cancelled")
    },
  })

  if (isStudent && enrolledQ.data === true) {
    return (
      <Link href={`/hoc/${slug}`} className="btn btn-primary">
        <span>Vào học</span>
        <span className="ms">arrow_forward</span>
      </Link>
    )
  }

  return (
    <Link href={`/checkout?course=${slug}`} className="btn btn-primary">
      <span>{enrollLabel}</span>
      <span className="ms">arrow_forward</span>
    </Link>
  )
}

function moduleMinutes(section: SectionWithLessons): number {
  return section.lessons.reduce((s, l) => s + (l.duration_minutes ?? 0), 0)
}

export function CurriculumModule({
  section,
  index,
  defaultOpen,
}: {
  section: SectionWithLessons
  index: number
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen))
  const num = String(index + 1).padStart(2, "0")

  return (
    <div className={`module-row ${open ? "open" : ""}`}>
      <button
        type="button"
        className="module-head"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <div className="module-num">{num}</div>
        <div className="module-info">
          <div className="ttl">{section.title}</div>
          {section.description && <div className="sub">{section.description}</div>}
        </div>
        <div className="module-stats">
          <span>
            <span className="ms">play_circle</span>
            {section.lessons.length} bài
          </span>
          <span>
            <span className="ms">schedule</span>
            {humanDuration(moduleMinutes(section))}
          </span>
        </div>
        <span className="ms toggle">expand_more</span>
      </button>
      {open && (
        <div className="module-body">
          {section.lessons.map((lesson) => (
            <div className="module-lesson" key={lesson.id}>
              <span className="ms">
                {lesson.is_preview ? "play_circle" : "lock"}
              </span>
              <span className="name">{lesson.title}</span>
              {lesson.is_preview ? (
                <span className="preview-tag">Học thử</span>
              ) : (
                <span />
              )}
              <span className="dur">{lessonLength(lesson.duration_minutes)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function FaqItem({ faq }: { faq: NonNullable<CourseContent["faqs"]>[number] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`faq-item ${open ? "open" : ""}`}>
      <button
        type="button"
        className="faq-q"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{faq.q}</span>
        <span className="ms">add</span>
      </button>
      {open && <div className="faq-a">{faq.a}</div>}
    </div>
  )
}
