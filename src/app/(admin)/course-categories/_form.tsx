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
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ApiError } from "@/lib/api"
import { courseCategoriesService } from "@/lib/services"
import type {
  CourseCategory,
  CourseCategoryCreate,
  CourseCategoryUpdate,
} from "@/lib/types"

const schema = z.object({
  name: z.string().min(1, "Bắt buộc").max(255),
  slug: z.string().max(255).optional().or(z.literal("")),
  description: z.string().max(1000).optional().or(z.literal("")),
  thumbnail_url: z.string().max(500).optional().or(z.literal("")),
  display_order: z.number().int().min(0),
  is_active: z.boolean(),
})

export type CourseCategoryFormValues = z.infer<typeof schema>

export function CourseCategoryForm({ initial }: { initial?: CourseCategory }) {
  const router = useRouter()
  const qc = useQueryClient()
  const isEdit = !!initial

  const form = useForm<CourseCategoryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? "",
      slug: initial?.slug ?? "",
      description: initial?.description ?? "",
      thumbnail_url: initial?.thumbnail_url ?? "",
      display_order: initial?.display_order ?? 0,
      is_active: initial?.is_active ?? true,
    },
  })

  const onSubmit = async (values: CourseCategoryFormValues) => {
    const payload: CourseCategoryCreate | CourseCategoryUpdate = {
      name: values.name,
      slug: values.slug || null,
      description: values.description || null,
      thumbnail_url: values.thumbnail_url || null,
      display_order: values.display_order,
      is_active: values.is_active,
    }
    try {
      if (isEdit && initial) {
        await courseCategoriesService.update(
          initial.id,
          payload as CourseCategoryUpdate,
        )
        toast.success("Đã cập nhật danh mục")
      } else {
        await courseCategoriesService.create(payload as CourseCategoryCreate)
        toast.success("Đã tạo danh mục")
      }
      await qc.invalidateQueries({ queryKey: ["course-categories"] })
      router.push("/course-categories")
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên danh mục</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="Tự sinh từ tên nếu bỏ trống" {...field} />
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
          name="thumbnail_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ảnh đại diện (URL)</FormLabel>
              <FormControl>
                <Input placeholder="https://…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="display_order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thứ tự hiển thị</FormLabel>
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
                Số nhỏ hơn hiển thị trước.
              </FormDescription>
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
                  Danh mục bị tắt sẽ không hiển thị trên frontend.
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
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "Đang lưu…"
              : isEdit
                ? "Lưu thay đổi"
                : "Tạo danh mục"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Hủy
          </Button>
        </div>
      </form>
    </Form>
  )
}
