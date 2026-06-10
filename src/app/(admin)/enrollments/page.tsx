"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Pencil, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useMemo } from "react"
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
  coursesService,
  enrollmentsService,
  studentsService,
  type ListEnrollmentsParams,
} from "@/lib/services"
import type { Course, EnrollmentStatus, Student } from "@/lib/types"

const ALL = "__all__"

const STATUS_VARIANT: Record<
  EnrollmentStatus,
  "default" | "secondary" | "outline"
> = {
  active: "default",
  completed: "secondary",
  cancelled: "outline",
}

function EnrollmentsPageInner() {
  const router = useRouter()
  const qc = useQueryClient()
  const searchParams = useSearchParams()

  const courseIdParam = searchParams.get("course_id")
  const studentIdParam = searchParams.get("student_id")
  const statusParam = searchParams.get("status")
  const activeParam = searchParams.get("active_only")

  const courseFilter = courseIdParam ? Number(courseIdParam) : null
  const studentFilter = studentIdParam ? Number(studentIdParam) : null
  const statusFilter = (statusParam as EnrollmentStatus | null) ?? null
  const activeOnly = activeParam === "1"

  const params: ListEnrollmentsParams = {
    course_id: courseFilter ?? undefined,
    student_id: studentFilter ?? undefined,
    status: statusFilter ?? undefined,
    active_only: activeOnly || undefined,
    limit: 200,
  }

  const enrollmentsQuery = useQuery({
    queryKey: ["enrollments", params],
    queryFn: () => enrollmentsService.list(params),
  })

  const coursesQuery = useQuery({
    queryKey: ["courses", { limit: 200 }],
    queryFn: () => coursesService.list({ limit: 200 }),
  })

  const studentsQuery = useQuery({
    queryKey: ["students", { limit: 1000 }],
    queryFn: () => studentsService.list({ limit: 1000 }),
  })

  const coursesById = useMemo(() => {
    const m = new Map<number, Course>()
    for (const c of coursesQuery.data ?? []) m.set(c.id, c)
    return m
  }, [coursesQuery.data])

  const studentsById = useMemo(() => {
    const m = new Map<number, Student>()
    for (const s of studentsQuery.data ?? []) m.set(s.id, s)
    return m
  }, [studentsQuery.data])

  const deleteMutation = useMutation({
    mutationFn: (id: number) => enrollmentsService.remove(id),
    onSuccess: () => {
      toast.success("Đã xóa ghi danh")
      qc.invalidateQueries({ queryKey: ["enrollments"] })
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Xóa thất bại"
      toast.error(msg)
    },
  })

  const updateFilter = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams.toString())
    if (!value || value === ALL) next.delete(key)
    else next.set(key, value)
    const qs = next.toString()
    router.replace(qs ? `/enrollments?${qs}` : "/enrollments")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ghi danh"
        description="Quản lý việc ghi danh của học viên vào khóa học."
        action={
          <Button render={<Link href="/enrollments/new" />}>
            <Plus />
            Thêm ghi danh
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-[240px]">
          <Select
            value={courseFilter ? String(courseFilter) : ALL}
            onValueChange={(v) => updateFilter("course_id", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Khóa học…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tất cả khóa học</SelectItem>
              {coursesQuery.data?.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}{" "}
                  <span className="text-xs text-muted-foreground">
                    ({c.course_code})
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[240px]">
          <Select
            value={studentFilter ? String(studentFilter) : ALL}
            onValueChange={(v) => updateFilter("student_id", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Học viên…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tất cả học viên</SelectItem>
              {studentsQuery.data?.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.full_name}{" "}
                  <span className="text-xs text-muted-foreground">
                    ({s.student_code})
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[160px]">
          <Select
            value={statusFilter ?? ALL}
            onValueChange={(v) => updateFilter("status", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Trạng thái…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[160px]">
          <Select
            value={activeOnly ? "1" : ALL}
            onValueChange={(v) => updateFilter("active_only", v === "1" ? "1" : null)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Bao gồm hết hạn</SelectItem>
              <SelectItem value="1">Chỉ còn hiệu lực</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {enrollmentsQuery.isFetching ? (
          <span className="text-xs text-muted-foreground">Đang tải…</span>
        ) : null}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">ID</TableHead>
              <TableHead>Học viên</TableHead>
              <TableHead>Khóa học</TableHead>
              <TableHead className="w-32">Trạng thái</TableHead>
              <TableHead className="w-44">Ghi danh lúc</TableHead>
              <TableHead className="w-44">Hết hạn</TableHead>
              <TableHead className="w-24 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollmentsQuery.isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : enrollmentsQuery.data && enrollmentsQuery.data.length > 0 ? (
              enrollmentsQuery.data.map((e) => {
                const c = coursesById.get(e.course_id)
                const s = studentsById.get(e.student_id)
                const expiresAt = e.expires_at ? new Date(e.expires_at) : null
                const expired = expiresAt ? expiresAt.getTime() < Date.now() : false
                return (
                  <TableRow key={e.id}>
                    <TableCell className="font-mono text-xs">{e.id}</TableCell>
                    <TableCell>
                      {s ? (
                        <>
                          <div className="font-medium">{s.full_name}</div>
                          <div className="text-xs text-muted-foreground">
                            {s.student_code}
                            {s.email ? ` · ${s.email}` : ""}
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          student_id={e.student_id}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {c ? (
                        <>
                          <div className="font-medium">{c.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {c.course_code}
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          course_id={e.course_id}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[e.status]}>
                        {e.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(e.enrolled_at).toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell className="text-xs">
                      {expiresAt ? (
                        <span
                          className={
                            expired ? "text-destructive" : "text-muted-foreground"
                          }
                        >
                          {expiresAt.toLocaleString("vi-VN")}
                          {expired ? " (hết hạn)" : ""}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          render={
                            <Link
                              href={`/enrollments/${e.id}/edit`}
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
                          title="Xóa ghi danh?"
                          description="Hành động này không thể hoàn tác."
                          confirmLabel="Xóa"
                          onConfirm={() => deleteMutation.mutateAsync(e.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  Chưa có ghi danh nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default function EnrollmentsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <EnrollmentsPageInner />
    </Suspense>
  )
}
