"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"

import { PageHeader } from "@/components/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { paymentMethodsService } from "@/lib/services"
import { PaymentMethodForm } from "../../_form"

export default function EditPaymentMethodPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)

  const { data, isLoading, error } = useQuery({
    queryKey: ["payment-methods", id],
    queryFn: () => paymentMethodsService.get(id),
    enabled: Number.isFinite(id),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Sửa phương thức${data ? ` · ${data.name}` : ""}`}
        description="Cập nhật cấu hình phương thức thanh toán."
      />
      {isLoading ? (
        <Skeleton className="h-72 w-full max-w-xl" />
      ) : error ? (
        <p className="text-sm text-destructive">
          Không tải được dữ liệu phương thức.
        </p>
      ) : data ? (
        <PaymentMethodForm initial={data} />
      ) : null}
    </div>
  )
}
