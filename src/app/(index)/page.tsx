"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { fetchPublishedCourses } from "@/lib/courses"
import { CourseCard } from "./_components/course-card"

type Article = {
  thumb: string
  topic: string
  meta: string
  title: string
  desc: string
  author: string
  date: string
  featured?: boolean
}

const ARTICLES: Article[] = [
  {
    thumb: "a1",
    topic: "Case study",
    meta: "Vận hành · 12 phút đọc",
    title: "Mở quán thứ hai sau 18 tháng: bài học từ Cà phê Sương Mai",
    desc: "Khi nào nên mở chi nhánh thứ hai, làm sao để chi nhánh mới không kéo lùi chi nhánh đầu tiên, và những con số bạn cần đọc được trước khi ký mặt bằng tiếp theo. Chúng tôi ngồi xuống với founder Cà phê Sương Mai để bóc tách 18 tháng từ quán 1 đến quán 2.",
    author: "Trần Minh Hoàng",
    date: "20 / 05 / 2026",
    featured: true,
  },
  {
    thumb: "a2",
    topic: "Tài chính",
    meta: "Tài chính · 8 phút đọc",
    title: "Quán bạn đang lỗ ở đâu? Đọc P&L trong 5 phút",
    desc: "Khung 5 dòng đơn giản để biết tháng vừa rồi quán bạn lời hay lỗ — không cần kế toán.",
    author: "Phạm Thu Hương",
    date: "18 / 05",
  },
  {
    thumb: "a3",
    topic: "Nhân sự",
    meta: "Nhân sự · 6 phút đọc",
    title: "4 lý do khiến barista nghỉ trong 90 ngày đầu",
    desc: "Onboarding không rõ ràng, ca làm kiệt sức, không có lộ trình lên — và cách khắc phục.",
    author: "Nguyễn Anh Tuấn",
    date: "14 / 05",
  },
  {
    thumb: "a4",
    topic: "Menu",
    meta: "Sản phẩm · 9 phút đọc",
    title: "Định lượng menu mùa hè: 12 món bán chạy theo nhiệt độ",
    desc: "Khi trời nóng, hành vi gọi món đổi rất nhanh. Đây là cách 3 quán đã điều chỉnh menu trong 2 tuần.",
    author: "Lê Quang Vinh",
    date: "10 / 05",
  },
  {
    thumb: "a2",
    topic: "Marketing",
    meta: "Marketing · 7 phút đọc",
    title: "Quán nhỏ, social nhỏ: lịch nội dung 1 tuần cho 1 người",
    desc: "Bạn không có team. Đây là lịch 7 ngày, mỗi ngày 1 bài, ai cũng làm được.",
    author: "Đỗ Khánh Linh",
    date: "06 / 05",
  },
]

function CourseGrid() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["public-courses"],
    queryFn: () => fetchPublishedCourses(12),
  })

  if (isLoading) {
    return (
      <div className="course-grid">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="course-card" style={{ opacity: 0.5 }}>
            <div className="course-thumb c1" />
            <div className="course-body">
              <h4>Đang tải…</h4>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isError || !data || data.length === 0) {
    return (
      <p style={{ color: "var(--ink-2)" }}>
        Chưa có khóa học nào được xuất bản.
      </p>
    )
  }

  return (
    <div className="course-grid">
      {data.map((course, i) => (
        <CourseCard key={course.id} course={course} index={i} />
      ))}
    </div>
  )
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href="/blog"
      className={`article-card ${article.featured ? "featured" : ""}`}
    >
      <div className={`article-thumb ${article.thumb}`}>
        <span className="topic">{article.topic}</span>
      </div>
      <div className="article-body">
        <div className="topic-text">{article.meta}</div>
        <h3>{article.title}</h3>
        <p className="desc">{article.desc}</p>
        <div className="article-foot">
          <div className="av" />
          <span className="name">{article.author}</span>
          <span className="dot" />
          <span>{article.date}</span>
        </div>
      </div>
    </Link>
  )
}

