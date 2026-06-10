"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import "../_auth/auth.css"
import { BrandLogo } from "../../(index)/_components/brand-logo"
import { ApiError } from "@/lib/api"
import { setSession } from "@/lib/auth"
import { authService } from "@/lib/services"

function SignUpForm() {
  const router = useRouter()
  const params = useSearchParams()
  const next = params.get("next") || "/khoa-hoc-cua-toi"

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (fullName.trim().length < 1) return setError("Vui lòng nhập họ tên.")
    if (password.length < 8) return setError("Mật khẩu tối thiểu 8 ký tự.")
    if (!agree) return setError("Bạn cần đồng ý với điều khoản để tiếp tục.")

    setLoading(true)
    try {
      await authService.register({ email, password, full_name: fullName.trim() })
      const data = await authService.login({ email, password })
      setSession({
        access: data.access_token,
        refresh: data.refresh_token,
        user: data.user,
      })
      toast.success("Tạo tài khoản thành công!")
      router.replace(next)
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.status === 409
            ? "Email này đã được đăng ký. Hãy đăng nhập."
            : err.message
          : "Đăng ký thất bại, vui lòng thử lại."
      setError(msg)
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
            Bắt đầu hành trình
          </span>
          <h1>Học pha chế &amp; vận hành quán bài bản.</h1>
          <p>
            Tham gia cộng đồng học viên CoffeeTree. Tạo tài khoản miễn phí để
            mở khóa các bài học thử và lưu tiến độ học.
          </p>
          <div className="auth-steps">
            <div className="auth-step active">
              <div className="num">1</div>
              <div className="txt">
                <div className="t">Tạo tài khoản miễn phí</div>
                <div className="s">Mất chưa đến 60 giây.</div>
              </div>
            </div>
            <div className="auth-step">
              <div className="num">2</div>
              <div className="txt">
                <div className="t">Mở khóa bài học thử</div>
                <div className="s">Xem trước nội dung trước khi đăng ký.</div>
              </div>
            </div>
            <div className="auth-step">
              <div className="num">3</div>
              <div className="txt">
                <div className="t">Đăng ký khóa đầy đủ khi sẵn sàng</div>
                <div className="s">Truy cập trọn đời, học theo nhịp của bạn.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="auth-right">
        <div className="auth-right-top">
          Đã có tài khoản?
          <Link href={`/dang-nhap?next=${encodeURIComponent(next)}`}>
            Đăng nhập
          </Link>
        </div>

        <div className="auth-form-wrap">
          <h2>Tạo tài khoản học viên</h2>
          <p className="lead">
            Đăng ký miễn phí. Bạn có thể nâng cấp lên khóa đầy đủ bất cứ lúc nào.
          </p>

          <form onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Họ và tên</label>
              <div className="input-wrap">
                <span className="ms">person</span>
                <input
                  className="field"
                  id="fullName"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            </div>

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
                  placeholder="Tối thiểu 8 ký tự"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
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
              <div className="pw-hint">
                Dùng <strong>8+ ký tự</strong> để bảo mật tốt hơn.
              </div>
            </div>

            <div className="checkbox-row">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <span className="box">
                  <span className="ms fill">check</span>
                </span>
                <span>
                  Tôi đồng ý với <a href="#">Điều khoản</a> và{" "}
                  <a href="#">Chính sách bảo mật</a> của CoffeeTree.
                </span>
              </label>
            </div>

            {error && <div className="field-error" style={{ marginBottom: 14 }}>{error}</div>}

            <button className="btn-submit" type="submit" disabled={loading}>
              <span>{loading ? "Đang tạo tài khoản…" : "Tạo tài khoản"}</span>
              {!loading && <span className="ms">arrow_forward</span>}
            </button>
          </form>

          <div className="auth-foot">
            <a href="#">Điều khoản</a>·<a href="#">Bảo mật</a>·
            <a href="#">Liên hệ</a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpForm />
    </Suspense>
  )
}
