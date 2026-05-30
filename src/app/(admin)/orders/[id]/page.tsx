"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, Ban, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useMemo } from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { coursesService, ordersService, studentsService } from "@/lib/services"
import { STATUS_BADGE, fmtVnd } from "../page"

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const qc = useQueryClient()

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["orders", id],
    queryFn: () => ordersService.get(id),
    enabled: Number.isFinite(id),
  })

  const { data: courses } = useQuery({
    queryKey: ["courses", { limit: 200 }],
    queryFn: () => coursesService.list({ limit: 200 }),
  })
  const courseName = useMemo(() => {
    const m = new Map<number, string>()
    for (const c of courses ?? []) m.set(c.id, c.name)
    return m
  }, [courses])

  const { data: student } = useQuery({
    queryKey: ["students", order?.student_id],
    queryFn: () => studentsService.get(order!.student_id),
    enabled: !!order,
  })

  const markPaid = useMutation({
    mutationFn: () => ordersService.markPaid(id),
    onSuccess: () => {
      toast.success("Đã xác nhận thanh toán — học viên được ghi danh.")
      qc.invalidateQueries({ queryKey: ["orders"] })
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Thao tác thất bại"),
  })

  const cancel = useMutation({
    mutationFn: () => ordersService.cancel(id),
    onSuccess: () => {
      toast.success("Đã hủy đơn hàng")
      qc.invalidateQueries({ queryKey: ["orders"] })
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Thao tác thất bại"),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title={order ? `Đơn ${order.order_code.slice(0, 8).toUpperCase()}` : "Đơn hàng"}
        description="Chi tiết đơn hàng và xử lý thanh toán."
        action={
          <Button variant="outline" render={<Link href="/orders" />}>
            <ArrowLeft />
            Danh sách
          </Button>
        }
      />

      {isLoading ? (
        <Skeleton className="h-80 w-full max-w-3xl" />
      ) : error || !order ? (
        <p className="text-sm text-destructive">Không tải được đơn hàng.</p>
      ) : (
        <div className="grid max-w-3xl gap-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                Trạng thái
                <Badge variant={STATUS_BADGE[order.payment_status].variant}>
                  {STATUS_BADGE[order.payment_status].label}
                </Badge>
              </CardTitle>
              <div className="flex gap-2">
                {order.payment_status !== "paid" &&
                  order.payment_status !== "cancelled" &&
                  order.payment_status !== "refunded" && (
                    <ConfirmDialog
                      trigger={
                        <Button size="sm">
                          <CheckCircle2 className="size-4" />
                          Xác nhận đã thanh toán
                        </Button>
                      }
                      title="Xác nhận đã thanh toán?"
                      description="Đơn sẽ chuyển sang 'Đã thanh toán' và học viên được ghi danh vào khóa học."
                      confirmLabel="Xác nhận"
                      onConfirm={() => markPaid.mutateAsync()}
                    />
                  )}
                {order.payment_status === "pending" && (
                  <ConfirmDialog
                    trigger={
                      <Button size="sm" variant="outline">
                        <Ban className="size-4" />
                        Hủy đơn
                      </Button>
                    }
                    title="Hủy đơn hàng?"
                    description="Hành động không hoàn tác."
                    confirmLabel="Hủy đơn"
                    onConfirm={() => cancel.mutateAsync()}
                  />
                )}
              </div>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
              <Field label="Mã đơn" value={order.order_code} mono />
              <Field
                label="Học viên"
                value={student ? `${student.full_name} (#${order.student_id})` : `#${order.student_id}`}
              />
              <Field
                label="Ngày tạo"
                value={new Date(order.created_at).toLocaleString("vi-VN")}
              />
              <Field
                label="Thanh toán lúc"
                value={order.paid_at ? new Date(order.paid_at).toLocaleString("vi-VN") : "—"}
              />
              <Field label="Mã giao dịch" value={order.provider_txn_id ?? "—"} mono />
              <Field
                label="Phương thức"
                value={`#${order.payment_method_id}`}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Khóa học trong đơn</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Khóa học</TableHead>
                    <TableHead className="text-right">Đơn giá</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((it) => (
                    <TableRow key={it.id}>
                      <TableCell>
                        {courseName.get(it.course_id) ?? `Khóa #${it.course_id}`}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {fmtVnd(it.unit_price)}₫
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-4 space-y-1 border-t pt-4 text-sm">
                <Row label="Tạm tính" value={`${fmtVnd(order.subtotal_amount)}₫`} />
                {order.discount_amount > 0 && (
                  <Row
                    label="Giảm giá"
                    value={`−${fmtVnd(order.discount_amount)}₫`}
                    className="text-emerald-600"
                  />
                )}
                <div className="flex justify-between border-t pt-2 text-base font-bold">
                  <span>Tổng cộng</span>
                  <span>{fmtVnd(order.total_amount)}₫</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={mono ? "font-mono text-xs break-all" : "font-medium"}>
        {value}
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  className,
}: {
  label: string
  value: string
  className?: string
}) {
  return (
    <div className={`flex justify-between ${className ?? ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular-nums">{value}</span>
    </div>
  )
}
