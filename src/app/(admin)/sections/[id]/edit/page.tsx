"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"

import { PageHeader } from "@/components/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { coursesService, sectionsService } from "@/lib/services"
import { SectionForm } from "../../_form"

export default function EditSectionPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)

  const sectionQuery = useQuery({
    queryKey: ["sections", id],
    queryFn: () => sectionsService.get(id),
    enabled: Number.isFinite(id),
  })

  const courseQuery = useQuery({
    queryKey: ["courses", sectionQuery.data?.course_id],
    queryFn: () => coursesService.get(sectionQuery.data!.course_id),
    enabled: !!sectionQuery.data?.course_id,
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Sửa chương${sectionQuery.data ? ` · ${sectionQuery.data.title}` : ""}`}
        description={
          courseQuery.data
            ? `Khóa học: ${courseQuery.data.name} (${courseQuery.data.course_code})`
            : "Cập nhật thông tin chương."
        }
      />
      {sectionQuery.isLoading ? (
        <Skeleton className="h-72 w-full max-w-xl" />
      ) : sectionQuery.error ? (
        <p className="text-sm text-destructive">
          Không tải được dữ liệu chương.
        </p>
      ) : sectionQuery.data ? (
        <SectionForm initial={sectionQuery.data} />
      ) : null}
    </div>
  )
}
