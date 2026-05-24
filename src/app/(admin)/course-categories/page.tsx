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
import {
  courseCategoriesService,
  type ListCourseCategoriesParams,
} from "@/lib/services"

type ActiveFilter = "all" | "active" | "inactive"

export default function CourseCategoriesPage() {
  const qc = useQueryClient()
  const [q, setQ] = useState("")
  const [active, setActive] = useState<ActiveFilter>("all")

  const params: ListCourseCategoriesParams = {
    q: q.trim() || undefined,
    is_active:
      active === "all" ? undefined : active === "active" ? true : false,
    limit: 200,
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["course-categories", params],
    queryFn: () => courseCategoriesService.list(params),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => courseCategoriesService.remove(id),
    onSuccess: () => {
      toast.success("Đã xóa danh mục")
      qc.invalidateQueries({ queryKey: ["course-categories"] })
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Xóa thất bại"
      toast.error(msg)
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Danh mục khóa học"
        description="Nhóm các khóa học theo chủ đề."
        action={
          <Button render={<Link href="/course-categories/new" />}>
            <Plus />
            Thêm danh mục
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo tên hoặc slug…"
          className="max-w-sm"
        />
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
              <TableHead>Tên</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="w-24">Thứ tự</TableHead>
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
                    <div className="font-medium">{c.name}</div>
                    {c.description ? (
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {c.description}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    /{c.slug}
                  </TableCell>
                  <TableCell>{c.display_order}</TableCell>
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
                          <Link
                            href={`/course-categories/${c.id}/edit`}
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
                        title={`Xóa danh mục "${c.name}"?`}
                        description="Liên kết với các khóa học sẽ bị gỡ. Hành động không hoàn tác."
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
                  Chưa có danh mục nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
