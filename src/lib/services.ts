import { apiFetch } from "./api"
import type {
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
