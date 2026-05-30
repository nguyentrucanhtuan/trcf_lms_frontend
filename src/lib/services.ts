import { apiFetch } from "./api"
import type {
  Archive,
  ArchiveCategory,
  ArchiveCategoryCreate,
  ArchiveCategoryUpdate,
  ArchiveCreate,
  ArchiveStatus,
  ArchiveUpdate,
  Certificate,
  CertificateCreate,
  Coupon,
  CouponCreate,
  CouponUpdate,
  Order,
  PaymentStatus,
  Review,
  ReviewUpdate,
  Course,
  CourseCategory,
  CourseCategoryCreate,
  CourseCategoryUpdate,
  CourseCreate,
  CourseStatus,
  CourseUpdate,
  Enrollment,
  EnrollmentCreate,
  EnrollmentStatus,
  EnrollmentUpdate,
  Lesson,
  LessonCreate,
  LessonUpdate,
  LoginRequest,
  LoginResponse,
  Page,
  PaymentMethod,
  PaymentMethodCreate,
  PaymentMethodUpdate,
  Section,
  SectionCreate,
  SectionUpdate,
  Student,
  StudentCreate,
  StudentStatus,
  StudentUpdate,
  User,
  UserCreate,
  UserRole,
  UserUpdate,
} from "./types"

async function unwrap<T>(p: Promise<Page<T> | T[]>): Promise<T[]> {
  const data = await p
  if (Array.isArray(data)) return data
  return data.items
}

export const authService = {
  login: (body: LoginRequest) =>
    apiFetch<LoginResponse>("/auth/login", {
      method: "POST",
      body,
      auth: false,
    }),
  register: (body: { email: string; password: string; full_name: string }) =>
    apiFetch<User>("/auth/register", {
      method: "POST",
      body,
      auth: false,
    }),
  me: () => apiFetch<User>("/auth/me"),
  logout: () => apiFetch<null>("/auth/logout", { method: "POST" }),
}

export interface ListUsersParams {
  email?: string
  role?: UserRole
  is_active?: boolean
  offset?: number
  limit?: number
}

export const usersService = {
  list: (params: ListUsersParams = {}) =>
    unwrap<User>(
      apiFetch<Page<User> | User[]>("/users/", { query: { ...params } }),
    ),
  get: (id: number) => apiFetch<User>(`/users/${id}`),
  create: (body: UserCreate) =>
    apiFetch<User>("/users/", { method: "POST", body }),
  update: (id: number, body: UserUpdate) =>
    apiFetch<User>(`/users/${id}`, { method: "PATCH", body }),
  remove: (id: number) =>
    apiFetch<null>(`/users/${id}`, { method: "DELETE" }),
}

export interface ListCoursesParams {
  q?: string
  status?: CourseStatus
  category_id?: number
  offset?: number
  limit?: number
}

export const coursesService = {
  list: (params: ListCoursesParams = {}) =>
    unwrap<Course>(
      apiFetch<Page<Course> | Course[]>("/courses/", {
        query: { ...params },
      }),
    ),
  get: (id: number) => apiFetch<Course>(`/courses/${id}`),
  create: (body: CourseCreate) =>
    apiFetch<Course>("/courses/", { method: "POST", body }),
  update: (id: number, body: CourseUpdate) =>
    apiFetch<Course>(`/courses/${id}`, { method: "PATCH", body }),
  remove: (id: number) =>
    apiFetch<null>(`/courses/${id}`, { method: "DELETE" }),
}

export interface ListStudentsParams {
  q?: string
  status?: StudentStatus
  user_id?: number
  offset?: number
  limit?: number
}

export const studentsService = {
  list: (params: ListStudentsParams = {}) =>
    unwrap<Student>(
      apiFetch<Page<Student> | Student[]>("/students/", {
        query: { ...params },
      }),
    ),
  get: (id: number) => apiFetch<Student>(`/students/${id}`),
  create: (body: StudentCreate) =>
    apiFetch<Student>("/students/", { method: "POST", body }),
  update: (id: number, body: StudentUpdate) =>
    apiFetch<Student>(`/students/${id}`, { method: "PATCH", body }),
  remove: (id: number) =>
    apiFetch<null>(`/students/${id}`, { method: "DELETE" }),
}

export const sectionsService = {
  listByCourse: (courseId: number) =>
    apiFetch<Section[]>("/sections/", { query: { course_id: courseId } }),
  get: (id: number) => apiFetch<Section>(`/sections/${id}`),
  create: (body: SectionCreate) =>
    apiFetch<Section>("/sections/", { method: "POST", body }),
  update: (id: number, body: SectionUpdate) =>
    apiFetch<Section>(`/sections/${id}`, { method: "PATCH", body }),
  remove: (id: number) =>
    apiFetch<null>(`/sections/${id}`, { method: "DELETE" }),
}

