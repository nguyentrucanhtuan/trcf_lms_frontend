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
import { studentsService, type ListStudentsParams } from "@/lib/services"
import type { StudentStatus } from "@/lib/types"

const STATUS_VARIANT: Record<StudentStatus, "default" | "secondary" | "outline"> = {
  active: "default",
  inactive: "outline",
  graduated: "secondary",
}

const GENDER_LABEL: Record<string, string> = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
}

export default function StudentsPage() {
  const qc = useQueryClient()
  const [q, setQ] = useState("")
  const [statusFilter, setStatusFilter] = useState<StudentStatus | "all">(
    "all",
  )

  const params: ListStudentsParams = {
    q: q.trim() || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
    limit: 100,
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["students", params],
    queryFn: () => studentsService.list(params),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => studentsService.remove(id),
    onSuccess: () => {
      toast.success("Đã xóa học viên")
      qc.invalidateQueries({ queryKey: ["students"] })
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Xóa thất bại"
      toast.error(msg)
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Học viên"
        description="Quản lý hồ sơ học viên."
        action={
          <Button render={<Link href="/students/new" />}>
            <Plus />
            Thêm học viên
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo tên hoặc mã học viên…"
          className="max-w-sm"
        />
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StudentStatus | "all")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="graduated">Graduated</SelectItem>
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
              <TableHead className="w-20">Mã</TableHead>
              <TableHead>Họ tên</TableHead>
              <TableHead>SĐT</TableHead>
              <TableHead>Giới tính</TableHead>
              <TableHead>Ngày sinh</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-24 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : data && data.length > 0 ? (
              data.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs">
                    {s.student_code}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{s.full_name}</div>
                    <div className="text-xs text-muted-foreground">
                      user_id={s.user_id}
                    </div>
                  </TableCell>
                  <TableCell>{s.phone || "—"}</TableCell>
                  <TableCell>{GENDER_LABEL[s.gender] ?? s.gender}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {s.date_of_birth
                      ? new Date(s.date_of_birth).toLocaleDateString("vi-VN")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[s.status]}>{s.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        render={
                          <Link
                            href={`/students/${s.id}/edit`}
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
                        title={`Xóa học viên "${s.full_name}"?`}
                        description="Bị chặn nếu có enrollments hoặc orders liên quan."
                        confirmLabel="Xóa"
                        onConfirm={() => deleteMutation.mutateAsync(s.id)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  Chưa có học viên nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
