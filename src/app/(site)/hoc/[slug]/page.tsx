"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import "../learn.css"
import { BrandLogo } from "../../../(index)/_components/brand-logo"
import { getStoredUser } from "@/lib/auth"
import {
  fetchCourseBySlug,
  humanDuration,
  type LessonBrief,
  type SectionWithLessons,
} from "@/lib/courses"
import { learning, resolveVideo } from "@/lib/learning"

interface FlatLesson extends LessonBrief {
  sectionTitle: string | null
  sectionIndex: number
}

function flatten(sections: SectionWithLessons[], loose: LessonBrief[]): FlatLesson[] {
  const out: FlatLesson[] = []
  sections.forEach((s, i) => {
    s.lessons.forEach((l) =>
      out.push({ ...l, sectionTitle: s.title, sectionIndex: i }),
    )
  })
  loose.forEach((l) => out.push({ ...l, sectionTitle: null, sectionIndex: -1 }))
  return out
}

export default function LearnPage() {
  const router = useRouter()
  const params = useParams<{ slug: string }>()
  const slug = params.slug
  const queryClient = useQueryClient()

  const [authChecked, setAuthChecked] = useState(false)
  const [activeId, setActiveId] = useState<number | null>(null)
  const [marking, setMarking] = useState(false)

  // Gate: students only — redirect to student login if no session.
  useEffect(() => {
    const u = getStoredUser()
    if (!u) {
      router.replace(`/dang-nhap?next=${encodeURIComponent(`/hoc/${slug}`)}`)
      return
    }
    setAuthChecked(true)
  }, [router, slug])

  const courseQ = useQuery({
    queryKey: ["learn-course", slug],
    queryFn: () => fetchCourseBySlug(slug),
    enabled: authChecked,
  })
  const course = courseQ.data ?? null

  const meQ = useQuery({
    queryKey: ["me-student"],
    queryFn: () => learning.me(),
    enabled: authChecked,
  })
  const studentId = meQ.data?.id ?? null

  const enrollQ = useQuery({
    queryKey: ["enroll", course?.id],
    queryFn: () => learning.enrollmentsForCourse(course!.id),
    enabled: !!course,
  })
  const enrolled = useMemo(
    () =>
      (enrollQ.data?.items ?? []).some(
        (e) => e.course_id === course?.id && e.status === "active",
      ),
    [enrollQ.data, course],
  )

  const progressQ = useQuery({
    queryKey: ["progress", studentId, course?.id],
    queryFn: () => learning.progress(studentId!, course!.id),
    enabled: !!studentId && !!course,
  })
  const completed = useMemo(() => {
    const set = new Set<number>()
    for (const p of progressQ.data ?? [])
      if (p.completed_at) set.add(p.lesson_id)
    return set
  }, [progressQ.data])

  const flat = useMemo(
    () => (course ? flatten(course.sections, course.lessons) : []),
    [course],
  )
  const accessible = (l: LessonBrief) => enrolled || l.is_preview

  // Pick an initial active lesson once data is ready.
  useEffect(() => {
    if (activeId != null || flat.length === 0) return
    const firstAccessible = flat.find((l) => accessible(l))
    setActiveId((firstAccessible ?? flat[0]).id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flat, enrolled])

  const active = flat.find((l) => l.id === activeId) ?? null
  const activeAccessible = active ? accessible(active) : false

  const lessonQ = useQuery({
    queryKey: ["lesson", activeId],
    queryFn: () => learning.lesson(activeId!),
    enabled: !!activeId && activeAccessible,
  })
  const lessonFull = lessonQ.data ?? null
  const video = resolveVideo(lessonFull?.video_url ?? null)

  if (!authChecked) return null

  if (courseQ.isLoading || meQ.isLoading) {
    return (
      <div style={{ padding: 48, color: "var(--ink-2)" }}>Đang tải khóa học…</div>
    )
  }
  if (!course) {
    return (
      <div style={{ padding: 48, color: "var(--ink-2)" }}>
        Không tìm thấy khóa học.{" "}
        <Link href="/khoa-hoc" style={{ color: "var(--primary)" }}>
          Quay lại
        </Link>
      </div>
    )
  }

  const total = flat.length
  const doneCount = flat.filter((l) => completed.has(l.id)).length
  const pct = total ? Math.round((doneCount / total) * 100) : 0
  const isDone = active ? completed.has(active.id) : false

  const idx = active ? flat.findIndex((l) => l.id === active.id) : -1
  const nextLesson = idx >= 0 ? flat[idx + 1] : undefined

  async function markComplete() {
    if (!active || !studentId) return
    setMarking(true)
    try {
      await learning.markProgress({
        student_id: studentId,
        lesson_id: active.id,
        mark_completed: true,
      })
      await queryClient.invalidateQueries({
        queryKey: ["progress", studentId, course!.id],
      })
    } finally {
      setMarking(false)
    }
  }

  function goNext() {
    if (nextLesson && accessible(nextLesson)) setActiveId(nextLesson.id)
  }

  return (
    <>
      <header className="lp-topbar">
        <div className="lp-brand">
          <Link href={`/course/${course.slug}`} className="lp-back" aria-label="Quay lại">
            <span className="ms">arrow_back</span>
          </Link>
          <BrandLogo />
          <h2>{course.name}</h2>
        </div>
        <div className="lp-progress">
          <div className="row">
            <span>Tiến độ khóa học</span>
            <span>{pct}% hoàn thành</span>
          </div>
          <div className="bar">
            <div style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="lp-nav-right">
          <Link href="/khoa-hoc" className="btn btn-secondary btn-sm">
            Khóa học
          </Link>
          <div className="lp-avatar" role="img" aria-label="Avatar" />
        </div>
      </header>

      <div className="lp-main">
        {/* Stage */}
        <section className="lp-stage">
          <div className="lp-stage-inner">
            <div className="lp-player">
              {!activeAccessible ? (
                <div className="lp-locked">
                  <span className="ms">lock</span>
                  <h3>Bài học bị khóa</h3>
                  <p>
                    Đăng ký khóa học để mở toàn bộ bài học và theo dõi tiến độ
                    của bạn.
                  </p>
                  <Link href={`/checkout?course=${course.slug}`} className="btn btn-primary">
                    <span className="ms">lock_open</span>
                    <span>Đăng ký để mở khóa</span>
                  </Link>
                </div>
              ) : video ? (
                video.kind === "iframe" ? (
                  <iframe
                    src={video.src}
                    title={active?.title}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video src={video.src} controls />
                )
              ) : (
                <div className="lp-player-empty">
                  <div className="play-btn">
                    <span className="ms fill">play_arrow</span>
                  </div>
                  <div className="hint">
                    {lessonQ.isLoading
                      ? "Đang tải bài học…"
                      : "Video bài học sẽ hiển thị ở đây."}
                  </div>
                </div>
              )}
            </div>

            {active && (
              <>
                <div className="lp-head">
                  <div>
                    <h1>{active.title}</h1>
                    <div className="lp-meta">
                      {active.duration_minutes != null && (
                        <span>
                          <span className="ms">schedule</span>
                          {humanDuration(active.duration_minutes)}
                        </span>
                      )}
                      {active.sectionTitle && (
                        <span>
                          <span className="ms">folder</span>
                          {active.sectionTitle}
                        </span>
                      )}
                      {active.is_preview && !enrolled && (
                        <span style={{ color: "var(--done)" }}>
                          <span className="ms">lock_open</span>Học thử
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="lp-actions">
                    {activeAccessible && (
                      <button
                        className={`btn ${isDone ? "btn-secondary" : "btn-primary"}`}
                        onClick={markComplete}
                        disabled={marking || isDone}
                      >
                        <span className="ms">{isDone ? "check_circle" : "check"}</span>
                        <span>{isDone ? "Đã hoàn thành" : "Đánh dấu hoàn thành"}</span>
                      </button>
                    )}
                    {nextLesson && accessible(nextLesson) && (
                      <button className="btn btn-secondary" onClick={goNext}>
                        <span>Bài tiếp theo</span>
                        <span className="ms">arrow_forward</span>
                      </button>
                    )}
                  </div>
                </div>

                {activeAccessible ? (
                  lessonFull?.content ? (
                    <div
                      className="lp-desc"
                      dangerouslySetInnerHTML={{ __html: lessonFull.content }}
                    />
                  ) : (
                    <p className="lp-empty-note">
                      Bài học này chưa có mô tả chi tiết.
                    </p>
                  )
                ) : (
                  <p className="lp-empty-note">
                    Nội dung bài học sẽ mở sau khi bạn đăng ký khóa học.
                  </p>
                )}
              </>
            )}
          </div>
        </section>

        {/* TOC */}
        <aside className="lp-toc">
          <div className="lp-toc-head">
            <h3>Nội dung khóa học</h3>
            <span className="tally">
              {doneCount}/{total} bài
            </span>
          </div>
          <div className="lp-toc-list">
            {course.sections.map((s, si) => (
              <div key={s.id}>
                <div className="lp-mod-head">
                  <div className="info">
                    <span className="lbl">Chương {si + 1}</span>
                    <span className="ttl">{s.title}</span>
                  </div>
                  <span className="ms">expand_more</span>
                </div>
                {s.lessons.map((l) => {
                  const acc = accessible(l)
                  const done = completed.has(l.id)
                  const isActive = l.id === activeId
                  return (
                    <button
                      key={l.id}
                      className={`lp-lesson ${isActive ? "active" : ""} ${done ? "done" : ""} ${acc ? "" : "locked"}`}
                      onClick={() => setActiveId(l.id)}
                    >
                      <div className="ico">
                        <span className="ms">
                          {done
                            ? "check"
                            : !acc
                              ? "lock"
                              : isActive
                                ? "play_arrow"
                                : "play_circle"}
                        </span>
                      </div>
                      <div className="text">
                        <div className="t">{l.title}</div>
                        <div className="s">
                          {l.duration_minutes != null
                            ? humanDuration(l.duration_minutes)
                            : "Bài học"}
                          {l.is_preview && !enrolled ? " · Học thử" : ""}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </>
  )
}
