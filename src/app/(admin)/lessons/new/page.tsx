"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

import { PageHeader } from "@/components/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { LessonForm } from "../_form"

function NewLessonInner() {
  const searchParams = useSearchParams()
  const courseIdParam = searchParams.get("course_id")
  const defaultCourseId = courseIdParam ? Number(courseIdParam) : undefined

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thêm bài học"
        description="Chọn khóa học, chương (tùy chọn), rồi nhập nội dung."
      />
      <LessonForm defaultCourseId={defaultCourseId} />
    </div>
  )
}

export default function NewLessonPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full max-w-2xl" />}>
      <NewLessonInner />
    </Suspense>
  )
}
