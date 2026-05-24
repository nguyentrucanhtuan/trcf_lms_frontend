"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import { courseCategoriesService, coursesService } from "@/lib/services"
import type { Course, CourseCreate, CourseUpdate } from "@/lib/types"

const schema = z.object({
  course_code: z.string().min(1, "Bắt buộc").max(64),
  name: z.string().min(1, "Bắt buộc").max(255),
  slug: z.string().max(255).optional().or(z.literal("")),
  description: z.string().max(1000).optional().or(z.literal("")),
  content: z.string().optional().or(z.literal("")),
  thumbnail_url: z.string().max(500).optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]),
  price: z.number().int().min(0, "Giá không âm"),
  sale_price: z.number().int().min(0).nullable(),
  category_ids: z.array(z.number()).optional(),
})

export type CourseFormValues = z.infer<typeof schema>

export function CourseForm({ initial }: { initial?: Course }) {
  const router = useRouter()
  const qc = useQueryClient()
  const isEdit = !!initial

  const categoriesQuery = useQuery({
    queryKey: ["course-categories", "all"],
    queryFn: () => courseCategoriesService.list(),
  })

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      course_code: initial?.course_code ?? "",
      name: initial?.name ?? "",
      slug: initial?.slug ?? "",
      description: initial?.description ?? "",
      content: initial?.content ?? "",
      thumbnail_url: initial?.thumbnail_url ?? "",
      status: initial?.status ?? "draft",
      price: initial?.price ?? 0,
      sale_price: initial?.sale_price ?? null,
      category_ids: initial?.categories.map((c) => c.id) ?? [],
    },
  })

  const onSubmit = async (values: CourseFormValues) => {
    const payload: CourseCreate | CourseUpdate = {
      course_code: values.course_code,
      name: values.name,
      slug: values.slug || null,
      description: values.description || null,
      content: values.content || null,
      thumbnail_url: values.thumbnail_url || null,
      status: values.status,
      price: values.price,
      sale_price: values.sale_price,
      category_ids: values.category_ids ?? [],
    }
    try {
      if (isEdit && initial) {
        await coursesService.update(initial.id, payload as CourseUpdate)
        toast.success("Đã cập nhật khóa học")
      } else {
        await coursesService.create(payload as CourseCreate)
        toast.success("Đã tạo khóa học")
      }
      await qc.invalidateQueries({ queryKey: ["courses"] })
      router.push("/courses")
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Có lỗi xảy ra"
      toast.error(msg)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid max-w-3xl gap-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="course_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mã khóa học</FormLabel>
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
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên khóa học</FormLabel>
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
              <FormLabel>Mô tả ngắn</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nội dung chi tiết</FormLabel>
              <FormControl>
                <Textarea rows={6} {...field} />
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

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giá (VND)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={1000}
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
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sale_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Giá khuyến mãi</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    step={1000}
                    placeholder="Để trống nếu không giảm giá"
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? null : Number(e.target.value),
                      )
                    }
                    onBlur={field.onBlur}
                    name={field.name}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="category_ids"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Danh mục</FormLabel>
              <FormDescription>
                Chọn một hoặc nhiều danh mục cho khóa học.
              </FormDescription>
              <div className="grid gap-2 sm:grid-cols-2">
                {categoriesQuery.isLoading ? (
                  <span className="text-xs text-muted-foreground">
                    Đang tải danh mục…
                  </span>
                ) : categoriesQuery.data && categoriesQuery.data.length > 0 ? (
                  categoriesQuery.data.map((cat) => {
                    const checked = field.value?.includes(cat.id) ?? false
                    return (
                      <label
                        key={cat.id}
                        className="flex items-center gap-2 rounded-md border p-2 text-sm"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(c) => {
                            const next = new Set(field.value ?? [])
                            if (c) next.add(cat.id)
                            else next.delete(cat.id)
                            field.onChange(Array.from(next))
                          }}
                        />
                        <span>{cat.name}</span>
                      </label>
                    )
                  })
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Chưa có danh mục nào.
                  </span>
                )}
              </div>
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
                : "Tạo khóa học"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Hủy
          </Button>
        </div>
      </form>
    </Form>
  )
}
