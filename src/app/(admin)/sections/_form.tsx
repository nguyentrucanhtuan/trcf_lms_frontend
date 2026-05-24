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
import { coursesService, sectionsService } from "@/lib/services"
import type { Section, SectionCreate, SectionUpdate } from "@/lib/types"

const schema = z.object({
  course_id: z.number().int().min(1, "Chọn khóa học"),
  title: z.string().min(1, "Bắt buộc").max(255),
  description: z.string().max(1000).optional().or(z.literal("")),
  position: z.number().int().min(0),
})

export type SectionFormValues = z.infer<typeof schema>

export function SectionForm({
  initial,
  defaultCourseId,
}: {
  initial?: Section
  defaultCourseId?: number
}) {
  const router = useRouter()
  const qc = useQueryClient()
  const isEdit = !!initial

  const coursesQuery = useQuery({
    queryKey: ["courses", { limit: 200 }],
    queryFn: () => coursesService.list({ limit: 200 }),
  })

  const form = useForm<SectionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      course_id: initial?.course_id ?? defaultCourseId ?? 0,
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      position: initial?.position ?? 0,
    },
  })

  const onSubmit = async (values: SectionFormValues) => {
    try {
      if (isEdit && initial) {
        const patch: SectionUpdate = {
          title: values.title,
          description: values.description || null,
          position: values.position,
        }
        await sectionsService.update(initial.id, patch)
        toast.success("Đã cập nhật chương")
      } else {
        if (!values.course_id) {
          form.setError("course_id", { message: "Chọn khóa học" })
          return
        }
        const payload: SectionCreate = {
          course_id: values.course_id,
          title: values.title,
          description: values.description || null,
          position: values.position,
        }
        await sectionsService.create(payload)
        toast.success("Đã tạo chương")
      }
      await qc.invalidateQueries({ queryKey: ["sections"] })
      router.push(`/sections?course_id=${values.course_id}`)
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
                {isEdit
                  ? "Không thể đổi khóa học sau khi tạo chương."
                  : "Mỗi chương thuộc duy nhất một khóa học, không đổi sau khi tạo."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiêu đề chương</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thứ tự (sequence)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  value={field.value}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? 0 : Number(e.target.value),
                    )
                  }
                  onBlur={field.onBlur}
                  name={field.name}
                />
              </FormControl>
              <FormDescription>
                Có thể sắp lại bằng nút lên/xuống trong trang chỉnh sửa khóa
                học.
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
                : "Tạo chương"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Hủy
          </Button>
        </div>
      </form>
    </Form>
  )
}
