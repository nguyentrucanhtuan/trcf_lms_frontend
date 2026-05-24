"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Pencil, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ApiError } from "@/lib/api"
import {
  paymentMethodsService,
  type ListPaymentMethodsParams,
} from "@/lib/services"

type ActiveFilter = "all" | "active" | "inactive"

export default function PaymentMethodsPage() {
  const qc = useQueryClient()
  const [active, setActive] = useState<ActiveFilter>("all")

  const params: ListPaymentMethodsParams = {
    is_active:
      active === "all" ? undefined : active === "active" ? true : false,
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["payment-methods", params],
    queryFn: () => paymentMethodsService.list(params),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => paymentMethodsService.remove(id),
    onSuccess: () => {
      toast.success("Đã xóa phương thức")
      qc.invalidateQueries({ queryKey: ["payment-methods"] })
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Xóa thất bại"
      toast.error(msg)
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Phương thức thanh toán"
        description="Cấu hình các phương thức thanh toán cho đơn hàng."
        action={
          <Button render={<Link href="/payment-methods/new" />}>
            <Plus />
            Thêm phương thức
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={active}
          onValueChange={(v) => setActive(v as ActiveFilter)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="active">Đang hoạt động</SelectItem>
            <SelectItem value="inactive">Đã tắt</SelectItem>
          </SelectContent>
        </Select>
        {isFetching ? (
          <span className="text-xs text-muted-foreground">Đang tải…</span>
        ) : null}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">ID</TableHead>
              <TableHead className="w-32">Code</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead className="w-24">Thứ tự</TableHead>
              <TableHead className="w-32">Trạng thái</TableHead>
              <TableHead className="w-24 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : data && data.length > 0 ? (
              data.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono text-xs">{m.id}</TableCell>
                  <TableCell className="font-mono text-xs">{m.code}</TableCell>
                  <TableCell>
                    <div className="font-medium">{m.name}</div>
                    {m.description ? (
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {m.description}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell>{m.display_order}</TableCell>
                  <TableCell>
                    {m.is_active ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="outline">Disabled</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        render={
                          <Link
                            href={`/payment-methods/${m.id}/edit`}
                            aria-label="Sửa"
                          />
                        }
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <ConfirmDialog
                        trigger={
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label="Xóa"
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        }
                        title={`Xóa "${m.name}"?`}
                        description="Bị chặn nếu có order đang dùng phương thức này."
                        confirmLabel="Xóa"
                        onConfirm={() => deleteMutation.mutateAsync(m.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  Chưa có phương thức nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
