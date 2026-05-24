"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"

import { PageHeader } from "@/components/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { studentsService } from "@/lib/services"
import { StudentForm } from "../../_form"

export default function EditStudentPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)

  const { data, isLoading, error } = useQuery({
    queryKey: ["students", id],
    queryFn: () => studentsService.get(id),
    enabled: Number.isFinite(id),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Sửa học viên${data ? ` · ${data.full_name}` : ""}`}
        description="Cập nhật hồ sơ học viên."
      />
      {isLoading ? (
        <Skeleton className="h-96 w-full max-w-2xl" />
      ) : error ? (
        <p className="text-sm text-destructive">
          Không tải được dữ liệu học viên.
        </p>
      ) : data ? (
        <StudentForm initial={data} />
      ) : null}
    </div>
  )
}
