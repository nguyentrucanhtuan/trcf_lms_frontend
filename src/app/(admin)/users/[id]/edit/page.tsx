"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"

import { PageHeader } from "@/components/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { usersService } from "@/lib/services"
import { UserForm } from "../../_form"

export default function EditUserPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)

  const { data, isLoading, error } = useQuery({
    queryKey: ["users", id],
    queryFn: () => usersService.get(id),
    enabled: Number.isFinite(id),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Sửa người dùng${data ? ` · ${data.email}` : ""}`}
        description="Cập nhật thông tin tài khoản."
      />
      {isLoading ? (
        <Skeleton className="h-64 w-full max-w-xl" />
      ) : error ? (
        <p className="text-sm text-destructive">
          Không tải được dữ liệu người dùng.
        </p>
      ) : data ? (
        <UserForm initial={data} />
      ) : null}
    </div>
  )
}
