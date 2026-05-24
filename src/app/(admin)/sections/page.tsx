"use client"

import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { Pencil, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useMemo } from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { PageHeader } from "@/components/page-header"
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
import { coursesService, sectionsService } from "@/lib/services"
import type { Course, Section } from "@/lib/types"

const ALL = "__all__"

function SectionsPageInner() {
  const router = useRouter()
  const qc = useQueryClient()
  const searchParams = useSearchParams()
  const courseIdParam = searchParams.get("course_id")
  const courseFilter = courseIdParam ? Number(courseIdParam) : null

  const coursesQuery = useQuery({
    queryKey: ["courses", { limit: 200 }],
    queryFn: () => coursesService.list({ limit: 200 }),
  })

  const courseIds = useMemo(
    () => coursesQuery.data?.map((c) => c.id) ?? [],
    [coursesQuery.data],
  )

  const sectionQueries = useQueries({
    queries: courseIds.map((id) => ({
      queryKey: ["sections", { course_id: id }],
      queryFn: () => sectionsService.listByCourse(id),
    })),
  })

  const coursesById = useMemo(() => {
    const m = new Map<number, Course>()
    for (const c of coursesQuery.data ?? []) m.set(c.id, c)
    return m
  }, [coursesQuery.data])

  const isLoading =
    coursesQuery.isLoading ||
    sectionQueries.some((q) => q.isLoading && q.isFetching)

  const allSections: Section[] = useMemo(() => {
    const list = sectionQueries.flatMap((q) => q.data ?? [])
    return list
  }, [sectionQueries])

  const filtered = useMemo(() => {
    let list = allSections
    if (courseFilter) list = list.filter((s) => s.course_id === courseFilter)
    return list.slice().sort((a, b) => {
      const ca = coursesById.get(a.course_id)?.name ?? ""
      const cb = coursesById.get(b.course_id)?.name ?? ""
      if (ca !== cb) return ca.localeCompare(cb, "vi")
      return a.position - b.position || a.id - b.id
    })
  }, [allSections, courseFilter, coursesById])

  const deleteMutation = useMutation({
    mutationFn: (id: number) => sectionsService.remove(id),
    onSuccess: () => {
      toast.success("Đã xóa chương")
      qc.invalidateQueries({ queryKey: ["sections"] })
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Xóa thất bại"
      toast.error(msg)
    },
  })

  const setCourse = (value: string | null) => {
    if (!value || value === ALL) {
      router.replace("/sections")
      return
    }
    router.replace(`/sections?course_id=${value}`)
  }

  const newHref = courseFilter
    ? `/sections/new?course_id=${courseFilter}`
    : "/sections/new"

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chương (Section)"
        description="Tất cả chương của mọi khóa học. Sắp xếp thứ tự trong trang Sửa khóa học."
        action={
          <Button render={<Link href={newHref} />}>
            <Plus />
            Thêm chương
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-[280px]">
          <Select
            value={courseFilter ? String(courseFilter) : ALL}
            onValueChange={setCourse}
          >
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo khóa học…" />
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
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Khóa học</TableHead>
              <TableHead className="w-16">Thứ tự</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead className="w-24">Số bài</TableHead>
              <TableHead className="w-24 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={5}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : filtered.length > 0 ? (
              filtered.map((s) => {
                const c = coursesById.get(s.course_id)
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="font-medium">{c?.name ?? "—"}</div>
                      {c ? (
                        <div className="text-xs text-muted-foreground">
                          {c.course_code}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {s.position}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{s.title}</div>
                      {s.description ? (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {s.description}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-sm">
                      {s.lessons?.length ?? 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          render={
                            <Link
                              href={`/sections/${s.id}/edit`}
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
                          title={`Xóa chương "${s.title}"?`}
                          description="Bài học bên trong sẽ chuyển thành 'không thuộc chương' chứ không bị xóa."
                          confirmLabel="Xóa"
                          onConfirm={() => deleteMutation.mutateAsync(s.id)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  Chưa có chương nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default function SectionsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <SectionsPageInner />
    </Suspense>
  )
}
