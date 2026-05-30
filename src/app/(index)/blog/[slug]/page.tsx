import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import "../blog.css"
import "./article.css"
import {
  fetchArchiveBySlug,
  fetchArchiveCategories,
  fetchPublishedArchives,
  formatDate,
  formatViews,
  readingMinutes,
  type ArchivePublic,
  type Category,
} from "@/lib/content"
import { ReadProgress } from "./_progress"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const a = await fetchArchiveBySlug(slug)
  if (!a) return { title: "Không tìm thấy bài viết — CoffeeTree" }
  return { title: `${a.title} — CoffeeTree`, description: a.excerpt ?? undefined }
}

function gThumb(i: number) {
  return `g${(i % 6) + 1}`
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [article, categories, all] = await Promise.all([
    fetchArchiveBySlug(slug),
    fetchArchiveCategories(),
    fetchPublishedArchives(100),
  ])
  if (!article || article.status !== "published") notFound()

  const catMap = new Map<number, Category>(categories.map((c) => [c.id, c]))
  const catName = (a: ArchivePublic) =>
    (a.archive_category_id != null && catMap.get(a.archive_category_id)?.name) ||
    "Bài viết"

  const category = catName(article)
  const minutes = readingMinutes(article.content)

  const popular = [...all]
    .filter((a) => a.id !== article.id)
    .sort((a, b) => b.view_count - a.view_count)
    .slice(0, 3)

  const related = [...all]
    .filter(
      (a) =>
        a.id !== article.id &&
        a.archive_category_id === article.archive_category_id,
    )
    .concat(all.filter((a) => a.archive_category_id !== article.archive_category_id && a.id !== article.id))
    .slice(0, 3)

  return (
    <>
      <ReadProgress />

      <section className="article-head">
        <div className="crumbs">
          <Link href="/">Trang chủ</Link>
          <span className="ms">chevron_right</span>
          <Link href="/blog">Bài viết</Link>
          <span className="ms">chevron_right</span>
          <span className="here">{category}</span>
        </div>
        <span className="topic-pill">{category}</span>
        <h1>{article.title}</h1>
        {article.excerpt && <p className="dek">{article.excerpt}</p>}
        <div className="byline">
          <div className="av" />
          <div className="author">
            <div className="n">Đội ngũ CoffeeTree</div>
            <div className="r">CoffeeTree Academy</div>
          </div>
          <div className="meta">
            <span>
              <span className="ms">calendar_today</span>
              {formatDate(article.published_at)}
            </span>
            <span>
              <span className="ms">schedule</span>
              {minutes} phút đọc
            </span>
            <span>
              <span className="ms">visibility</span>
              {formatViews(article.view_count)} lượt xem
            </span>
          </div>
        </div>
      </section>

      <div className="hero-img">
        <div className={`frame ${gThumb(0)}`} />
      </div>

      <div className="article-layout">
        <article
          className="content"
          dangerouslySetInnerHTML={{ __html: article.content ?? "" }}
        />

        <aside className="side">
          <div className="share-card">
            <h4>Chia sẻ bài viết</h4>
            <div className="share-row">
              <button className="btn-icon" aria-label="Facebook">
                <span className="ms">facebook</span>
              </button>
              <button className="btn-icon" aria-label="Email">
                <span className="ms">mail</span>
              </button>
              <button className="btn-icon" aria-label="Sao chép link">
                <span className="ms">link</span>
              </button>
            </div>
          </div>

          <div className="newsletter">
            <div className="ico">
              <span className="ms">mail</span>
            </div>
            <h4>Tin tức tuần</h4>
            <p>1 bài viết, 1 mẹo vận hành mỗi tuần. Không spam, không bán hàng.</p>
            <form>
              <input type="email" placeholder="ban@email.com" />
              <button type="submit">Đăng ký</button>
            </form>
          </div>

          {popular.length > 0 && (
            <div className="read-card">
              <div className="head">
                <h4>Đọc nhiều tuần này</h4>
              </div>
              {popular.map((a, i) => (
                <Link key={a.id} href={`/blog/${a.slug}`} className="item">
                  <div className={`thumb ${gThumb(i + 1)}`} />
                  <div className="info">
                    <div className="label">{catName(a)}</div>
                    <div className="t">{a.title}</div>
                    <div className="s">
                      {readingMinutes(a.content)} phút ·{" "}
                      {formatViews(a.view_count)} đọc
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <section className="related">
          <div className="head">
            <h2>Bài viết liên quan</h2>
            <Link href="/blog" className="see-all">
              Xem tất cả<span className="ms sm">arrow_forward</span>
            </Link>
          </div>
          <div className="related-grid">
            {related.map((a, i) => (
              <Link key={a.id} href={`/blog/${a.slug}`} className="rel-card">
                <div className={`thumb ${gThumb(i)}`}>
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
                    <span>CoffeeTree</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  )
}
