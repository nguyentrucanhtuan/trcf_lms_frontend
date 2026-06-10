export type UserRole = "admin" | "teacher" | "student"
export type StudentStatus = "active" | "inactive" | "graduated"
export type CourseStatus = "draft" | "published" | "archived"
export type EnrollmentStatus = "active" | "cancelled" | "completed"
export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "cancelled"
export type Gender = "male" | "female" | "other"

export interface User {
  id: number
  email: string
  role: UserRole
  is_active: boolean
  email_verified_at: string | null
  last_login_at: string | null
  created_at: string
  updated_at: string
}

export interface UserCreate {
  email: string
  password: string
  role: UserRole
  is_active: boolean
}

export interface UserUpdate {
  email?: string
  password?: string
  role?: UserRole
  is_active?: boolean
}

export interface Student {
  id: number
  user_id: number
  email: string | null
  student_code: string
  full_name: string
  phone: string | null
  date_of_birth: string | null
  gender: Gender
  address: string | null
  status: StudentStatus
  enrollment_date: string | null
  created_at: string
  updated_at: string
}

export interface StudentCreate {
  user_id: number
  student_code: string
  full_name: string
  phone?: string | null
  date_of_birth?: string | null
  gender: Gender
  address?: string | null
  status: StudentStatus
  enrollment_date?: string | null
}

export interface StudentUpdate {
  student_code?: string
  full_name?: string
  phone?: string | null
  date_of_birth?: string | null
  gender?: Gender
  address?: string | null
  status?: StudentStatus
  enrollment_date?: string | null
}

export interface CourseCategoryBrief {
  id: number
  name: string
  slug: string
  thumbnail_url: string | null
}

export interface CourseCategory {
  id: number
  name: string
  slug: string
  description: string | null
  display_order: number
  is_active: boolean
  thumbnail_url: string | null
  created_at: string
  updated_at: string
}

export interface CourseCategoryCreate {
  name: string
  slug?: string | null
  description?: string | null
  display_order: number
  is_active: boolean
  thumbnail_url?: string | null
}

export interface CourseCategoryUpdate {
  name?: string
  slug?: string | null
  description?: string | null
  display_order?: number
  is_active?: boolean
  thumbnail_url?: string | null
}

export interface Course {
  id: number
  course_code: string
  name: string
  slug: string
  description: string | null
  content: string | null
  thumbnail_url: string | null
  status: CourseStatus
  price: number
  sale_price: number | null
  categories: CourseCategoryBrief[]
  created_at: string
  updated_at: string
}

export interface CourseCreate {
  course_code: string
  name: string
  slug?: string | null
  description?: string | null
  content?: string | null
  thumbnail_url?: string | null
  status: CourseStatus
  price: number
  sale_price?: number | null
  category_ids?: number[] | null
}

export interface CourseUpdate {
  course_code?: string
  name?: string
  slug?: string | null
  description?: string | null
  content?: string | null
  thumbnail_url?: string | null
  status?: CourseStatus
  price?: number
  sale_price?: number | null
  category_ids?: number[] | null
}

