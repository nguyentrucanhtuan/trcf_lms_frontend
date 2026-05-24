"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
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
import { Switch } from "@/components/ui/switch"
import { ApiError } from "@/lib/api"
import { usersService } from "@/lib/services"
import type { User, UserRole } from "@/lib/types"

const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
  role: z.enum(["admin", "teacher", "student"]),
  is_active: z.boolean(),
  password: z.string(),
})

export type UserFormValues = z.infer<typeof schema>

export function UserForm({ initial }: { initial?: User }) {
  const router = useRouter()
  const qc = useQueryClient()
  const isEdit = !!initial

  const form = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: initial?.email ?? "",
      password: "",
      role: (initial?.role as UserRole) ?? "student",
      is_active: initial?.is_active ?? true,
    },
  })

  const onSubmit = async (values: UserFormValues) => {
    if (!isEdit && values.password.length < 8) {
      form.setError("password", { message: "Mật khẩu tối thiểu 8 ký tự" })
      return
    }
    if (isEdit && values.password.length > 0 && values.password.length < 8) {
      form.setError("password", { message: "Mật khẩu tối thiểu 8 ký tự" })
      return
    }
    try {
      if (isEdit && initial) {
        const patch: Record<string, unknown> = {
          email: values.email,
          role: values.role,
          is_active: values.is_active,
        }
        if (values.password.length > 0) {
          patch.password = values.password
        }
        await usersService.update(initial.id, patch)
        toast.success("Đã cập nhật người dùng")
      } else {
        await usersService.create({
          email: values.email,
          password: values.password,
          role: values.role,
          is_active: values.is_active,
        })
        toast.success("Đã tạo người dùng")
      }
      await qc.invalidateQueries({ queryKey: ["users"] })
      router.push("/users")
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Có lỗi xảy ra"
      toast.error(msg)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid max-w-xl gap-4"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="off" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {isEdit ? "Mật khẩu mới (tùy chọn)" : "Mật khẩu"}
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder={isEdit ? "Để trống nếu không đổi" : ""}
                  {...field}
                />
              </FormControl>
              {isEdit ? (
                <FormDescription>
                  Để trống nếu không muốn đổi mật khẩu.
                </FormDescription>
              ) : null}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vai trò</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Kích hoạt</FormLabel>
                <FormDescription>
                  Tài khoản bị tắt sẽ không thể đăng nhập.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? "Đang lưu…"
              : isEdit
                ? "Lưu thay đổi"
                : "Tạo người dùng"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Hủy
          </Button>
        </div>
      </form>
    </Form>
  )
}
