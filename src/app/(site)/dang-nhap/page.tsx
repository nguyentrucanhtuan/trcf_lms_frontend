"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import "../_auth/auth.css"
import { BrandLogo } from "../../(index)/_components/brand-logo"
import { ApiError } from "@/lib/api"
import { clearSession, setSession } from "@/lib/auth"
import { authService } from "@/lib/services"

function SignInForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get("next") || "/"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) return setError("Mật khẩu tối thiểu 8 ký tự.")

    setLoading(true)
    try {
      const data = await authService.login({ email, password })
      // Trang này chỉ dành cho học viên — quản trị viên dùng trang riêng.
      if (data.user.role !== "student") {
        clearSession()
        setError(
          "Tài khoản này là quản trị viên / giảng viên. Vui lòng đăng nhập tại trang quản trị.",
        )
        setLoading(false)
        return
      }
      setSession({
        access: data.access_token,
        refresh: data.refresh_token,
        user: data.user,
      })
      toast.success("Đăng nhập thành công!")
      router.replace(next)
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : "Đăng nhập thất bại."
      setError(msg === "Invalid email or password" ? "Email hoặc mật khẩu không đúng." : msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth">
      <section className="auth-left">
        <Link href="/" className="auth-brand">
          <BrandLogo />
          <h2>CoffeeTree</h2>
        </Link>
        <div className="auth-left-content">
          <span className="kicker">
            <span className="dot" />
            Chào mừng trở lại
          </span>
          <h1>Tiếp tục hành trình học của bạn.</h1>
          <p>
            Đăng nhập để vào học, theo dõi tiến độ và truy cập các khóa học bạn
            đã đăng ký.
          </p>
        </div>
      </section>

      <section className="auth-right">
        <div className="auth-right-top">
          Chưa có tài khoản?
          <Link href={`/dang-ky?next=${encodeURIComponent(next)}`}>
            Đăng ký
          </Link>
        </div>

        <div className="auth-form-wrap">
          <h2>Đăng nhập học viên</h2>
          <p className="lead">Nhập email và mật khẩu để tiếp tục.</p>

          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrap">
                <span className="ms">mail</span>
                <input
                  className="field"
                  id="email"
                  type="email"
                  placeholder="ban@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Mật khẩu</label>
              <div className="input-wrap">
                <span className="ms">lock</span>
                <input
                  className="field"
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-pw"
                  aria-label="Hiện/ẩn mật khẩu"
                  onClick={() => setShowPw((v) => !v)}
                >
                  <span className="ms">
                    {showPw ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {error && <div className="field-error" style={{ marginBottom: 14 }}>{error}</div>}

            <button className="btn-submit" type="submit" disabled={loading}>
              <span>{loading ? "Đang đăng nhập…" : "Đăng nhập"}</span>
              {!loading && <span className="ms">arrow_forward</span>}
            </button>
          </form>

          <div className="auth-note">
            Bạn là quản trị viên hoặc giảng viên?{" "}
            <Link href="/login">Đăng nhập tại trang quản trị</Link>.
          </div>

          <div className="auth-foot">
            <a href="#">Điều khoản</a>·<a href="#">Bảo mật</a>·
            <a href="#">Liên hệ</a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  )
}
