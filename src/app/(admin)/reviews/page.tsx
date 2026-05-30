"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Star, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
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
import { Switch } from "@/components/ui/switch"
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
  reviewsService,
  studentsService,
  type ListReviewsParams,
} from "@/lib/services"

type PublishFilter = "all" | "published" | "hidden"

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < rating
              ? "size-3.5 fill-amber-400 text-amber-400"
              : "size-3.5 text-muted-foreground/30"
          }
        />
      ))}
    </div>
  )
}

export default function ReviewsPage() {
  const qc = useQueryClient()
  const [publish, setPublish] = useState<PublishFilter>("all")

  const params: ListReviewsParams = { published_only: false, limit: 200 }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["reviews", params],
    queryFn: () => reviewsService.list(params),
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

  const { data: students } = useQuery({
    queryKey: ["students", { limit: 200 }],
    queryFn: () => studentsService.list({ limit: 200 }),
  })
  const studentName = useMemo(() => {
    const m = new Map<number, string>()
    for (const s of students ?? []) m.set(s.id, s.full_name)
    return m
  }, [students])

  const rows = useMemo(() => {
    const all = data ?? []
    if (publish === "published") return all.filter((r) => r.is_published)
    if (publish === "hidden") return all.filter((r) => !r.is_published)
    return all
  }, [data, publish])

  const toggle = useMutation({
    mutationFn: ({ id, value }: { id: number; value: boolean }) =>
      reviewsService.update(id, { is_published: value }),
    onSuccess: (_d, v) => {
      toast.success(v.value ? "Đã hiển thị đánh giá" : "Đã ẩn đánh giá")
      qc.invalidateQueries({ queryKey: ["reviews"] })
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Thao tác thất bại"),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => reviewsService.remove(id),
    onSuccess: () => {
      toast.success("Đã xóa đánh giá")
      qc.invalidateQueries({ queryKey: ["reviews"] })
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Xóa thất bại"),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Đánh giá"
        description="Duyệt, ẩn hoặc xóa đánh giá khóa học của học viên."
      />

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={publish}
          onValueChange={(v) => setPublish(v as PublishFilter)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="published">Đang hiển thị</SelectItem>
            <SelectItem value="hidden">Đã ẩn</SelectItem>
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
              <TableHead className="w-32">Học viên</TableHead>
              <TableHead>Khóa học</TableHead>
              <TableHead className="w-28">Đánh giá</TableHead>
              <TableHead>Nội dung</TableHead>
              <TableHead className="w-28">Hiển thị</TableHead>
              <TableHead className="w-16 text-right">Xóa</TableHead>
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
            ) : rows.length > 0 ? (
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.id}</TableCell>
                  <TableCell className="text-sm">
                    {studentName.get(r.student_id) ?? `#${r.student_id}`}
                  </TableCell>
                  <TableCell className="text-sm">
                    {courseName.get(r.course_id) ?? `Khóa #${r.course_id}`}
                  </TableCell>
                  <TableCell>
                    <Stars rating={r.rating} />
                  </TableCell>
                  <TableCell className="max-w-md">
                    {r.title ? (
                      <div className="font-medium text-sm">{r.title}</div>
                    ) : null}
                    {r.comment ? (
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {r.comment}
                      </div>
                    ) : !r.title ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={r.is_published}
                        onCheckedChange={(value) =>
                          toggle.mutate({ id: r.id, value })
                        }
                        aria-label="Hiển thị"
                      />
                      <Badge variant={r.is_published ? "default" : "outline"}>
                        {r.is_published ? "Hiện" : "Ẩn"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <ConfirmDialog
                      trigger={
                        <Button size="icon" variant="ghost" aria-label="Xóa">
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      }
                      title="Xóa đánh giá này?"
                      description="Hành động không hoàn tác."
                      confirmLabel="Xóa"
                      onConfirm={() => deleteMutation.mutateAsync(r.id)}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  Chưa có đánh giá nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
