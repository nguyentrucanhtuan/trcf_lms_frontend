"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ApiError } from "@/lib/api"
import {
  coursesService,
  enrollmentsService,
  studentsService,
} from "@/lib/services"
import type {
  Enrollment,
  EnrollmentCreate,
  EnrollmentStatus,
  EnrollmentUpdate,
} from "@/lib/types"

const schema = z.object({
  student_id: z.number().int().min(1, "Chọn học viên"),
  course_id: z.number().int().min(1, "Chọn khóa học"),
  status: z.enum(["active", "completed", "cancelled"]),
  expires_at: z.string().optional().or(z.literal("")),
})

export type EnrollmentFormValues = z.infer<typeof schema>

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return ""
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function EnrollmentForm({
  initial,
  defaultStudentId,
  defaultCourseId,
}: {
  initial?: Enrollment
  defaultStudentId?: number
  defaultCourseId?: number
}) {
  const router = useRouter()
  const qc = useQueryClient()
  const isEdit = !!initial

  const form = useForm<EnrollmentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      student_id: initial?.student_id ?? defaultStudentId ?? 0,
      course_id: initial?.course_id ?? defaultCourseId ?? 0,
      status: (initial?.status as EnrollmentStatus) ?? "active",
      expires_at: toDatetimeLocal(initial?.expires_at),
    },
  })

  const studentsQuery = useQuery({
    queryKey: ["students", { limit: 500 }],
    queryFn: () => studentsService.list({ limit: 500 }),
  })

  const coursesQuery = useQuery({
    queryKey: ["courses", { limit: 200 }],
    queryFn: () => coursesService.list({ limit: 200 }),
  })

  const onSubmit = async (values: EnrollmentFormValues) => {
    const expiresIso = values.expires_at
      ? new Date(values.expires_at).toISOString()
      : null
    try {
      if (isEdit && initial) {
        const patch: EnrollmentUpdate = {
          status: values.status,
          expires_at: expiresIso,
        }
        await enrollmentsService.update(initial.id, patch)
        toast.success("Đã cập nhật ghi danh")
      } else {
        const payload: EnrollmentCreate = {
          student_id: values.student_id,
          course_id: values.course_id,
          status: values.status,
          expires_at: expiresIso,
        }
        await enrollmentsService.create(payload)
        toast.success("Đã tạo ghi danh")
      }
      await qc.invalidateQueries({ queryKey: ["enrollments"] })
      router.push("/enrollments")
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Có lỗi xảy ra"
      toast.error(msg)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid max-w-2xl gap-4"
      >
        <FormField
          control={form.control}
          name="student_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Học viên</FormLabel>
              <Select
                value={field.value ? String(field.value) : undefined}
                onValueChange={(v) => field.onChange(Number(v))}
                disabled={isEdit}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn học viên" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {studentsQuery.data?.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.full_name} ({s.student_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                {isEdit
                  ? "Không thể đổi học viên sau khi tạo ghi danh."
                  : "Mỗi học viên chỉ ghi danh được một lần vào mỗi khóa."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="course_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Khóa học</FormLabel>
              <Select
                value={field.value ? String(field.value) : undefined}
                onValueChange={(v) => field.onChange(Number(v))}
                disabled={isEdit}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khóa học" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {coursesQuery.data?.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name} ({c.course_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                {isEdit ? "Không thể đổi khóa học sau khi tạo ghi danh." : null}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Trạng thái</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expires_at"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ngày hết hạn</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormDescription>
                Để trống nếu ghi danh không hết hạn.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "Đang lưu…"
              : isEdit
                ? "Lưu thay đổi"
                : "Tạo ghi danh"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Hủy
          </Button>
        </div>
      </form>
    </Form>
  )
}