export default function HomePage() {
  const [query, setQuery] = useState("")

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="hero">
        <span className="eyebrow">
          <span className="dot" />
          Học viện vận hành F&amp;B đầu tiên tại Việt Nam
        </span>
        <h1>
          Học cách vận hành quán cà phê <span className="accent">có lãi.</span>
        </h1>
        <p className="lead">
          Hệ thống khóa học &amp; bài viết dành riêng cho chủ quán Việt Nam — từ
          chọn mặt bằng, đào tạo barista, đến tài chính và mở rộng chi nhánh. Áp
          dụng được ngay.
        </p>

        <form
          className="hero-search"
          onSubmit={(e) => e.preventDefault()}
        >
          <span className="ms">search</span>
          <input
            type="text"
            placeholder="Tìm khóa học, bài viết, chủ đề…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Tìm kiếm
          </button>
        </form>

        <div className="hero-tags">
          <span>Phổ biến:</span>
          <Link href="/#courses">Tài chính quán</Link>
          <Link href="/#courses">Tuyển barista</Link>
          <Link href="/#courses">Menu &amp; định lượng</Link>
          <Link href="/#courses">Marketing</Link>
        </div>
      </section>

      {/* ============ LOGO STRIP ============ */}
      <div className="strip">
        <span className="lbl">Được tin dùng bởi</span>
        <span className="logo">Cà phê Sương Mai</span>
        <span className="logo serif">The Slow Bar</span>
        <span className="logo">Tiệm cà phê Nhỏ</span>
        <span className="logo serif">Hạt &amp; Đất</span>
        <span className="logo">Specialty Lab</span>
        <span className="logo serif">Mùa Cũ</span>
      </div>

      {/* ============ COURSES ============ */}
      <section className="section" id="courses">
        <div className="section-head">
          <div className="left">
            <div className="kicker">Khóa học nổi bật</div>
            <h2>Học từ những người đã làm thật.</h2>
            <p>
              Các khóa học được thiết kế cho người sắp mở quán, chủ quán đang
              vận hành và barista muốn nâng tay nghề.
            </p>
          </div>
          <Link href="/khoa-hoc" className="see-all">
            Xem tất cả khóa học
            <span className="ms sm">arrow_forward</span>
          </Link>
        </div>

        <CourseGrid />
      </section>

      {/* ============ ARTICLES ============ */}
      <section className="articles-section">
        <div
          className="section"
          id="articles"
          style={{ paddingTop: 72, paddingBottom: 72 }}
        >
          <div className="section-head">
            <div className="left">
              <div className="kicker">Tạp chí CoffeeTree</div>
              <h2>Bài viết &amp; góc nhìn từ ngành.</h2>
              <p>
                Phân tích thực tế, case study, mẹo vận hành viết bởi chủ quán
                đang làm thật ngoài kia.
              </p>
            </div>
            <Link href="/blog" className="see-all">
              Xem tất cả bài viết
              <span className="ms sm">arrow_forward</span>
            </Link>
          </div>

          <div className="article-grid">
            {ARTICLES.map((article) => (
              <ArticleCard key={article.title} article={article} />
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA BAND ============ */}
      <div className="cta-band-wrap">
        <div className="cta-band">
          <div>
            <h2>Bắt đầu mở quán có hệ thống, ngay tuần này.</h2>
            <p>
              Tạo tài khoản miễn phí — bạn được xem 4 bài học đầu tiên của khóa
              Vận hành quán cà phê và đọc toàn bộ thư viện bài viết.
            </p>
          </div>
          <div className="actions">
            <Link href="/dang-ky" className="btn btn-primary">
              <span>Đăng ký miễn phí</span>
              <span className="ms">arrow_forward</span>
            </Link>
            <Link href="/#courses" className="btn btn-ghost">
              <span className="ms">menu_book</span>
              <span>Xem khóa học</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
