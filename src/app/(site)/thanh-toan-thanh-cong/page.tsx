"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import "./success.css"
import { BrandLogo } from "../../(index)/_components/brand-logo"
import { orders } from "@/lib/learning"
import {
  countLessons,
  fetchCourseBySlug,
  formatVnd,
  humanDuration,
  totalMinutes,
} from "@/lib/courses"

const METHOD_LABEL: Record<string, string> = {
  vnpay: "VNPay",
  momo: "Ví Momo",
  zalo: "ZaloPay",
  bank: "Chuyển khoản ngân hàng",
}

function SuccessInner() {
  const params = useSearchParams()
  const slug = params.get("course")
  const method = params.get("method") || "vnpay"
  const email = params.get("email") || ""
  const name = params.get("name") || ""

  const orderCode = params.get("order")
  // Generated client-side only to avoid SSR hydration mismatch.
  const [orderId, setOrderId] = useState("")
  const [paidAt, setPaidAt] = useState("")
  useEffect(() => {
    setOrderId(
      orderCode
        ? `#${orderCode.slice(0, 8).toUpperCase()}`
        : `#CT-2026-${Math.floor(10000 + Math.random() * 89999)}`,
    )
    const d = new Date()
    const p = (n: number) => String(n).padStart(2, "0")
    setPaidAt(
      `${p(d.getDate())} / ${p(d.getMonth() + 1)} / ${d.getFullYear()} · ${p(d.getHours())}:${p(d.getMinutes())}`,
    )
  }, [orderCode])

  const { data: course, isLoading } = useQuery({
    queryKey: ["success-course", slug],
    queryFn: () => fetchCourseBySlug(slug!),
    enabled: !!slug,
  })

  // Đơn hàng thật (để hiện đúng số tiền + giảm giá coupon trên biên lai).
  const { data: ord } = useQuery({
    queryKey: ["success-order", orderCode],
    queryFn: () => orders.byCode(orderCode!),
    enabled: !!orderCode,
  })

  if (!slug || (!isLoading && !course)) {
    return (
      <div className="ps-page">
        <div className="success-hero">
          <div className="success-icon">
            <span className="ms fill">check</span>
          </div>
          <h1>Thanh toán thành công.</h1>
          <p>Cảm ơn bạn. Biên lai đã được gửi qua email.</p>
        </div>
        <div style={{ textAlign: "center" }}>
          <Link href="/khoa-hoc" className="btn btn-primary">
            <span className="ms">menu_book</span>
            <span>Xem khóa học</span>
          </Link>
        </div>
      </div>
    )
  }

  const hasSale =
    course && course.sale_price != null && course.sale_price < course.price
  const payable = course ? (hasSale ? course.sale_price! : course.price) : 0
  const isFree = payable === 0
  const lessons = course ? countLessons(course) : 0
  const minutes = course ? totalMinutes(course) : 0
  const category = course?.categories[0]?.name

  return (
    <>
      <header className="ps-topbar">
        <Link href="/" className="brand">
          <BrandLogo />
          <h2>CoffeeTree</h2>
        </Link>
        <Link href="/" className="help-link">
          Về trang chủ
        </Link>
      </header>

      <div className="stepper">
        <div className="step done">
          <div className="num"><span className="ms" style={{ fontSize: 14 }}>check</span></div>
          <div className="lbl">Chọn khóa học</div>
        </div>
        <div className="step-divider done" />
        <div className="step done">
          <div className="num"><span className="ms" style={{ fontSize: 14 }}>check</span></div>
          <div className="lbl">Thanh toán</div>
        </div>
        <div className="step-divider done" />
        <div className="step done">
          <div className="num"><span className="ms" style={{ fontSize: 14 }}>check</span></div>
          <div className="lbl">Hoàn tất</div>
        </div>
      </div>

      <div className="ps-page">
        <section className="success-hero">
          <div className="success-icon">
            <span className="ms fill">check</span>
          </div>
          <h1>Thanh toán thành công.</h1>
          <p>
            Cảm ơn {name ? <strong>{name}</strong> : "bạn"}. Khóa học đã sẵn
            sàng{email ? <> — biên lai đã gửi đến <strong>{email}</strong></> : ""}.
          </p>
          <div className="order-id">
            Mã đơn hàng: <strong>{orderId}</strong>
          </div>
        </section>

        {isLoading || !course ? (
          <p style={{ color: "var(--ink-2)", textAlign: "center" }}>Đang tải…</p>
        ) : (
          <>
            <section className="unlocked">
              <div className="thumb">
                <div className="play">
                  <span className="ms fill">play_arrow</span>
                </div>
              </div>
              <div className="body">
                <span className="kicker">
                  <span className="dot" />
                  Khóa học đã mở
                </span>
                <h2>{course.name}</h2>
                <div className="meta">
                  <span>
                    <span className="ms">play_circle</span>
                    {lessons} bài
                  </span>
                  <span>
                    <span className="ms">schedule</span>
                    {humanDuration(minutes)}
                  </span>
                  <span>
                    <span className="ms">all_inclusive</span>Truy cập trọn đời
                  </span>
                </div>
                <div className="actions">
                  <Link href={`/hoc/${course.slug}`} className="btn btn-primary">
                    <span className="ms">play_arrow</span>
                    <span>Bắt đầu học ngay</span>
                  </Link>
                  <Link href="/khoa-hoc" className="btn btn-ghost">
                    <span className="ms">menu_book</span>
                    <span>Xem khóa học khác</span>
                  </Link>
                </div>
              </div>
            </section>

            <div className="grid-2">
              <div className="ps-panel">
                <h3>Biên lai</h3>
                <div className="receipt-line">
                  <span>Ngày thanh toán</span>
                  <strong>{paidAt}</strong>
                </div>
                <div className="receipt-line">
                  <span>Phương thức</span>
                  <span className="pay-method-tag">
                    <span className="dot" />
                    {METHOD_LABEL[method] ?? method}
                  </span>
                </div>
                {email && (
                  <div className="receipt-line">
                    <span>Email nhận biên lai</span>
                    <strong>{email}</strong>
                  </div>
                )}
                <div className="receipt-line divider">
                  <span>{course.name}</span>
                  <strong>{formatVnd(course.price)}₫</strong>
                </div>
                {hasSale && (
                  <div className="receipt-line" style={{ color: "var(--done)" }}>
                    <span>Ưu đãi</span>
                    <strong style={{ color: "var(--done)" }}>
                      −{formatVnd(course.price - course.sale_price!)}₫
                    </strong>
                  </div>
                )}
                {ord && ord.discount_amount > 0 && (
                  <div className="receipt-line" style={{ color: "var(--done)" }}>
                    <span>Mã giảm giá</span>
                    <strong style={{ color: "var(--done)" }}>
                      −{formatVnd(ord.discount_amount)}₫
                    </strong>
                  </div>
                )}
                <div className="receipt-total">
                  <span className="lbl">Đã thanh toán</span>
                  <span className="amt">
                    {(() => {
                      const paid = ord ? ord.total_amount : payable
                      return paid === 0 ? "Miễn phí" : formatVnd(paid)
                    })()}
                    {(ord ? ord.total_amount : payable) !== 0 && (
                      <span className="ccy">₫</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="ps-panel">
                <h3>Bước tiếp theo</h3>
                <div className="next-steps">
                  <Link href={`/hoc/${course.slug}`} className="next-step">
                    <div className="icn">
                      <span className="ms">play_arrow</span>
                    </div>
                    <div className="txt">
                      <div className="t">Bắt đầu chương đầu tiên</div>
                      <div className="s">Vào học ngay theo nhịp của bạn</div>
                    </div>
                    <span className="ms arrow">arrow_forward</span>
                  </Link>
                  <Link href="/blog" className="next-step">
                    <div className="icn">
                      <span className="ms">menu_book</span>
                    </div>
                    <div className="txt">
                      <div className="t">Đọc cẩm nang vận hành</div>
                      <div className="s">Bài viết &amp; mẹo áp dụng được ngay</div>
                    </div>
                    <span className="ms arrow">arrow_forward</span>
                  </Link>
                  <Link href="/khoa-hoc" className="next-step">
                    <div className="icn">
                      <span className="ms">grid_view</span>
                    </div>
                    <div className="txt">
                      <div className="t">Khám phá khóa học khác</div>
                      <div className="s">Nâng cấp lộ trình học của bạn</div>
                    </div>
                    <span className="ms arrow">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className="bonuses">
              <h3>
                <span className="ms">redeem</span>Bonus đi kèm khóa học
              </h3>
              <div className="bonus-grid">
                <div className="bonus">
                  <div className="icn">
                    <span className="ms">description</span>
                  </div>
                  <div className="t">Bộ template thực tế</div>
                  <div className="s">Worksheet, bảng tính &amp; checklist tải về dùng ngay.</div>
                </div>
                <div className="bonus">
                  <div className="icn">
                    <span className="ms">forum</span>
                  </div>
                  <div className="t">Cộng đồng học viên</div>
                  <div className="s">Hỏi đáp cùng giảng viên và học viên khác.</div>
                </div>
                <div className="bonus">
                  <div className="icn">
                    <span className="ms">workspace_premium</span>
                  </div>
                  <div className="t">Chứng chỉ hoàn thành</div>
                  <div className="s">Nhận chứng chỉ khi bạn hoàn thành 100% bài học.</div>
                </div>
              </div>
            </div>

            <div className="help-block">
              Cần hỗ trợ về đơn hàng? <a href="#">Liên hệ học vụ</a> · phản hồi
              trong vòng 4 giờ làm việc.
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessInner />
    </Suspense>
  )
}
