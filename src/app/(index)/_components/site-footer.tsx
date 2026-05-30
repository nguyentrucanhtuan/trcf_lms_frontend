import Link from "next/link"

export function SiteFooter() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-brand">
          <h3>CoffeeTree</h3>
          <p>
            Học viện vận hành quán cà phê — nơi chủ quán Việt Nam học cách làm
            việc với hệ thống thay vì cảm tính.
          </p>
        </div>
        <div className="footer-col">
          <h4>Khóa học</h4>
          <Link href="/#courses">Vận hành quán cà phê</Link>
          <Link href="/#courses">Barista Foundation</Link>
          <Link href="/#courses">Tài chính F&amp;B</Link>
          <Link href="/#courses">Marketing quán nhỏ</Link>
          <Link href="/#courses">Xem tất cả</Link>
        </div>
        <div className="footer-col">
          <h4>Học viện</h4>
          <Link href="/#about">Về CoffeeTree</Link>
          <Link href="/#about">Giảng viên</Link>
          <Link href="/#about">Câu chuyện học viên</Link>
          <Link href="/#articles">Bài viết</Link>
        </div>
        <div className="footer-col">
          <h4>Hỗ trợ</h4>
          <Link href="/#">Trung tâm trợ giúp</Link>
          <Link href="/#">Liên hệ</Link>
          <Link href="/#">Điều khoản</Link>
          <Link href="/#">Chính sách bảo mật</Link>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 CoffeeTree Academy · Made in Vietnam</span>
        <div className="socials">
          <button className="btn-icon" aria-label="Facebook">
            <span className="ms sm">facebook</span>
          </button>
          <button className="btn-icon" aria-label="Instagram">
            <span className="ms sm">photo_camera</span>
          </button>
          <button className="btn-icon" aria-label="YouTube">
            <span className="ms sm">smart_display</span>
          </button>
        </div>
      </div>
    </footer>
  )
}
