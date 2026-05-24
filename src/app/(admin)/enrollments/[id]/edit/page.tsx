"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"

import { PageHeader } from "@/components/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { enrollmentsService } from "@/lib/services"
import { EnrollmentForm } from "../../_form"

export default function EditEnrollmentPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)

  const enrollmentQuery = useQuery({
    queryKey: ["enrollments", id],
    queryFn: () => enrollmentsService.get(id),
    enabled: Number.isFinite(id),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Sửa ghi danh${enrollmentQuery.data ? ` · #${enrollmentQuery.data.id}` : ""}`}
        description="Cập nhật trạng thái hoặc ngày hết hạn của ghi danh."
      />
      {enrollmentQuery.isLoading ? (
        <Skeleton className="h-96 w-full max-w-2xl" />
      ) : enrollmentQuery.error ? (
        <p className="text-sm text-destructive">
          Không tải được dữ liệu ghi danh.
        </p>
      ) : enrollmentQuery.data ? (
        <EnrollmentForm initial={enrollmentQuery.data} />
      ) : null}
    </div>
  )
}
