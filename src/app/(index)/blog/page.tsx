"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import "../_components/listing.css"
import "./blog.css"
import {
  fetchArchiveCategories,
  fetchPublishedArchives,
  formatDate,
  formatDateShort,
  formatViews,
  readingMinutes,
  type ArchivePublic,
  type Category,
} from "@/lib/content"

function gClass(i: number) {
  return `g${(i % 6) + 1}`
}

export default function BlogIndexPage() {
  const [activeCat, setActiveCat] = useState<string>("__all__")
  const [query, setQuery] = useState("")

  const archivesQ = useQuery({
    queryKey: ["blog-archives"],
    queryFn: () => fetchPublishedArchives(100),
  })
  const catsQ = useQuery({
    queryKey: ["archive-categories"],
    queryFn: fetchArchiveCategories,
  })

  const archives = archivesQ.data ?? []
  const categories = catsQ.data ?? []

  const catById = useMemo(() => {
    const m = new Map<number, Category>()
    for (const c of categories) m.set(c.id, c)
    return m
  }, [categories])

  const countByCat = useMemo(() => {
    const m = new Map<number, number>()
    for (const a of archives) {
      if (a.archive_category_id != null)
        m.set(a.archive_category_id, (m.get(a.archive_category_id) ?? 0) + 1)
    }
    return m
  }, [archives])

  const filtered = useMemo(() => {
    let list = archives
    if (activeCat !== "__all__") {
      const cat = categories.find((c) => c.slug === activeCat)
      list = cat ? list.filter((a) => a.archive_category_id === cat.id) : list
    }
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.excerpt ?? "").toLowerCase().includes(q),
      )
    }
    return list
  }, [archives, categories, activeCat, query])

  const trending = useMemo(
    () => [...archives].sort((a, b) => b.view_count - a.view_count).slice(0, 5),
    [archives],
  )

  const catName = (a: ArchivePublic) =>
    (a.archive_category_id != null && catById.get(a.archive_category_id)?.name) || "Bài viết"

  const [featured, ...rest] = filtered
  const stack = rest.slice(0, 2)
  const grid = rest.slice(2)

  return (
    <>
      <section className="page-head">
        <div className="title-block">
          <div className="kicker">Cẩm nang vận hành</div>
          <h1>Bài viết &amp; góc nhìn cho chủ quán cà phê.</h1>
          <p>
            Phân tích thực tế, case study, mẹo vận hành — viết bởi đội ngũ
            CoffeeTree. Đọc miễn phí, áp dụng được ngay.
          </p>
        </div>
        <label className="search">
          <span className="ms">search</span>
          <input
            type="text"
            placeholder="Tìm bài viết, chủ đề…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </section>

      <div className="cats-wrap">
        <nav className="cats" aria-label="Danh mục nội dung">
          <a
            className={activeCat === "__all__" ? "active" : ""}
            onClick={() => setActiveCat("__all__")}
          >
            Tất cả <span className="count">{archives.length}</span>
          </a>
          {categories.map((cat) => (
            <a
              key={cat.id}
              className={activeCat === cat.slug ? "active" : ""}
              onClick={() => setActiveCat(cat.slug)}
            >
              {cat.name} <span className="count">{countByCat.get(cat.id) ?? 0}</span>
            </a>
          ))}
        </nav>
      </div>

      {archivesQ.isLoading ? (
        <div className="main-wrap">
          <p style={{ color: "var(--ink-2)" }}>Đang tải bài viết…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="main-wrap">
          <p style={{ color: "var(--ink-2)" }}>Chưa có bài viết nào.</p>
        </div>
      ) : (
        <>
          {/* Featured */}
          <section className="featured">
            {featured && (
              <Link className={`hero-card ${gClass(0)}`} href={`/blog/${featured.slug}`}>
                <span className="topic-pill">{catName(featured)}</span>
                <div className="body">
                  <div className="topic">
                    {catName(featured)} · {readingMinutes(featured.content)} phút đọc
                  </div>
                  <h2>{featured.title}</h2>
                  {featured.excerpt && <p>{featured.excerpt}</p>}
                  <div className="meta">
                    <div className="av" />
                    <span>CoffeeTree</span>
                    <span className="dot" />
                    <span>{formatDate(featured.published_at)}</span>
                    <span className="dot" />
                    <span>{formatViews(featured.view_count)} lượt xem</span>
                  </div>
                </div>
              </Link>
            )}
            <div className="hero-stack">
              {stack.map((a, i) => (
                <Link key={a.id} className={`stack-card`} href={`/blog/${a.slug}`}>
                  <div className={`thumb ${gClass(i + 1)}`} />
                  <div className="body">
                    <div className="topic-text">{catName(a)}</div>
                    <h3>{a.title}</h3>
                    <div className="foot">
                      <span>
                        <span className="ms">schedule</span>
                        {readingMinutes(a.content)} phút
                      </span>
                      <span>
                        <span className="ms">calendar_today</span>
                        {formatDateShort(a.published_at)}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Main */}
          <div className="main-wrap">
            <section>
              <div className="blog-section-head">
                <h2>
                  <span className="ms">bolt</span>Bài viết mới nhất
                </h2>
              </div>
              <div className="articles-grid">
                {grid.map((a, i) => (
                  <Link key={a.id} className="art-card" href={`/blog/${a.slug}`}>
                    <div className={`thumb ${gClass(i + 3)}`}>
                      <span className="topic">{catName(a)}</span>
                    </div>
                    <div className="body">
                      <div className="topic-text">
                        {catName(a)} · {readingMinutes(a.content)} phút đọc
                      </div>
                      <h4>{a.title}</h4>
                      {a.excerpt && <p>{a.excerpt}</p>}
                      <div className="foot">
                        <div className="av" />
                        <span className="name">CoffeeTree</span>
                        <span className="dot" />
                        <span>{formatDateShort(a.published_at)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <aside className="side">
              <div className="side-card">
                <div className="head">
                  <h4>
                    <span className="ms">trending_up</span>Trending tuần này
                  </h4>
                </div>
                {trending.map((a, i) => (
                  <Link
                    key={a.id}
                    href={`/blog/${a.slug}`}
                    className={`trend-item ${i < 3 ? "top" : ""}`}
                  >
                    <div className="rank">{String(i + 1).padStart(2, "0")}</div>
                    <div className="info">
                      <div className="label">{catName(a)}</div>
                      <div className="t">{a.title}</div>
                      <div className="s">
                        {formatViews(a.view_count)} lượt xem ·{" "}
                        {readingMinutes(a.content)} phút
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="newsletter">
                <div className="ico">
                  <span className="ms">mail</span>
                </div>
                <h4>Tin tức tuần</h4>
                <p>
                  1 bài viết, 1 mẹo vận hành mỗi tuần. Không spam, không bán
                  hàng.
                </p>
                <form onSubmit={(e) => e.preventDefault()}>
                  <input type="email" placeholder="ban@email.com" />
                  <button type="submit">Đăng ký</button>
                </form>
              </div>

              <div className="side-card tags-card">
                <h4>
                  <span className="ms">tag</span>Chủ đề phổ biến
                </h4>
                <div className="tags-list">
                  {categories.map((c) => (
                    <a key={c.id} onClick={() => setActiveCat(c.slug)}>
                      #{c.slug}
                    </a>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
    </>
  )
}
