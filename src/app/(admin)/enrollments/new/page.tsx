"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

import { PageHeader } from "@/components/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { EnrollmentForm } from "../_form"

function NewEnrollmentInner() {
  const searchParams = useSearchParams()
  const studentIdParam = searchParams.get("student_id")
  const courseIdParam = searchParams.get("course_id")
  const defaultStudentId = studentIdParam ? Number(studentIdParam) : undefined
  const defaultCourseId = courseIdParam ? Number(courseIdParam) : undefined

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thêm ghi danh"
        description="Ghi danh một học viên vào một khóa học."
      />
      <EnrollmentForm
        defaultStudentId={defaultStudentId}
        defaultCourseId={defaultCourseId}
      />
    </div>
  )
}

export default function NewEnrollmentPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full max-w-2xl" />}>
      <NewEnrollmentInner />
    </Suspense>
  )
}
