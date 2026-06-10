"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"

import { getStoredUser } from "@/lib/auth"
import { fetchCourseById, type CourseDetail } from "@/lib/courses"
import { learning, type EnrollmentRow } from "@/lib/learning"

type MyCourse = { enrollment: EnrollmentRow; course: CourseDetail }

export default function MyCoursesPage() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)

  // Gate: must be logged in — otherwise bounce to student login.
  useEffect(() => {
    const u = getStoredUser()
    if (!u) {
      router.replace(
        `/dang-nhap?next=${encodeURIComponent("/khoa-hoc-cua-toi")}`,
      )
      return
    }
    setAuthChecked(true)
  }, [router])

  const q = useQuery({
    queryKey: ["my-courses"],
    enabled: authChecked,
    queryFn: async (): Promise<MyCourse[]> => {
      const page = await learning.myEnrollments()
      const rows = page.items.filter((e) => e.status !== "cancelled")
      const resolved = await Promise.all(
        rows.map(async (e) => {
          const course = await fetchCourseById(e.course_id)
          return course ? { enrollment: e, course } : null
        }),
      )
      return resolved.filter((x): x is MyCourse => x !== null)
    },
  })

  return (
    <section className="section">
      <div className="section-head">
        <div className="left">
          <div className="kicker">Khu vực học tập</div>
          <h2>Khóa học của tôi</h2>
          <p>Các khóa bạn đã ghi danh. Nhấn vào một khóa để tiếp tục học.</p>
        </div>
        <Link href="/khoa-hoc" className="see-all">
          Khám phá thêm khóa học
          <span className="ms sm">arrow_forward</span>
        </Link>
      </div>

      {!authChecked || q.isLoading ? (
        <p style={{ color: "var(--ink-2)" }}>Đang tải…</p>
      ) : q.isError ? (
        <p style={{ color: "var(--ink-2)" }}>
          Không tải được danh sách khóa học. Vui lòng tải lại trang.
        </p>
      ) : !q.data || q.data.length === 0 ? (
        <div style={{ color: "var(--ink-2)" }}>
          <p>Bạn chưa ghi danh khóa học nào.</p>
          <Link
            href="/khoa-hoc"
            className="btn btn-primary btn-sm"
            style={{ marginTop: 12, display: "inline-flex" }}
          >
            Xem các khóa học
          </Link>
        </div>
      ) : (
        <div className="course-grid">
          {q.data.map(({ course }, i) => (
            <Link
              key={course.id}
              href={`/hoc/${course.slug}`}
              className="course-card"
            >
              <div className={`course-thumb c${(i % 6) + 1}`}>
                <span className="pill">Đã ghi danh</span>
              </div>
              <div className="course-body">
                {course.categories[0]?.name && (
                  <div className="label">{course.categories[0].name}</div>
                )}
                <h4>{course.name}</h4>
                {course.description && (
                  <div className="desc">{course.description}</div>
                )}
                <div className="course-price-row">
                  <span className="price-note">Vào học</span>
                  <span className="ms sm">arrow_forward</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
