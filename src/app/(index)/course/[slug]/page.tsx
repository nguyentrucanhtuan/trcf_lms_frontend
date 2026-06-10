import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import "../course.css"
import {
  countLessons,
  fetchCourseBySlug,
  formatVnd,
  humanDuration,
  parseCourseContent,
  totalMinutes,
} from "@/lib/courses"
import { CourseCta, CurriculumModule, FaqItem } from "./_parts"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const course = await fetchCourseBySlug(slug)
  if (!course) return { title: "Không tìm thấy khóa học — CoffeeTree" }
  return {
    title: `${course.name} — CoffeeTree`,
    description: course.description ?? undefined,
  }
}

function avgRating(
  reviews: { rating: number }[] | undefined,
): string | null {
  if (!reviews || reviews.length === 0) return null
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  return avg.toFixed(1)
}

export default async function CourseLandingPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const course = await fetchCourseBySlug(slug)
  if (!course) notFound()

  const c = parseCourseContent(course.content)
  const lessons = countLessons(course)
  const minutes = totalMinutes(course)
  const rating = avgRating(c.reviews)
  const hasSale = course.sale_price != null && course.sale_price < course.price
  const payable = hasSale ? course.sale_price! : course.price

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="c-hero">
        <div>
          {c.eyebrow && (
            <span className="eyebrow">
              <span className="dot" />
              {c.eyebrow}
            </span>
          )}
          <h1>{course.name}</h1>
          {course.description && <p className="lead">{course.description}</p>}
          <div className="hero-meta">
            <div className="item">
              <span className="ms sm">schedule</span>
              <strong>{humanDuration(minutes)}</strong>
            </div>
            <div className="item">
              <span className="ms sm">play_circle</span>
              <strong>{lessons} bài học</strong>
            </div>
            {c.level && (
              <div className="item">
                <span className="ms sm">signal_cellular_alt</span>
                <strong>{c.level}</strong>
              </div>
            )}
            {rating && (
              <div className="item">
                <span className="ms sm">star</span>
                <strong>{rating}</strong> / 5.0
              </div>
            )}
          </div>
          <div className="hero-cta">
            <CourseCta
              slug={course.slug}
              courseId={course.id}
              enrollLabel="Đăng ký khóa học"
            />
            <Link href="#curriculum" className="ghost">
              <span className="play">
                <span className="ms fill">play_arrow</span>
              </span>
              <span>
                Xem nội dung
                {c.promo_duration ? ` (${c.promo_duration})` : ""}
              </span>
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-main">
            <div className="visual-tag">[ {course.course_code} ]</div>
            <div className="visual-caption">
              <div className="title">{course.name}</div>
              {course.categories[0] && (
                <div className="sub">{course.categories[0].name}</div>
              )}
            </div>
          </div>
          <div className="float-card tl">
            <div className="icn">
              <span className="ms">play_circle</span>
            </div>
            <div className="info">
              <div className="v">{lessons}</div>
              <div className="l">Bài học</div>
            </div>
          </div>
          <div className="float-card br">
            <div className="icn">
              <span className="ms">workspace_premium</span>
            </div>
            <div className="info">
              <div className="v">Chứng chỉ</div>
              <div className="l">Khi hoàn thành</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ STATS ============ */}
      {c.stats && c.stats.length > 0 && (
        <section className="stats">
          <div className="stats-inner">
            {c.stats.map((s) => (
              <div className="stat" key={s.label}>
                <div className="num">{s.num}</div>
                <div className="lbl">{s.label}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ============ OUTCOMES ============ */}
      {c.outcomes && c.outcomes.length > 0 && (
        <section className="c-section" id="learn">
          <div className="c-section-head">
            <div className="kicker">Bạn sẽ học được</div>
            <h2>Từ nền tảng đến thành thạo, theo từng kỹ năng.</h2>
            <p>
              Mỗi kỹ năng kèm bài tập áp dụng ngay để bạn luyện đến khi thuần
              thục.
            </p>
          </div>
          <div className="features">
            {c.outcomes.map((o) => (
              <div className="feature" key={o.title}>
                <div className="icn">
                  <span className="ms">{o.icon}</span>
                </div>
                <h3>{o.title}</h3>
                <p>{o.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ============ REQUIREMENTS / AUDIENCE ============ */}
      {((c.requirements && c.requirements.length > 0) ||
        (c.audiences && c.audiences.length > 0)) && (
        <section className="c-section" style={{ paddingTop: 0 }}>
          <div className="list-cols">
            {c.requirements && c.requirements.length > 0 && (
              <div className="list-card">
                <h3>Yêu cầu</h3>
                <ul>
                  {c.requirements.map((r, i) => (
                    <li key={i}>
                      <span className="ms">check_circle</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {c.audiences && c.audiences.length > 0 && (
              <div className="list-card">
                <h3>Khóa học dành cho ai?</h3>
                <ul>
                  {c.audiences.map((a, i) => (
                    <li key={i}>
                      <span className="ms">person</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ============ CURRICULUM ============ */}
      {course.sections.length > 0 && (
        <section
          className="c-section"
          id="curriculum"
          style={{ background: "var(--surface)" }}
        >
          <div className="c-section-head">
            <div className="kicker">Chương trình học</div>
            <h2>
              {course.sections.length} chương · {lessons} bài học ·{" "}
              {humanDuration(minutes)}
            </h2>
            <p>
              Nhấp vào từng chương để xem các bài học bên trong. Các bài “Học
              thử” mở miễn phí trước khi đăng ký.
            </p>
          </div>
          <div className="curriculum">
            {course.sections.map((section, i) => (
              <CurriculumModule
                key={section.id}
                section={section}
                index={i}
                defaultOpen={i === 0}
              />
            ))}
          </div>
        </section>
      )}

      {/* ============ INSTRUCTOR ============ */}
      {c.instructor && (
        <section className="c-section" id="instructor">
          <div className="instructor-block">
            <div className="instructor-photo">
              <div className="placeholder">[ Ảnh giảng viên ]</div>
            </div>
            <div className="instructor-text">
              <div className="kicker">Giảng viên</div>
              <h2>{c.instructor.name}</h2>
              {c.instructor.role && (
                <div className="role">{c.instructor.role}</div>
              )}
              {c.instructor.bio?.map((p, i) => <p key={i}>{p}</p>)}
              {c.instructor.creds && c.instructor.creds.length > 0 && (
                <div className="instructor-creds">
                  {c.instructor.creds.map((cred, i) => (
                    <div className="cred" key={i}>
                      <span className="ms">{cred.icon}</span>
                      <span>{cred.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ============ REVIEWS ============ */}
      {c.reviews && c.reviews.length > 0 && (
        <section
          className="c-section"
          id="reviews"
          style={{ background: "var(--surface)" }}
        >
          <div className="c-section-head">
            <div className="kicker">Học viên nói gì</div>
            <h2>Đánh giá từ người đã học.</h2>
          </div>
          <div className="reviews">
            {c.reviews.map((r, i) => (
              <div className="review" key={i}>
                <div className="stars">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <span
                      key={j}
                      className={`ms ${j < r.rating ? "fill" : ""}`}
                    >
                      star
                    </span>
                  ))}
                </div>
                <p>{r.text}</p>
                <div className="who">
                  <div className="av" />
                  <div className="info">
                    <div className="n">{r.name}</div>
                    {r.role && <div className="r">{r.role}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ============ PRICING ============ */}
      <section className="c-section" id="pricing">
        <div className="pricing-wrap">
          <div>
            <div className="kicker">Đăng ký khóa học</div>
            <h2>Bắt đầu học ngay hôm nay.</h2>
            <p>
              Truy cập trọn đời, học theo nhịp của bạn, kèm cộng đồng riêng và
              các buổi Q&amp;A trực tiếp hàng tháng cùng giảng viên.
            </p>
          </div>
          <div className="price-card">
            {hasSale && <div className="badge">Ưu đãi có hạn</div>}
            <div className="price">
              <span className="amt">{formatVnd(payable)}</span>
              <span className="ccy">₫</span>
              {hasSale && (
                <span className="strike">{formatVnd(course.price)}₫</span>
              )}
            </div>
            <div className="note">
              {payable === 0 ? "Miễn phí · cần đăng ký" : "Thanh toán một lần · truy cập trọn đời"}
            </div>
            <CourseCta
              slug={course.slug}
              courseId={course.id}
              enrollLabel="Đăng ký ngay"
            />
            {c.includes && c.includes.length > 0 && (
              <ul>
                {c.includes.map((item, i) => (
                  <li key={i}>
                    <span className="ms fill">check_circle</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      {c.faqs && c.faqs.length > 0 && (
        <section className="c-section" id="faq" style={{ paddingTop: 32 }}>
          <div className="c-section-head">
            <div className="kicker">Câu hỏi thường gặp</div>
            <h2>Bạn đang phân vân điều gì?</h2>
          </div>
          <div className="faq-list">
            {c.faqs.map((faq, i) => (
              <FaqItem key={i} faq={faq} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
