"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"

import { PageHeader } from "@/components/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { coursesService } from "@/lib/services"
import { CourseForm } from "../../_form"
import { CourseOutline } from "../../_outline"

export default function EditCoursePage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)

  const { data, isLoading, error } = useQuery({
    queryKey: ["courses", id],
    queryFn: () => coursesService.get(id),
    enabled: Number.isFinite(id),
  })

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Sửa khóa học${data ? ` · ${data.name}` : ""}`}
        description="Cập nhật thông tin khóa học và sắp xếp nội dung."
      />
      {isLoading ? (
        <Skeleton className="h-96 w-full max-w-3xl" />
      ) : error ? (
        <p className="text-sm text-destructive">
          Không tải được dữ liệu khóa học.
        </p>
      ) : data ? (
        <>
          <CourseForm initial={data} />
          <CourseOutline courseId={data.id} />
        </>
      ) : null}
    </div>
  )
}
