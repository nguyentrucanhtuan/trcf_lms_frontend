"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"

import { PageHeader } from "@/components/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { lessonsService } from "@/lib/services"
import { LessonForm } from "../../_form"

export default function EditLessonPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)

  const lessonQuery = useQuery({
    queryKey: ["lessons", id],
    queryFn: () => lessonsService.get(id),
    enabled: Number.isFinite(id),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Sửa bài học${lessonQuery.data ? ` · ${lessonQuery.data.title}` : ""}`}
        description="Cập nhật thông tin bài học."
      />
      {lessonQuery.isLoading ? (
        <Skeleton className="h-96 w-full max-w-2xl" />
      ) : lessonQuery.error ? (
        <p className="text-sm text-destructive">
          Không tải được dữ liệu bài học.
        </p>
      ) : lessonQuery.data ? (
        <LessonForm initial={lessonQuery.data} />
      ) : null}
    </div>
  )
}
