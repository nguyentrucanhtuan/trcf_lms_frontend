"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { BrandLogo } from "./brand-logo"
import { clearSession, getStoredUser } from "@/lib/auth"
import type { User } from "@/lib/types"

const MENU = [
  { label: "Trang chủ", href: "/", match: (p: string) => p === "/" },
  { label: "Khóa học", href: "/khoa-hoc", match: (p: string) => p.startsWith("/khoa-hoc") || p.startsWith("/course") },
  { label: "Bài viết", href: "/blog", match: (p: string) => p.startsWith("/blog") },
  { label: "Về chúng tôi", href: "/#about", match: () => false },
]

export function SiteNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  // Avoid hydration mismatch: render logged-out markup until mounted.
  const [ready, setReady] = useState(false)

  // Re-read the session on each navigation so the nav reflects login/logout.
  useEffect(() => {
    setUser(getStoredUser())
    setReady(true)
  }, [pathname])

  function logout() {
    clearSession()
    setUser(null)
    router.push("/")
  }

  // "Khóa học" should not stay highlighted on the personal area.
  const onMyCourses = pathname.startsWith("/khoa-hoc-cua-toi")

  return (
    <header className="nav">
      <div className="brand">
        <BrandLogo />
        <h2>CoffeeTree</h2>
        <nav className="nav-menu">
          {MENU.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={item.match(pathname) && !onMyCourses ? "active" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="nav-right">
        {ready && user ? (
          <>
            <Link
              href="/khoa-hoc-cua-toi"
              className={`nav-link${onMyCourses ? " active" : ""}`}
            >
              Khóa học của tôi
            </Link>
            <span className="nav-user" title={user.email}>
              {user.email}
            </span>
            <button type="button" className="nav-logout" onClick={logout}>
              Đăng xuất
            </button>
          </>
        ) : (
          <>
            <Link href="/dang-nhap" className="nav-link">
              Đăng nhập
            </Link>
            <Link href="/dang-ky" className="btn btn-primary btn-sm">
              Đăng ký miễn phí
            </Link>
          </>
        )}
      </div>
    </header>
  )
}
