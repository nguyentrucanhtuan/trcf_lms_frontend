"use client"

import { useQuery } from "@tanstack/react-query"
import { Eye } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

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
import {
  ordersService,
  studentsService,
  type ListOrdersParams,
} from "@/lib/services"
import type { PaymentStatus } from "@/lib/types"

type StatusFilter = "all" | PaymentStatus

export const STATUS_BADGE: Record<
  PaymentStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  paid: { label: "Đã thanh toán", variant: "default" },
  pending: { label: "Chờ thanh toán", variant: "secondary" },
  failed: { label: "Thất bại", variant: "destructive" },
  refunded: { label: "Đã hoàn tiền", variant: "outline" },
  cancelled: { label: "Đã hủy", variant: "outline" },
}

export function fmtVnd(n: number): string {
  return new Intl.NumberFormat("vi-VN").format(n)
}

function fmtDateTime(iso: string): string {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, "0")
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export default function OrdersPage() {
  const [status, setStatus] = useState<StatusFilter>("all")

  const params: ListOrdersParams = {
    payment_status: status === "all" ? undefined : status,
    limit: 200,
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["orders", params],
    queryFn: () => ordersService.list(params),
  })

  const { data: students } = useQuery({
    queryKey: ["students", { limit: 200 }],
    queryFn: () => studentsService.list({ limit: 200 }),
  })
  const studentName = useMemo(() => {
    const m = new Map<number, string>()
    for (const s of students ?? []) m.set(s.id, s.full_name)
    return m
  }, [students])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Đơn hàng"
        description="Theo dõi đơn mua khóa học và xử lý thanh toán."
      />

      <div className="flex flex-wrap items-center gap-3">
        <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Mọi trạng thái</SelectItem>
            <SelectItem value="pending">Chờ thanh toán</SelectItem>
            <SelectItem value="paid">Đã thanh toán</SelectItem>
            <SelectItem value="cancelled">Đã hủy</SelectItem>
            <SelectItem value="refunded">Đã hoàn tiền</SelectItem>
            <SelectItem value="failed">Thất bại</SelectItem>
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
              <TableHead>Mã đơn</TableHead>
              <TableHead>Học viên</TableHead>
              <TableHead className="w-16 text-right">Khóa</TableHead>
              <TableHead className="w-32 text-right">Tổng tiền</TableHead>
              <TableHead className="w-36">Trạng thái</TableHead>
              <TableHead className="w-40">Ngày tạo</TableHead>
              <TableHead className="w-16 text-right">Xem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={8}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : data && data.length > 0 ? (
              data.map((o) => {
                const badge = STATUS_BADGE[o.payment_status]
                return (
                  <TableRow key={o.id}>
                    <TableCell className="font-mono text-xs">{o.id}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {o.order_code.slice(0, 8).toUpperCase()}
                    </TableCell>
                    <TableCell className="text-sm">
                      {studentName.get(o.student_id) ?? `#${o.student_id}`}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {o.items.length}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {fmtVnd(o.total_amount)}₫
                    </TableCell>
                    <TableCell>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {fmtDateTime(o.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        render={<Link href={`/orders/${o.id}`} aria-label="Xem" />}
                      >
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  Chưa có đơn hàng nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
