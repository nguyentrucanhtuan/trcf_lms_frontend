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
import { Input } from "@/components/ui/input"
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
import { couponsService, type ListCouponsParams } from "@/lib/services"
import type { Coupon } from "@/lib/types"

type ActiveFilter = "all" | "active" | "inactive"

function fmtValue(c: Coupon): string {
  return c.discount_type === "percent"
    ? `${c.discount_value}%`
    : `${new Intl.NumberFormat("vi-VN").format(c.discount_value)}₫`
}

export default function CouponsPage() {
  const qc = useQueryClient()
  const [q, setQ] = useState("")
  const [active, setActive] = useState<ActiveFilter>("all")

  const params: ListCouponsParams = {
    q: q.trim() || undefined,
    is_active:
      active === "all" ? undefined : active === "active" ? true : false,
    limit: 200,
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["coupons", params],
    queryFn: () => couponsService.list(params),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => couponsService.remove(id),
    onSuccess: () => {
      toast.success("Đã xóa mã")
      qc.invalidateQueries({ queryKey: ["coupons"] })
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Xóa thất bại"
      toast.error(msg)
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mã giảm giá"
        description="Tạo và quản lý mã khuyến mãi áp dụng khi thanh toán."
        action={
          <Button render={<Link href="/coupons/new" />}>
            <Plus />
            Thêm mã
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo mã…"
          className="max-w-sm"
        />
        <Select value={active} onValueChange={(v) => setActive(v as ActiveFilter)}>
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
              <TableHead>Mã</TableHead>
              <TableHead className="w-28">Giảm</TableHead>
              <TableHead className="w-28">Đã dùng</TableHead>
              <TableHead className="w-32">Trạng thái</TableHead>
              <TableHead className="w-24 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : data && data.length > 0 ? (
              data.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs">{c.id}</TableCell>
                  <TableCell>
                    <div className="font-mono font-medium">{c.code}</div>
                    {c.description ? (
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {c.description}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell className="font-medium">{fmtValue(c)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {c.used_count}
                    {c.max_uses != null ? ` / ${c.max_uses}` : ""}
                  </TableCell>
                  <TableCell>
                    {c.is_active ? (
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
                          <Link href={`/coupons/${c.id}/edit`} aria-label="Sửa" />
                        }
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <ConfirmDialog
                        trigger={
                          <Button size="icon" variant="ghost" aria-label="Xóa">
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        }
                        title={`Xóa mã "${c.code}"?`}
                        description="Hành động không hoàn tác."
                        confirmLabel="Xóa"
                        onConfirm={() => deleteMutation.mutateAsync(c.id)}
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
                  Chưa có mã giảm giá nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
