"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import "./checkout.css"
import { BrandLogo } from "../../(index)/_components/brand-logo"
import { getStoredUser } from "@/lib/auth"
import { ApiError } from "@/lib/api"
import { coupons, learning, orders } from "@/lib/learning"
import type { CouponValidateResult } from "@/lib/types"
import {
  countLessons,
  fetchCourseBySlug,
  formatVnd,
  humanDuration,
  totalMinutes,
} from "@/lib/courses"

const PAY_METHOD_ID: Record<string, number> = {
  vnpay: 1,
  momo: 2,
  zalo: 3,
  bank: 4,
}

const PAY_METHODS = [
  { id: "vnpay", logo: "vnpay", label: "VNPay", title: "Cổng VNPay", desc: "Internet Banking, ATM, QR Code · 40+ ngân hàng", extra: "Phổ biến" },
  { id: "momo", logo: "momo", label: "Momo", title: "Ví Momo", desc: "Thanh toán bằng ví Momo, mở app quét QR", extra: "" },
  { id: "zalo", logo: "zalo", label: "ZaloP", title: "ZaloPay", desc: "Hoàn 5% giá trị đơn hàng (tối đa 100.000₫)", extra: "Hoàn 5%" },
  { id: "bank", logo: "bank", label: "CK", title: "Chuyển khoản ngân hàng", desc: "Chuyển khoản thủ công · kích hoạt trong 2 giờ làm việc", extra: "" },
]

