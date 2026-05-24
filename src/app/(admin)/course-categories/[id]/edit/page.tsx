"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"

import { PageHeader } from "@/components/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { courseCategoriesService } from "@/lib/services"
import { CourseCategoryForm } from "../../_form"

export default function EditCourseCategoryPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)

  const { data, isLoading, error } = useQuery({
    queryKey: ["course-categories", id],
    queryFn: () => courseCategoriesService.get(id),
    enabled: Number.isFinite(id),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Sửa danh mục${data ? ` · ${data.name}` : ""}`}
        description="Cập nhật thông tin danh mục."
      />
      {isLoading ? (
        <Skeleton className="h-72 w-full max-w-xl" />
      ) : error ? (
        <p className="text-sm text-destructive">
          Không tải được dữ liệu danh mục.
        </p>
      ) : data ? (
        <CourseCategoryForm initial={data} />
      ) : null}
    </div>
  )
}
