"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Pencil, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"
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
  archiveCategoriesService,
  archivesService,
  type ListArchivesParams,
} from "@/lib/services"
import type { ArchiveStatus } from "@/lib/types"

type StatusFilter = "all" | ArchiveStatus

const STATUS_BADGE: Record<ArchiveStatus, { label: string; variant: "default" | "secondary" | "outline" }> = {
  published: { label: "Đã xuất bản", variant: "default" },
  draft: { label: "Nháp", variant: "secondary" },
  archived: { label: "Lưu trữ", variant: "outline" },
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—"
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, "0")
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`
}

export default function ArchivesPage() {
  const qc = useQueryClient()
  const [q, setQ] = useState("")
  const [status, setStatus] = useState<StatusFilter>("all")
  const [categoryId, setCategoryId] = useState<string>("all")

  const params: ListArchivesParams = {
    q: q.trim() || undefined,
    status: status === "all" ? undefined : status,
    archive_category_id: categoryId === "all" ? undefined : Number(categoryId),
    limit: 200,
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["archives", params],
    queryFn: () => archivesService.list(params),
  })

  const { data: categories } = useQuery({
    queryKey: ["archive-categories", { limit: 200 }],
    queryFn: () => archiveCategoriesService.list({ limit: 200 }),
  })
  const catName = useMemo(() => {
    const m = new Map<number, string>()
    for (const c of categories ?? []) m.set(c.id, c.name)
    return m
  }, [categories])

  const deleteMutation = useMutation({
    mutationFn: (id: number) => archivesService.remove(id),
    onSuccess: () => {
      toast.success("Đã xóa bài viết")
      qc.invalidateQueries({ queryKey: ["archives"] })
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Xóa thất bại"
      toast.error(msg)
    },
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bài viết"
        description="Quản lý bài viết / cẩm nang hiển thị trên website."
        action={
          <Button render={<Link href="/archives/new" />}>
            <Plus />
            Thêm bài viết
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm theo tiêu đề hoặc slug…"
          className="max-w-sm"
        />
        <Select value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Mọi trạng thái</SelectItem>
            <SelectItem value="published">Đã xuất bản</SelectItem>
            <SelectItem value="draft">Nháp</SelectItem>
            <SelectItem value="archived">Lưu trữ</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "all")}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Mọi danh mục</SelectItem>
            {(categories ?? []).map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
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
              <TableHead>Tiêu đề</TableHead>
              <TableHead className="w-40">Danh mục</TableHead>
              <TableHead className="w-32">Trạng thái</TableHead>
              <TableHead className="w-20 text-right">Lượt xem</TableHead>
              <TableHead className="w-28">Ngày đăng</TableHead>
              <TableHead className="w-24 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : data && data.length > 0 ? (
              data.map((a) => {
                const badge = STATUS_BADGE[a.status]
                return (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-xs">{a.id}</TableCell>
                    <TableCell>
                      <div className="font-medium line-clamp-1">{a.title}</div>
                      <div className="text-xs text-muted-foreground">
                        /{a.slug}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {a.archive_category_id != null
                        ? (catName.get(a.archive_category_id) ?? "—")
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {a.view_count}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {fmtDate(a.published_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          render={
                            <Link
                              href={`/archives/${a.id}/edit`}
                              aria-label="Sửa"
                            />
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
                          title={`Xóa bài viết "${a.title}"?`}
                          description="Hành động không hoàn tác."
                          confirmLabel="Xóa"
                          onConfirm={() => deleteMutation.mutateAsync(a.id)}
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
                  Chưa có bài viết nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