function CheckoutInner() {
  const router = useRouter()
  const params = useSearchParams()
  const slug = params.get("course")

  const [method, setMethod] = useState("vnpay")
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [agree, setAgree] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [couponInput, setCouponInput] = useState("")
  const [applied, setApplied] = useState<CouponValidateResult | null>(null)
  const [couponBusy, setCouponBusy] = useState(false)
  const [couponErr, setCouponErr] = useState<string | null>(null)

  useEffect(() => {
    const u = getStoredUser()
    if (u?.email) setEmail(u.email)
  }, [])

  const { data: course, isLoading } = useQuery({
    queryKey: ["checkout-course", slug],
    queryFn: () => fetchCourseBySlug(slug!),
    enabled: !!slug,
  })

  if (!slug) {
    return (
      <div className="co-page" style={{ gridTemplateColumns: "1fr" }}>
        <p style={{ color: "var(--ink-2)" }}>
          Chưa chọn khóa học.{" "}
          <Link href="/khoa-hoc" style={{ color: "var(--primary)" }}>
            Xem danh sách khóa học
          </Link>
          .
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="co-page" style={{ gridTemplateColumns: "1fr" }}>
        <p style={{ color: "var(--ink-2)" }}>Đang tải đơn hàng…</p>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="co-page" style={{ gridTemplateColumns: "1fr" }}>
        <p style={{ color: "var(--ink-2)" }}>
          Không tìm thấy khóa học.{" "}
          <Link href="/khoa-hoc" style={{ color: "var(--primary)" }}>
            Quay lại
          </Link>
          .
        </p>
      </div>
    )
  }

  const hasSale = course.sale_price != null && course.sale_price < course.price
  const payable = hasSale ? course.sale_price! : course.price
  const saved = hasSale ? course.price - course.sale_price! : 0
  const lessons = countLessons(course)
  const minutes = totalMinutes(course)
  const discount = applied ? Math.min(applied.discount_amount, payable) : 0
  const finalTotal = Math.max(payable - discount, 0)
  const isFree = finalTotal === 0
  const category = course.categories[0]?.name

  async function applyCoupon() {
    const code = couponInput.trim()
    if (!code) return
    setCouponBusy(true)
    setCouponErr(null)
    try {
      const result = await coupons.validate(code, payable)
      setApplied(result)
      toast.success(`Đã áp dụng mã ${result.code}`)
    } catch (err) {
      setApplied(null)
      setCouponErr(
        err instanceof ApiError ? err.message : "Mã không hợp lệ hoặc đã hết hạn.",
      )
    } finally {
      setCouponBusy(false)
    }
  }

  function removeCoupon() {
    setApplied(null)
    setCouponInput("")
    setCouponErr(null)
  }

  async function pay() {
    if (!course) return
    const checkoutUrl = `/checkout?course=${course.slug}`
    // Phải đăng nhập học viên trước khi mua.
    if (!getStoredUser()) {
      router.push(`/dang-nhap?next=${encodeURIComponent(checkoutUrl)}`)
      return
    }
    setProcessing(true)
    try {
      const me = await learning.me()
      const order = await orders.create({
        student_id: me.id,
        payment_method_id: PAY_METHOD_ID[method] ?? 1,
        items: [{ course_id: course.id }],
        coupon_code: applied ? applied.code : undefined,
      })
      await orders.payMock(order.id)
      const qs = new URLSearchParams({
        course: course.slug,
        method,
        order: order.order_code,
      })
      if (email) qs.set("email", email)
      if (fullName) qs.set("name", fullName)
      router.push(`/thanh-toan-thanh-cong?${qs.toString()}`)
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.status === 401
            ? "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại."
            : err.message
          : "Không thể xử lý thanh toán, vui lòng thử lại."
      toast.error(msg)
      if (err instanceof ApiError && err.status === 401) {
        router.push(`/dang-nhap?next=${encodeURIComponent(checkoutUrl)}`)
      }
    } finally {
      setProcessing(false)
    }
  }

  return (
    <>
      <header className="co-topbar">
        <Link href="/" className="brand">
          <BrandLogo />
          <h2>CoffeeTree</h2>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span className="secure-tag">
            <span className="ms">lock</span>Thanh toán an toàn · mã hóa SSL
          </span>
          <Link href="/#about" className="help-link">
            Cần trợ giúp?
          </Link>
        </div>
      </header>

      <div className="stepper">
        <div className="step done">
          <div className="num">
            <span className="ms" style={{ fontSize: 14 }}>check</span>
          </div>
          <div className="lbl">Chọn khóa học</div>
        </div>
        <div className="step-divider done" />
        <div className="step active">
          <div className="num">2</div>
          <div className="lbl">Thanh toán</div>
        </div>
        <div className="step-divider" />
        <div className="step">
          <div className="num">3</div>
          <div className="lbl">Hoàn tất</div>
        </div>
      </div>

      <div className="co-page">
        <section>
          <h1>Thanh toán</h1>
          <p className="lead">
            Hoàn tất đơn hàng — bạn sẽ vào học ngay sau khi thanh toán thành công.
          </p>

          <div className="panel">
            <div className="panel-head">
              <div className="num">1</div>
              <h3>Thông tin liên hệ</h3>
            </div>
            <div className="form-row two">
              <div className="form-group">
                <label htmlFor="name">Họ và tên</label>
                <div className="input-wrap">
                  <span className="ms">person</span>
                  <input
                    className="field"
                    id="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="phone">Số điện thoại</label>
                <div className="input-wrap">
                  <span className="ms">call</span>
                  <input
                    className="field"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09xx xxx xxx"
                  />
                </div>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email nhận biên lai</label>
                <div className="input-wrap">
                  <span className="ms">mail</span>
                  <input
                    className="field"
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ban@email.com"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div className="num">2</div>
              <h3>Phương thức thanh toán</h3>
            </div>
            <div className="pay-methods">
              {PAY_METHODS.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  className={`pay-option ${method === m.id ? "selected" : ""}`}
                  onClick={() => setMethod(m.id)}
                >
                  <div className="radio" />
                  <div className={`logo ${m.logo}`}>{m.label}</div>
                  <div className="info">
                    <div className="t">{m.title}</div>
                    <div className="s">{m.desc}</div>
                  </div>
                  {m.extra && <span className="extra">{m.extra}</span>}
                </button>
              ))}
            </div>
            <div className="pay-extras">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--ink)", fontWeight: 500 }}>
                <span className="ms sm">shield</span>
                Mọi giao dịch được mã hóa SSL 256-bit
              </span>
              <span style={{ margin: "0 6px" }}>·</span>
              Cam kết hoàn 100% nếu hủy trong 14 ngày đầu.
            </div>
          </div>

          <div className="panel">
            <div className="panel-head">
              <div className="num">3</div>
              <h3>Xác nhận</h3>
            </div>
            <label className="checkbox" style={{ alignItems: "flex-start" }}>
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <span className="box">
                <span className="ms fill">check</span>
              </span>
              <span>
                Tôi đồng ý với <a href="#">Điều khoản dịch vụ</a> và{" "}
                <a href="#">Chính sách hoàn tiền</a> của CoffeeTree Academy.
              </span>
            </label>
          </div>
        </section>

        <aside>
          <div className="order-card">
            <div className="order-head">
              <h3>Đơn hàng của bạn</h3>
              <Link href={`/course/${course.slug}`} className="edit">
                Chỉnh sửa
              </Link>
            </div>

            <div className="order-item">
              <div className="thumb" />
              <div className="info">
                {category && <div className="label">{category}</div>}
                <div className="t">{course.name}</div>
                <div className="s">
                  <span>
                    <span className="ms">play_circle</span>
                    {lessons} bài
                  </span>
                  <span>
                    <span className="ms">schedule</span>
                    {humanDuration(minutes)}
                  </span>
                  <span>
                    <span className="ms">all_inclusive</span>Trọn đời
                  </span>
                </div>
              </div>
            </div>

            <div className="coupon">
              {applied ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    padding: "8px 12px",
                    background: "var(--done-soft)",
                    color: "var(--done)",
                    borderRadius: "var(--r-md)",
                  }}
                >
                  <span className="ms sm">verified</span>
                  <span>
                    Mã <strong>{applied.code}</strong> — giảm{" "}
                    {formatVnd(discount)}₫
                  </span>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    style={{ marginLeft: "auto", color: "var(--done)" }}
                    aria-label="Bỏ mã"
                  >
                    <span className="ms sm">close</span>
                  </button>
                </div>
              ) : (
                <>
                  <div className="row">
                    <input
                      className="field"
                      type="text"
                      placeholder="Mã giảm giá"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                    />
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={applyCoupon}
                      disabled={couponBusy || !couponInput.trim()}
                    >
                      {couponBusy ? "…" : "Áp dụng"}
                    </button>
                  </div>
                  {couponErr && (
                    <div style={{ fontSize: 12, color: "#ef4444", marginTop: 8 }}>
                      {couponErr}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="totals">
              <div className="line">
                <span>Giá khóa học</span>
                <span style={{ color: "var(--ink)" }}>
                  {formatVnd(course.price)}₫
                </span>
              </div>
              {hasSale && (
                <div className="line discount">
                  <span>Ưu đãi</span>
                  <span>−{formatVnd(saved)}₫</span>
                </div>
              )}
              {applied && discount > 0 && (
                <div className="line discount">
                  <span>Mã {applied.code}</span>
                  <span>−{formatVnd(discount)}₫</span>
                </div>
              )}
              <div className="total">
                <span className="lbl">Tổng thanh toán</span>
                <span className="amt">
                  {isFree ? "Miễn phí" : formatVnd(finalTotal)}
                  {!isFree && <span className="ccy">₫</span>}
                </span>
              </div>
              {saved + discount > 0 && (
                <div className="savings">
                  Bạn tiết kiệm <strong>{formatVnd(saved + discount)}₫</strong>
                </div>
              )}
            </div>

            <div className="order-foot">
              <button
                className="btn-pay"
                onClick={pay}
                disabled={!agree || processing}
                type="button"
              >
                <span className="ms">{processing ? "hourglass_top" : "lock"}</span>
                <span>
                  {processing
                    ? "Đang xử lý…"
                    : isFree
                      ? "Đăng ký miễn phí"
                      : `Thanh toán ${formatVnd(finalTotal)}₫`}
                </span>
              </button>

              <div className="trust-row">
                <div className="trust">
                  <span className="ms">verified_user</span>Hoàn 100% trong 14 ngày
                </div>
                <div className="trust">
                  <span className="ms">shield</span>Mã hóa SSL 256-bit
                </div>
                <div className="trust">
                  <span className="ms">all_inclusive</span>Truy cập trọn đời
                </div>
                <div className="trust">
                  <span className="ms">workspace_premium</span>Chứng chỉ hoàn thành
                </div>
              </div>

              <div className="legal">
                Bằng việc thanh toán, bạn đồng ý với <a href="#">Điều khoản</a> &amp;{" "}
                <a href="#">Chính sách bảo mật</a> của CoffeeTree.
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutInner />
    </Suspense>
  )
}