export interface ListLessonsParams {
  course_id: number
  section_id?: number
  no_section?: boolean
  is_published?: boolean
}

export const lessonsService = {
  list: (params: ListLessonsParams) =>
    apiFetch<Lesson[]>("/lessons/", { query: { ...params } }),
  get: (id: number) => apiFetch<Lesson>(`/lessons/${id}`),
  create: (body: LessonCreate) =>
    apiFetch<Lesson>("/lessons/", { method: "POST", body }),
  update: (id: number, body: LessonUpdate) =>
    apiFetch<Lesson>(`/lessons/${id}`, { method: "PATCH", body }),
  remove: (id: number) =>
    apiFetch<null>(`/lessons/${id}`, { method: "DELETE" }),
}

export interface ListEnrollmentsParams {
  student_id?: number
  course_id?: number
  status?: EnrollmentStatus
  active_only?: boolean
  offset?: number
  limit?: number
}

export const enrollmentsService = {
  list: (params: ListEnrollmentsParams = {}) =>
    unwrap<Enrollment>(
      apiFetch<Page<Enrollment> | Enrollment[]>("/enrollments/", {
        query: { ...params },
      }),
    ),
  get: (id: number) => apiFetch<Enrollment>(`/enrollments/${id}`),
  create: (body: EnrollmentCreate) =>
    apiFetch<Enrollment>("/enrollments/", { method: "POST", body }),
  update: (id: number, body: EnrollmentUpdate) =>
    apiFetch<Enrollment>(`/enrollments/${id}`, { method: "PATCH", body }),
  remove: (id: number) =>
    apiFetch<null>(`/enrollments/${id}`, { method: "DELETE" }),
}

export interface ListPaymentMethodsParams {
  is_active?: boolean
}

export const paymentMethodsService = {
  list: (params: ListPaymentMethodsParams = {}) =>
    unwrap<PaymentMethod>(
      apiFetch<Page<PaymentMethod> | PaymentMethod[]>("/payment-methods/", {
        query: { ...params },
      }),
    ),
  get: (id: number) => apiFetch<PaymentMethod>(`/payment-methods/${id}`),
  create: (body: PaymentMethodCreate) =>
    apiFetch<PaymentMethod>("/payment-methods/", { method: "POST", body }),
  update: (id: number, body: PaymentMethodUpdate) =>
    apiFetch<PaymentMethod>(`/payment-methods/${id}`, {
      method: "PATCH",
      body,
    }),
  remove: (id: number) =>
    apiFetch<null>(`/payment-methods/${id}`, { method: "DELETE" }),
}

export interface ListCourseCategoriesParams {
  q?: string
  is_active?: boolean
  offset?: number
  limit?: number
}

export const courseCategoriesService = {
  list: (params: ListCourseCategoriesParams = {}) =>
    unwrap<CourseCategory>(
      apiFetch<Page<CourseCategory> | CourseCategory[]>(
        "/course-categories/",
        { query: { limit: 200, ...params } },
      ),
    ),
  get: (id: number) =>
    apiFetch<CourseCategory>(`/course-categories/${id}`),
  create: (body: CourseCategoryCreate) =>
    apiFetch<CourseCategory>("/course-categories/", { method: "POST", body }),
  update: (id: number, body: CourseCategoryUpdate) =>
    apiFetch<CourseCategory>(`/course-categories/${id}`, {
      method: "PATCH",
      body,
    }),
  remove: (id: number) =>
    apiFetch<null>(`/course-categories/${id}`, { method: "DELETE" }),
}

// ---- Archive categories (Danh mục nội dung) ----
export interface ListArchiveCategoriesParams {
  q?: string
  is_active?: boolean
  offset?: number
  limit?: number
}

export const archiveCategoriesService = {
  list: (params: ListArchiveCategoriesParams = {}) =>
    unwrap<ArchiveCategory>(
      apiFetch<Page<ArchiveCategory> | ArchiveCategory[]>(
        "/archive-categories/",
        { query: { limit: 200, ...params } },
      ),
    ),
  get: (id: number) => apiFetch<ArchiveCategory>(`/archive-categories/${id}`),
  create: (body: ArchiveCategoryCreate) =>
    apiFetch<ArchiveCategory>("/archive-categories/", { method: "POST", body }),
  update: (id: number, body: ArchiveCategoryUpdate) =>
    apiFetch<ArchiveCategory>(`/archive-categories/${id}`, {
      method: "PATCH",
      body,
    }),
  remove: (id: number) =>
    apiFetch<null>(`/archive-categories/${id}`, { method: "DELETE" }),
}

