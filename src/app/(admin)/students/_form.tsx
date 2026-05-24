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
import { Textarea } from "@/components/ui/textarea"
import { ApiError } from "@/lib/api"
import { studentsService, usersService } from "@/lib/services"
import type {
  Student,
  StudentCreate,
  StudentUpdate,
} from "@/lib/types"

const schema = z.object({
  user_id: z.number().int().min(1, "Chọn tài khoản"),
  student_code: z.string().min(1, "Bắt buộc").max(32),
  full_name: z.string().min(1, "Bắt buộc").max(255),
  phone: z.string().max(20).optional().or(z.literal("")),
  date_of_birth: z.string().optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other"]),
  address: z.string().max(500).optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "graduated"]),
  enrollment_date: z.string().optional().or(z.literal("")),
})

export type StudentFormValues = z.infer<typeof schema>

export function StudentForm({ initial }: { initial?: Student }) {
  const router = useRouter()
  const qc = useQueryClient()
  const isEdit = !!initial

  // Only fetch students users for the create form's user picker
  const studentUsersQuery = useQuery({
    queryKey: ["users", { role: "student", for: "student-picker" }],
    queryFn: () =>
      usersService.list({ role: "student", limit: 200, is_active: true }),
    enabled: !isEdit,
  })

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      user_id: initial?.user_id ?? 0,
      student_code: initial?.student_code ?? "",
      full_name: initial?.full_name ?? "",
      phone: initial?.phone ?? "",
      date_of_birth: initial?.date_of_birth ?? "",
      gender: initial?.gender ?? "other",
      address: initial?.address ?? "",
      status: initial?.status ?? "active",
      enrollment_date: initial?.enrollment_date ?? "",
    },
  })

  const onSubmit = async (values: StudentFormValues) => {
    const base = {
      student_code: values.student_code,
      full_name: values.full_name,
      phone: values.phone || null,
      date_of_birth: values.date_of_birth || null,
      gender: values.gender,
      address: values.address || null,
      status: values.status,
      enrollment_date: values.enrollment_date || null,
    }
    try {
      if (isEdit && initial) {
        await studentsService.update(initial.id, base as StudentUpdate)
        toast.success("Đã cập nhật học viên")
      } else {
        if (!values.user_id) {
          form.setError("user_id", { message: "Chọn tài khoản người dùng" })
          return
        }
        await studentsService.create({
          ...base,
          user_id: values.user_id,
        } as StudentCreate)
        toast.success("Đã tạo học viên")
      }
      await qc.invalidateQueries({ queryKey: ["students"] })
      router.push("/students")
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
        {!isEdit ? (
          <FormField
            control={form.control}
            name="user_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tài khoản người dùng</FormLabel>
                <Select
                  value={field.value ? String(field.value) : undefined}
                  onValueChange={(v) => field.onChange(Number(v))}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn user role=student" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {studentUsersQuery.isLoading ? (
                      <div className="px-2 py-1 text-xs text-muted-foreground">
                        Đang tải…
                      </div>
                    ) : studentUsersQuery.data &&
                      studentUsersQuery.data.length > 0 ? (
                      studentUsersQuery.data.map((u) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          {u.email} (id={u.id})
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1 text-xs text-muted-foreground">
                        Không có user role=student chưa gắn hồ sơ.
                      </div>
                    )}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Chỉ những user có role=student mới được chọn. Mỗi user gắn
                  duy nhất một hồ sơ học viên.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="student_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mã học viên</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
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
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="graduated">Graduated</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Họ tên</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giới tính</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Nam</SelectItem>
                    <SelectItem value="female">Nữ</SelectItem>
                    <SelectItem value="other">Khác</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="date_of_birth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ngày sinh</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="enrollment_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ngày nhập học</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Địa chỉ</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
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
                : "Tạo học viên"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Hủy
          </Button>
        </div>
      </form>
    </Form>
  )
}
