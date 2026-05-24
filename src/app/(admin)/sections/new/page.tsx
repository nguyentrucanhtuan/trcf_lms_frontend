"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

import { PageHeader } from "@/components/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { SectionForm } from "../_form"

function NewSectionInner() {
  const searchParams = useSearchParams()
  const courseIdParam = searchParams.get("course_id")
  const defaultCourseId = courseIdParam ? Number(courseIdParam) : undefined

  return (
    <div className="space-y-6">
      <PageHeader
        title="Thêm chương"
        description="Tạo chương cho một khóa học."
      />
      <SectionForm defaultCourseId={defaultCourseId} />
    </div>
  )
}

export default function NewSectionPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full max-w-xl" />}>
      <NewSectionInner />
    </Suspense>
  )
}
