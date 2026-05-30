"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import "../_components/listing.css"
import { fetchPublishedCourses } from "@/lib/courses"
import { fetchCourseCategories } from "@/lib/content"
import { CourseCard } from "../_components/course-card"

export default function CourseCatalogPage() {
  const [activeCat, setActiveCat] = useState<string>("__all__")
  const [query, setQuery] = useState("")

  const coursesQ = useQuery({
    queryKey: ["catalog-courses"],
    queryFn: () => fetchPublishedCourses(200),
  })
  const catsQ = useQuery({
    queryKey: ["course-categories"],
    queryFn: fetchCourseCategories,
  })

  const courses = coursesQ.data ?? []
  const categories = catsQ.data ?? []

  const countByCat = useMemo(() => {
    const m = new Map<string, number>()
    for (const c of courses) {
      for (const cat of c.categories) {
        m.set(cat.slug, (m.get(cat.slug) ?? 0) + 1)
      }
    }
    return m
  }, [courses])

  const filtered = useMemo(() => {
    let list = courses
    if (activeCat !== "__all__") {
      list = list.filter((c) => c.categories.some((k) => k.slug === activeCat))
    }
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.description ?? "").toLowerCase().includes(q),
      )
    }
    return list
  }, [courses, activeCat, query])

  return (
    <>
      <section className="page-head">
        <div className="title-block">
          <div className="kicker">Khóa học</div>
          <h1>Tất cả khóa học cho chủ quán &amp; barista.</h1>
          <p>
            Chọn lộ trình theo nhu cầu của bạn — từ pha chế, vận hành, tài chính
            đến marketing. Học theo nhịp của bạn, áp dụng được ngay.
          </p>
        </div>
        <label className="search">
          <span className="ms">search</span>
          <input
            type="text"
            placeholder="Tìm khóa học…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </section>

      <div className="cats-wrap">
        <nav className="cats" aria-label="Danh mục khóa học">
          <a
            className={activeCat === "__all__" ? "active" : ""}
            onClick={() => setActiveCat("__all__")}
          >
            Tất cả <span className="count">{courses.length}</span>
          </a>
          {categories.map((cat) => (
            <a
              key={cat.id}
              className={activeCat === cat.slug ? "active" : ""}
              onClick={() => setActiveCat(cat.slug)}
            >
              {cat.name} <span className="count">{countByCat.get(cat.slug) ?? 0}</span>
            </a>
          ))}
        </nav>
      </div>

      <section className="section" style={{ paddingTop: 32 }}>
        {coursesQ.isLoading ? (
          <p style={{ color: "var(--ink-2)" }}>Đang tải khóa học…</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: "var(--ink-2)" }}>
            Không có khóa học nào trong mục này.
          </p>
        ) : (
          <div className="course-grid">
            {filtered.map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
