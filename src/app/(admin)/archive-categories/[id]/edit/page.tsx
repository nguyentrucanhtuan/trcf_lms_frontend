"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"

import { PageHeader } from "@/components/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { archiveCategoriesService } from "@/lib/services"
import { ArchiveCategoryForm } from "../../_form"

export default function EditArchiveCategoryPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)

  const { data, isLoading, error } = useQuery({
    queryKey: ["archive-categories", id],
    queryFn: () => archiveCategoriesService.get(id),
    enabled: Number.isFinite(id),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Sửa danh mục${data ? ` · ${data.name}` : ""}`}
        description="Cập nhật thông tin danh mục nội dung."
      />
      {isLoading ? (
        <Skeleton className="h-72 w-full max-w-xl" />
      ) : error ? (
        <p className="text-sm text-destructive">
          Không tải được dữ liệu danh mục.
        </p>
      ) : data ? (
        <ArchiveCategoryForm initial={data} />
      ) : null}
    </div>
  )
}
