"use client"

import { useState } from "react"
import {
  humanDuration,
  lessonLength,
  type CourseContent,
  type SectionWithLessons,
} from "@/lib/courses"

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
