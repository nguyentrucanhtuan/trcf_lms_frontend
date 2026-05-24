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
import { coursesService, type ListCoursesParams } from "@/lib/services"
import type { CourseStatus } from "@/lib/types"

const STATUS_VARIANT: Record<CourseStatus, "default" | "secondary" | "outline"> = {
  draft: "outline",
  published: "default",
  archived: "secondary",
}

const formatPrice = (n: number) =>
  new Intl.NumberFormat("vi-VN").format(n) + "₫"

export default function CoursesPage() {
  const qc = useQueryClient()
  const [q, setQ] = useState("")
  const [statusFilter, setStatusFilter] = useState<CourseStatus | "all">("all")

  const params: ListCoursesParams = {
    q: q.trim() || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    limit: 100,
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["courses", params],
    queryFn: () => coursesService.list(params),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => coursesService.remove(id),
    onSuccess: () => {
      toast.success("Đã xóa khóa học")
      qc.invalidateQueries({ queryKey: ["courses"] })
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Xóa thất bại"
      toast.error(msg)
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Khóa học"
        description="Quản lý các khóa học trên nền tảng."
        action={
          <Button render={<Link href="/courses/new" />}>
            <Plus />
            Thêm khóa học
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo tên, mã, slug…"
          className="max-w-sm"
        />
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as CourseStatus | "all")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
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
              <TableHead className="w-16">Mã</TableHead>
              <TableHead>Tên</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Trạng thái</TableHead>
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
                  <TableCell className="font-mono text-xs">
                    {c.course_code}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">
                      /{c.slug}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {c.categories.length === 0 ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        c.categories.map((cat) => (
                          <Badge key={cat.id} variant="outline">
                            {cat.name}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {c.sale_price !== null && c.sale_price !== undefined ? (
                      <div>
                        <div className="font-medium">
                          {formatPrice(c.sale_price)}
                        </div>
                        <div className="text-xs text-muted-foreground line-through">
                          {formatPrice(c.price)}
                        </div>
                      </div>
                    ) : (
                      <div className="font-medium">{formatPrice(c.price)}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[c.status]}>{c.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        render={
                          <Link
                            href={`/courses/${c.id}/edit`}
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
                        title={`Xóa khóa học "${c.name}"?`}
                        description="Sẽ xóa cả sections/lessons liên quan. Đơn hàng và enrollment hiện có sẽ chặn xóa."
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
                  Chưa có khóa học nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
