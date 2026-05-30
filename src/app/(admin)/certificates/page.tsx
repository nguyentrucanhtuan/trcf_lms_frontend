"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Award, Plus, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { ConfirmDialog } from "@/components/confirm-dialog"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
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
  certificatesService,
  coursesService,
  studentsService,
} from "@/lib/services"

function fmtDate(iso: string): string {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, "0")
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`
}

export default function CertificatesPage() {
  const qc = useQueryClient()

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["certificates", { limit: 200 }],
    queryFn: () => certificatesService.list({ limit: 200 }),
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

  const deleteMutation = useMutation({
    mutationFn: (id: number) => certificatesService.remove(id),
    onSuccess: () => {
      toast.success("Đã thu hồi chứng chỉ")
      qc.invalidateQueries({ queryKey: ["certificates"] })
    },
    onError: (err) =>
      toast.error(err instanceof ApiError ? err.message : "Xóa thất bại"),
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chứng chỉ"
        description="Cấp và quản lý chứng chỉ hoàn thành khóa học."
        action={
          <IssueDialog
            courses={courses ?? []}
            students={students ?? []}
            onDone={() =>
              qc.invalidateQueries({ queryKey: ["certificates"] })
            }
          />
        }
      />

      {isFetching ? (
        <span className="text-xs text-muted-foreground">Đang tải…</span>
      ) : null}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">ID</TableHead>
              <TableHead>Mã chứng chỉ</TableHead>
              <TableHead className="w-40">Học viên</TableHead>
              <TableHead>Khóa học</TableHead>
              <TableHead className="w-32">Ngày cấp</TableHead>
              <TableHead className="w-16 text-right">Thu hồi</TableHead>
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
                  <TableCell className="font-mono text-xs break-all">
                    {c.certificate_code}
                  </TableCell>
                  <TableCell className="text-sm">
                    {studentName.get(c.student_id) ?? `#${c.student_id}`}
                  </TableCell>
                  <TableCell className="text-sm">
                    {courseName.get(c.course_id) ?? `Khóa #${c.course_id}`}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {fmtDate(c.issued_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <ConfirmDialog
                      trigger={
                        <Button size="icon" variant="ghost" aria-label="Thu hồi">
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      }
                      title="Thu hồi chứng chỉ này?"
                      description="Chứng chỉ sẽ bị xóa và mã xác thực không còn hợp lệ."
                      confirmLabel="Thu hồi"
                      onConfirm={() => deleteMutation.mutateAsync(c.id)}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  Chưa cấp chứng chỉ nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function IssueDialog({
  courses,
  students,
  onDone,
}: {
  courses: { id: number; name: string }[]
  students: { id: number; full_name: string }[]
  onDone: () => void
}) {
  const [open, setOpen] = useState(false)
  const [studentId, setStudentId] = useState("")
  const [courseId, setCourseId] = useState("")
  const [notes, setNotes] = useState("")
  const [requireComplete, setRequireComplete] = useState(false)
  const [busy, setBusy] = useState(false)

  const reset = () => {
    setStudentId("")
    setCourseId("")
    setNotes("")
    setRequireComplete(false)
  }

  const submit = async () => {
    if (!studentId || !courseId) {
      toast.error("Chọn học viên và khóa học.")
      return
    }
    setBusy(true)
    try {
      if (requireComplete) {
        await certificatesService.autoIssue(Number(studentId), Number(courseId))
      } else {
        await certificatesService.issue({
          student_id: Number(studentId),
          course_id: Number(courseId),
          notes: notes.trim() || null,
        })
      }
      toast.success("Đã cấp chứng chỉ")
      onDone()
      reset()
      setOpen(false)
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Cấp chứng chỉ thất bại")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) reset()
      }}
    >
      <DialogTrigger
        render={
          <Button>
            <Plus />
            Cấp chứng chỉ
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cấp chứng chỉ</DialogTitle>
          <DialogDescription>
            Cấp chứng chỉ hoàn thành cho học viên ở một khóa học cụ thể.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Học viên</Label>
            <Select value={studentId} onValueChange={(v) => setStudentId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn học viên" />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.full_name} (#{s.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Khóa học</Label>
            <Select value={courseId} onValueChange={(v) => setCourseId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn khóa học" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-start justify-between gap-3 rounded-md border p-3">
            <div className="space-y-0.5">
              <Label>Chỉ cấp khi đã hoàn thành</Label>
              <p className="text-xs text-muted-foreground">
                Kiểm tra tiến độ — chỉ cấp nếu học viên đã hoàn thành 100% bài học.
              </p>
            </div>
            <Switch
              checked={requireComplete}
              onCheckedChange={setRequireComplete}
            />
          </div>

          {!requireComplete && (
            <div className="grid gap-2">
              <Label>Ghi chú (tùy chọn)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ví dụ: cấp thủ công cho lớp offline…"
                rows={2}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>
            Hủy
          </Button>
          <Button onClick={submit} disabled={busy}>
            <Award className="size-4" />
            Cấp chứng chỉ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
