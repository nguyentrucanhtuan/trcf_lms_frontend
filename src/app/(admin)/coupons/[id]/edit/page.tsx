"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"

import { PageHeader } from "@/components/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { couponsService } from "@/lib/services"
import { CouponForm } from "../../_form"

export default function EditCouponPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)

  const { data, isLoading, error } = useQuery({
    queryKey: ["coupons", id],
    queryFn: () => couponsService.get(id),
    enabled: Number.isFinite(id),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Sửa mã${data ? ` · ${data.code}` : ""}`}
        description="Cập nhật mã giảm giá."
      />
      {isLoading ? (
        <Skeleton className="h-96 w-full max-w-xl" />
      ) : error ? (
        <p className="text-sm text-destructive">Không tải được dữ liệu mã.</p>
      ) : data ? (
        <CouponForm initial={data} />
      ) : null}
    </div>
  )
}
