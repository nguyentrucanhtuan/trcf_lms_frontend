"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"

import { PageHeader } from "@/components/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { archivesService } from "@/lib/services"
import { ArchiveForm } from "../../_form"

export default function EditArchivePage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)

  const { data, isLoading, error } = useQuery({
    queryKey: ["archives", id],
    queryFn: () => archivesService.get(id),
    enabled: Number.isFinite(id),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Sửa bài viết${data ? ` · ${data.title}` : ""}`}
        description="Cập nhật nội dung bài viết."
      />
      {isLoading ? (
        <Skeleton className="h-96 w-full max-w-2xl" />
      ) : error ? (
        <p className="text-sm text-destructive">
          Không tải được dữ liệu bài viết.
        </p>
      ) : data ? (
        <ArchiveForm initial={data} />
      ) : null}
    </div>
  )
}
