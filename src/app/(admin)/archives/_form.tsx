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
import { getStoredUser } from "@/lib/auth"
import { archiveCategoriesService, archivesService } from "@/lib/services"
import type {
  Archive,
  ArchiveCreate,
  ArchiveStatus,
  ArchiveUpdate,
} from "@/lib/types"

const NONE = "none"

const schema = z.object({
  title: z.string().min(1, "Bắt buộc").max(255),
  slug: z.string().max(255).optional().or(z.literal("")),
  excerpt: z.string().max(1000).optional().or(z.literal("")),
  content: z.string().optional().or(z.literal("")),
  thumbnail_url: z.string().max(500).optional().or(z.literal("")),
  archive_category_id: z.string(),
  status: z.enum(["draft", "published", "archived"]),
  published_at: z.string().optional().or(z.literal("")),
})

export type ArchiveFormValues = z.infer<typeof schema>

/** ISO string → value for <input type="datetime-local"> (local time). */
function toLocalInput(iso: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

export function ArchiveForm({ initial }: { initial?: Archive }) {
  const router = useRouter()
  const qc = useQueryClient()
  const isEdit = !!initial

  const { data: categories } = useQuery({
    queryKey: ["archive-categories", { limit: 200 }],
    queryFn: () => archiveCategoriesService.list({ limit: 200 }),
  })

  const form = useForm<ArchiveFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title ?? "",
      slug: initial?.slug ?? "",
      excerpt: initial?.excerpt ?? "",
      content: initial?.content ?? "",
      thumbnail_url: initial?.thumbnail_url ?? "",
      archive_category_id:
        initial?.archive_category_id != null
          ? String(initial.archive_category_id)
          : NONE,
      status: (initial?.status ?? "draft") as ArchiveStatus,
      published_at: toLocalInput(initial?.published_at ?? null),
    },
  })

  const onSubmit = async (values: ArchiveFormValues) => {
    // Tự đặt ngày đăng khi xuất bản mà chưa có.
    let publishedIso: string | null = null
    if (values.published_at) {
      publishedIso = new Date(values.published_at).toISOString()
    } else if (values.status === "published") {
      publishedIso = new Date().toISOString()
    }

    const categoryId =
      values.archive_category_id === NONE
        ? null
        : Number(values.archive_category_id)

    try {
      if (isEdit && initial) {
        const payload: ArchiveUpdate = {
          title: values.title,
          slug: values.slug || null,
          excerpt: values.excerpt || null,
          content: values.content || null,
          thumbnail_url: values.thumbnail_url || null,
          status: values.status,
          published_at: publishedIso,
          archive_category_id: categoryId,
        }
        await archivesService.update(initial.id, payload)
        toast.success("Đã cập nhật bài viết")
      } else {
        const author = getStoredUser()
        if (!author) {
          toast.error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.")
          return
        }
        const payload: ArchiveCreate = {
          title: values.title,
          slug: values.slug || null,
          excerpt: values.excerpt || null,
          content: values.content || null,
          thumbnail_url: values.thumbnail_url || null,
          status: values.status,
          published_at: publishedIso,
          archive_category_id: categoryId,
          author_id: author.id,
        }
        await archivesService.create(payload)
        toast.success("Đã tạo bài viết")
      }
      await qc.invalidateQueries({ queryKey: ["archives"] })
      router.push("/archives")
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiêu đề</FormLabel>
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
                <Input placeholder="Tự sinh từ tiêu đề nếu bỏ trống" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="archive_category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Danh mục</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={NONE}>— Không có —</SelectItem>
                    {(categories ?? []).map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    <SelectItem value="draft">Nháp</SelectItem>
                    <SelectItem value="published">Xuất bản</SelectItem>
                    <SelectItem value="archived">Lưu trữ</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="published_at"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ngày đăng</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormDescription>
                Bỏ trống → tự đặt thời điểm hiện tại khi xuất bản.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tóm tắt</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormDescription>
                Hiển thị ở danh sách bài viết &amp; thẻ preview.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nội dung (HTML)</FormLabel>
              <FormControl>
                <Textarea rows={14} className="font-mono text-xs" {...field} />
              </FormControl>
              <FormDescription>
                Dùng HTML: &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;&lt;li&gt;,
                &lt;strong&gt;, &lt;blockquote&gt;…
              </FormDescription>
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

        <div className="flex gap-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? "Đang lưu…"
              : isEdit
                ? "Lưu thay đổi"
                : "Tạo bài viết"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Hủy
          </Button>
        </div>
      </form>
    </Form>
  )
}