export interface Lesson {
  id: number
  course_id: number
  section_id: number | null
  title: string
  content: string | null
  video_url: string | null
  duration_minutes: number | null
  position: number
  is_preview: boolean
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface LessonCreate {
  course_id: number
  section_id?: number | null
  title: string
  content?: string | null
  video_url?: string | null
  duration_minutes?: number | null
  position: number
  is_preview: boolean
  is_published: boolean
}

export interface LessonUpdate {
  title?: string
  content?: string | null
  video_url?: string | null
  duration_minutes?: number | null
  position?: number
  is_preview?: boolean
  is_published?: boolean
  section_id?: number | null
}

export interface LessonBrief {
  id: number
  title: string
  position: number
  duration_minutes: number | null
  is_preview: boolean
  is_published: boolean
}

export interface Section {
  id: number
  course_id: number
  title: string
  description: string | null
  position: number
  created_at: string
  updated_at: string
  lessons?: LessonBrief[]
}

export interface SectionCreate {
  course_id: number
  title: string
  description?: string | null
  position: number
}

export interface SectionUpdate {
  title?: string
  description?: string | null
  position?: number
}

export interface Enrollment {
  id: number
  student_id: number
  course_id: number
  status: EnrollmentStatus
  enrolled_at: string
  expires_at: string | null
  created_at: string
  updated_at: string
}

export interface EnrollmentCreate {
  student_id: number
  course_id: number
  status: EnrollmentStatus
  enrolled_at?: string
  expires_at?: string | null
}

export interface EnrollmentUpdate {
  status?: EnrollmentStatus
  expires_at?: string | null
}

export interface PaymentMethod {
  id: number
  code: string
  name: string
  description: string | null
  is_active: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface PaymentMethodCreate {
  code: string
  name: string
  description?: string | null
  is_active: boolean
  display_order: number
}

export interface PaymentMethodUpdate {
  code?: string
  name?: string
  description?: string | null
  is_active?: boolean
  display_order?: number
}

export interface Page<T> {
  items: T[]
  total: number
  offset: number
  limit: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  user: User
}

// ---- Archive categories (Danh mục nội dung) ----
export interface ArchiveCategory {
  id: number
  name: string
  slug: string
  description: string | null
  display_order: number
  is_active: boolean
  thumbnail_url: string | null
  created_at: string
  updated_at: string
}
export interface ArchiveCategoryCreate {
  name: string
  slug?: string | null
  description?: string | null
  display_order: number
  is_active: boolean
  thumbnail_url?: string | null
}
export interface ArchiveCategoryUpdate {
  name?: string
  slug?: string | null
  description?: string | null
  display_order?: number
  is_active?: boolean
  thumbnail_url?: string | null
}

// ---- Archives (Bài viết / Blog) ----
export type ArchiveStatus = "draft" | "published" | "archived"

export interface Archive {
  id: number
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  thumbnail_url: string | null
  status: ArchiveStatus
  published_at: string | null
  author_id: number
  archive_category_id: number | null
  view_count: number
  created_at: string
  updated_at: string
}
export interface ArchiveCreate {
  title: string
  slug?: string | null
  excerpt?: string | null
  content?: string | null
  thumbnail_url?: string | null
  status: ArchiveStatus
  published_at?: string | null
  author_id: number
  archive_category_id?: number | null
}
export interface ArchiveUpdate {
  title?: string
  slug?: string | null
  excerpt?: string | null
  content?: string | null
  thumbnail_url?: string | null
  status?: ArchiveStatus
  published_at?: string | null
  archive_category_id?: number | null
}

// ---- Coupons (Mã giảm giá) ----
export type CouponType = "percent" | "fixed"

export interface Coupon {
  id: number
  code: string
  description: string | null
  discount_type: CouponType
  discount_value: number
  valid_from: string | null
  valid_to: string | null
  max_uses: number | null
  is_active: boolean
  used_count: number
  created_at: string
  updated_at: string
}
export interface CouponCreate {
  code: string
  description?: string | null
  discount_type: CouponType
  discount_value: number
  valid_from?: string | null
  valid_to?: string | null
  max_uses?: number | null
  is_active: boolean
}
export interface CouponUpdate {
  code?: string
  description?: string | null
  discount_type?: CouponType
  discount_value?: number
  valid_from?: string | null
  valid_to?: string | null
  max_uses?: number | null
  is_active?: boolean
}
export interface CouponValidateResult {
  code: string
  discount_type: CouponType
  discount_value: number
  discount_amount: number
}

// ---- Reviews (Đánh giá) ----
export interface Review {
  id: number
  student_id: number
  course_id: number
  rating: number
  title: string | null
  comment: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}
export interface ReviewUpdate {
  rating?: number
  title?: string | null
  comment?: string | null
  is_published?: boolean
}

// ---- Certificates (Chứng chỉ) ----
export interface Certificate {
  id: number
  certificate_code: string
  student_id: number
  course_id: number
  notes: string | null
  issued_at: string
  created_at: string
  updated_at: string
}
export interface CertificateCreate {
  student_id: number
  course_id: number
  notes?: string | null
}

// ---- Orders (Đơn hàng) ----
export interface OrderItem {
  id: number
  order_id: number
  course_id: number
  unit_price: number
}
export interface Order {
  id: number
  order_code: string
  student_id: number
  payment_method_id: number
  payment_status: PaymentStatus
  subtotal_amount: number
  discount_amount: number
  total_amount: number
  coupon_id: number | null
  provider_txn_id: string | null
  provider_payload: Record<string, unknown> | null
  paid_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
  items: OrderItem[]
}
