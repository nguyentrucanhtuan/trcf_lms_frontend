import Link from "next/link"
import { formatVnd, type CoursePublic } from "@/lib/courses"

export function CourseCard({
  course,
  index,
}: {
  course: CoursePublic
  index: number
}) {
  const thumb = `c${(index % 6) + 1}`
  const hasSale = course.sale_price != null && course.sale_price < course.price
  const payable = hasSale ? course.sale_price! : course.price
  const isFree = payable === 0
  const savePct = hasSale
    ? Math.round((1 - course.sale_price! / course.price) * 100)
    : 0
  const category = course.categories[0]?.name

  return (
    <Link href={`/course/${course.slug}`} className="course-card">
      <div className={`course-thumb ${thumb}`}>
        {isFree ? (
          <span className="pill free">Miễn phí</span>
        ) : hasSale ? (
          <span className="pill hot">Ưu đãi</span>
        ) : (
          <span className="pill">Khóa học</span>
        )}
      </div>
      <div className="course-body">
        {category && <div className="label">{category}</div>}
        <h4>{course.name}</h4>
        {course.description && <div className="desc">{course.description}</div>}
        <div className="course-price-row">
          {isFree ? (
            <span className="free-tag">Miễn phí</span>
          ) : (
            <div>
              <span className="price-amt">
                {formatVnd(payable)}
                <span className="ccy">₫</span>
              </span>
              {hasSale && (
                <span className="price-old">{formatVnd(course.price)}₫</span>
              )}
            </div>
          )}
          {hasSale ? (
            <span className="price-save">Giảm {savePct}%</span>
          ) : (
            <span className="price-note">Truy cập trọn đời</span>
          )}
        </div>
      </div>
    </Link>
  )
}
