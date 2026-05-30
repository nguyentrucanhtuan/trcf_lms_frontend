"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BrandLogo } from "./brand-logo"

const MENU = [
  { label: "Trang chủ", href: "/", match: (p: string) => p === "/" },
  { label: "Khóa học", href: "/khoa-hoc", match: (p: string) => p.startsWith("/khoa-hoc") || p.startsWith("/course") },
  { label: "Bài viết", href: "/blog", match: (p: string) => p.startsWith("/blog") },
  { label: "Về chúng tôi", href: "/#about", match: () => false },
]

export function SiteNav() {
  const pathname = usePathname()
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
              className={item.match(pathname) ? "active" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="nav-right">
        <Link href="/dang-nhap" className="nav-link">
          Đăng nhập
        </Link>
        <Link href="/dang-ky" className="btn btn-primary btn-sm">
          Đăng ký miễn phí
        </Link>
      </div>
    </header>
  )
}
