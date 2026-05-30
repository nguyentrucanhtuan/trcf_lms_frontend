import type { Metadata } from "next"
import "./site.css"
import { SiteNav } from "./_components/site-nav"
import { SiteFooter } from "./_components/site-footer"

export const metadata: Metadata = {
  title: "CoffeeTree — Học viện vận hành quán cà phê",
  description:
    "Hệ thống khóa học & bài viết dành riêng cho chủ quán cà phê Việt Nam — từ chọn mặt bằng, đào tạo barista, đến tài chính và mở rộng chi nhánh.",
}

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
      />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
      />
      <div className="ct">
        <SiteNav />
        {children}
        <SiteFooter />
      </div>
    </>
  )
}
