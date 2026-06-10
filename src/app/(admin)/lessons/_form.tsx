"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { ApiError } from "@/lib/api"
import {
  coursesService,
  lessonsService,
  sectionsService,
} from "@/lib/services"
import type { Lesson, LessonCreate, LessonUpdate } from "@/lib/types"

const schema = z.object({
  course_id: z.number().int().min(1, "Chọn khóa học"),
  section_id: z.number().int().nullable(),
  title: z.string().min(1, "Bắt buộc").max(255),
  content: z.string().optional().or(z.literal("")),
  video_url: z.string().max(1000).optional().or(z.literal("")),
  video_type: z.enum(["auto", "youtube", "vimeo", "drive", "file"]),
  duration_minutes: z.number().int().min(0).nullable(),
  position: z.number().int().min(0),
  is_preview: z.boolean(),
  is_published: z.boolean(),
})

export type LessonFormValues = z.infer<typeof schema>

const NO_SECTION = "__none__"

export function LessonForm({
  initial,
  defaultCourseId,
}: {
  initial?: Lesson
  defaultCourseId?: number
}) {
  const router = useRouter()
  const qc = useQueryClient()
  const isEdit = !!initial

  const form = useForm<LessonFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      course_id: initial?.course_id ?? defaultCourseId ?? 0,
      section_id: initial?.section_id ?? null,
      title: initial?.title ?? "",
      content: initial?.content ?? "",
      video_url: initial?.video_url ?? "",
      video_type: initial?.video_type ?? "auto",
      duration_minutes: initial?.duration_minutes ?? null,
      position: initial?.position ?? 0,
      is_preview: initial?.is_preview ?? false,
      is_published: initial?.is_published ?? true,
    },
  })

  const selectedCourseId = form.watch("course_id")

  const coursesQuery = useQuery({
    queryKey: ["courses", { limit: 200 }],
    queryFn: () => coursesService.list({ limit: 200 }),
  })

  const sectionsQuery = useQuery({
    queryKey: ["sections", { course_id: selectedCourseId }],
    queryFn: () => sectionsService.listByCourse(selectedCourseId),
    enabled: !!selectedCourseId,
  })

  // Reset section when course changes in create mode
  useEffect(() => {
    if (isEdit) return
    form.setValue("section_id", null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseId])

  const onSubmit = async (values: LessonFormValues) => {
    const base = {
      title: values.title,
      section_id: values.section_id,
      content: values.content || null,
      video_url: values.video_url || null,
      video_type: values.video_type,
      duration_minutes: values.duration_minutes,
      position: values.position,
      is_preview: values.is_preview,
      is_published: values.is_published,
    }
    try {
      if (isEdit && initial) {
        await lessonsService.update(initial.id, base as LessonUpdate)
        toast.success("Đã cập nhật bài học")
      } else {
        if (!values.course_id) {
          form.setError("course_id", { message: "Chọn khóa học" })
          return
        }
        await lessonsService.create({
          ...base,
          course_id: values.course_id,
        } as LessonCreate)
        toast.success("Đã tạo bài học")
      }
      await qc.invalidateQueries({ queryKey: ["lessons"] })
      router.push(`/lessons?course_id=${values.course_id}`)
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
                  ? "Không thể đổi khóa học sau khi tạo bài."
                  : "Chọn khóa học trước, sau đó mới chọn chương."}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="section_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chương (section)</FormLabel>
              <Select
                value={field.value === null ? NO_SECTION : String(field.value)}
                onValueChange={(v) =>
                  field.onChange(v === NO_SECTION ? null : Number(v))
                }
                disabled={!selectedCourseId}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        selectedCourseId
                          ? "Chọn chương"
                          : "Chọn khóa học trước"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value={NO_SECTION}>
                    (Không thuộc chương nào)
                  </SelectItem>
                  {sectionsQuery.data?.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Tùy chọn. Bài có thể đứng độc lập ngoài chương.
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

        <FormField
          control={form.control}
          name="video_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Video URL</FormLabel>
              <FormControl>
                <Input placeholder="https://… (YouTube/Vimeo/Drive/CDN)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="video_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loại video</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="auto">Tự động (đoán từ URL)</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="vimeo">Vimeo</SelectItem>
                  <SelectItem value="drive">Google Drive</SelectItem>
                  <SelectItem value="file">File trực tiếp (mp4…)</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Để &quot;Tự động&quot; cho hầu hết link. Chọn đúng nhà cung cấp
                nếu video không hiện (vd Vimeo riêng tư, link YouTube dạng lạ).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="duration_minutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Thời lượng (phút)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  placeholder="Để trống nếu không xác định"
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

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nội dung</FormLabel>
              <FormControl>
                <Textarea rows={6} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_preview"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Cho xem thử (preview)</FormLabel>
                <FormDescription>
                  Học viên chưa enroll vẫn xem được bài này.
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

        <FormField
          control={form.control}
          name="is_published"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Đã xuất bản</FormLabel>
                <FormDescription>
                  Tắt để giữ bản nháp, không hiển thị cho học viên.
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
                : "Tạo bài học"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Hủy
          </Button>
        </div>
      </form>
    </Form>
  )
}
