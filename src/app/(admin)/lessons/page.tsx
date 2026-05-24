"use client"

import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react"
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
  lessonsService,
  sectionsService,
} from "@/lib/services"
import type { Course, Lesson, Section } from "@/lib/types"

const ALL = "__all__"

function LessonsPageInner() {
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

  const lessonQueries = useQueries({
    queries: courseIds.map((id) => ({
      queryKey: ["lessons", { course_id: id }],
      queryFn: () => lessonsService.list({ course_id: id }),
    })),
  })

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

  const sectionsById = useMemo(() => {
    const m = new Map<number, Section>()
    for (const q of sectionQueries) {
      for (const s of q.data ?? []) m.set(s.id, s)
    }
    return m
  }, [sectionQueries])

  const isLoading =
    coursesQuery.isLoading ||
    lessonQueries.some((q) => q.isLoading && q.isFetching)

  const allLessons: Lesson[] = useMemo(
    () => lessonQueries.flatMap((q) => q.data ?? []),
    [lessonQueries],
  )

  const filtered = useMemo(() => {
    let list = allLessons
    if (courseFilter) list = list.filter((l) => l.course_id === courseFilter)
    return list.slice().sort((a, b) => {
      const ca = coursesById.get(a.course_id)?.name ?? ""
      const cb = coursesById.get(b.course_id)?.name ?? ""
      if (ca !== cb) return ca.localeCompare(cb, "vi")
      const sa = a.section_id
        ? (sectionsById.get(a.section_id)?.position ?? 0)
        : 99999
      const sb = b.section_id
        ? (sectionsById.get(b.section_id)?.position ?? 0)
        : 99999
      if (sa !== sb) return sa - sb
      return a.position - b.position || a.id - b.id
    })
  }, [allLessons, courseFilter, coursesById, sectionsById])

  const deleteMutation = useMutation({
    mutationFn: (id: number) => lessonsService.remove(id),
    onSuccess: () => {
      toast.success("Đã xóa bài học")
      qc.invalidateQueries({ queryKey: ["lessons"] })
    },
    onError: (err) => {
      const msg = err instanceof ApiError ? err.message : "Xóa thất bại"
      toast.error(msg)
    },
  })

  const setCourse = (value: string | null) => {
    if (!value || value === ALL) {
      router.replace("/lessons")
      return
    }
    router.replace(`/lessons?course_id=${value}`)
  }

  const newHref = courseFilter
    ? `/lessons/new?course_id=${courseFilter}`
    : "/lessons/new"

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bài học"
        description="Tất cả bài học của mọi khóa học."
        action={
          <Button render={<Link href={newHref} />}>
            <Plus />
            Thêm bài học
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
              <TableHead>Chương</TableHead>
              <TableHead className="w-16">Thứ tự</TableHead>
              <TableHead>Tiêu đề</TableHead>
              <TableHead className="w-24">Thời lượng</TableHead>
              <TableHead className="w-32">Trạng thái</TableHead>
              <TableHead className="w-24 text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : filtered.length > 0 ? (
              filtered.map((l) => {
                const c = coursesById.get(l.course_id)
                const s = l.section_id
                  ? sectionsById.get(l.section_id)
                  : undefined
                return (
                  <TableRow key={l.id}>
                    <TableCell>
                      <div className="font-medium">{c?.name ?? "—"}</div>
                      {c ? (
                        <div className="text-xs text-muted-foreground">
                          {c.course_code}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-sm">
                      {s ? (
                        s.title
                      ) : (
                        <span className="text-xs text-muted-foreground italic">
                          (không thuộc chương)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {l.position}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{l.title}</div>
                      {l.video_url ? (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {l.video_url}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-sm">
                      {l.duration_minutes != null
                        ? `${l.duration_minutes} phút`
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {l.is_published ? (
                          <Badge variant="default">
                            <Eye className="size-3" /> Published
                          </Badge>
                        ) : (
                          <Badge variant="outline">
                            <EyeOff className="size-3" /> Draft
                          </Badge>
                        )}
                        {l.is_preview ? (
                          <Badge variant="secondary">Preview</Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          render={
                            <Link
                              href={`/lessons/${l.id}/edit`}
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
                          title={`Xóa bài "${l.title}"?`}
                          description="Tiến độ học của học viên sẽ bị xóa theo."
                          confirmLabel="Xóa"
                          onConfirm={() => deleteMutation.mutateAsync(l.id)}
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
                  Chưa có bài học nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default function LessonsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <LessonsPageInner />
    </Suspense>
  )
}