// ---- Archives (Bài viết / Blog) ----
export interface ListArchivesParams {
  q?: string
  status?: ArchiveStatus
  archive_category_id?: number
  author_id?: number
  offset?: number
  limit?: number
}

export const archivesService = {
  list: (params: ListArchivesParams = {}) =>
    unwrap<Archive>(
      apiFetch<Page<Archive> | Archive[]>("/archives/", {
        query: { limit: 200, ...params },
      }),
    ),
  get: (id: number) => apiFetch<Archive>(`/archives/${id}`),
  create: (body: ArchiveCreate) =>
    apiFetch<Archive>("/archives/", { method: "POST", body }),
  update: (id: number, body: ArchiveUpdate) =>
    apiFetch<Archive>(`/archives/${id}`, { method: "PATCH", body }),
  remove: (id: number) =>
    apiFetch<null>(`/archives/${id}`, { method: "DELETE" }),
}

// ---- Coupons (Mã giảm giá) ----
export interface ListCouponsParams {
  q?: string
  is_active?: boolean
  offset?: number
  limit?: number
}

export const couponsService = {
  list: (params: ListCouponsParams = {}) =>
    unwrap<Coupon>(
      apiFetch<Page<Coupon> | Coupon[]>("/coupons/", {
        query: { limit: 200, ...params },
      }),
    ),
  get: (id: number) => apiFetch<Coupon>(`/coupons/${id}`),
  create: (body: CouponCreate) =>
    apiFetch<Coupon>("/coupons/", { method: "POST", body }),
  update: (id: number, body: CouponUpdate) =>
    apiFetch<Coupon>(`/coupons/${id}`, { method: "PATCH", body }),
  remove: (id: number) =>
    apiFetch<null>(`/coupons/${id}`, { method: "DELETE" }),
}

// ---- Orders (Đơn hàng) — admin ----
export interface ListOrdersParams {
  student_id?: number
  payment_status?: PaymentStatus
  offset?: number
  limit?: number
}

export const ordersService = {
  list: (params: ListOrdersParams = {}) =>
    unwrap<Order>(
      apiFetch<Page<Order> | Order[]>("/orders/", {
        query: { limit: 200, ...params },
      }),
    ),
  get: (id: number) => apiFetch<Order>(`/orders/${id}`),
  markPaid: (id: number) =>
    apiFetch<Order>(`/orders/${id}/mark-paid`, { method: "POST" }),
  cancel: (id: number) =>
    apiFetch<Order>(`/orders/${id}/cancel`, { method: "POST" }),
}

// ---- Reviews (Đánh giá) — admin ----
export interface ListReviewsParams {
  course_id?: number
  student_id?: number
  published_only?: boolean
  offset?: number
  limit?: number
}

export const reviewsService = {
  list: (params: ListReviewsParams = {}) =>
    unwrap<Review>(
      apiFetch<Page<Review> | Review[]>("/reviews/", {
        // published_only defaults to true server-side; admin wants everything.
        query: { published_only: false, limit: 200, ...params },
      }),
    ),
  get: (id: number) => apiFetch<Review>(`/reviews/${id}`),
  update: (id: number, body: ReviewUpdate) =>
    apiFetch<Review>(`/reviews/${id}`, { method: "PATCH", body }),
  remove: (id: number) =>
    apiFetch<null>(`/reviews/${id}`, { method: "DELETE" }),
}

// ---- Certificates (Chứng chỉ) — admin ----
export interface ListCertificatesParams {
  student_id?: number
  course_id?: number
  offset?: number
  limit?: number
}

export const certificatesService = {
  list: (params: ListCertificatesParams = {}) =>
    unwrap<Certificate>(
      apiFetch<Page<Certificate> | Certificate[]>("/certificates/", {
        query: { limit: 200, ...params },
      }),
    ),
  get: (id: number) => apiFetch<Certificate>(`/certificates/${id}`),
  issue: (body: CertificateCreate) =>
    apiFetch<Certificate>("/certificates/", { method: "POST", body }),
  autoIssue: (studentId: number, courseId: number) =>
    apiFetch<Certificate>(
      `/certificates/auto-issue/students/${studentId}/courses/${courseId}`,
      { method: "POST" },
    ),
  remove: (id: number) =>
    apiFetch<null>(`/certificates/${id}`, { method: "DELETE" }),
}
