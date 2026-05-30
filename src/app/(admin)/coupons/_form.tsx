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
import { Textarea } from "@/components/ui/textarea"
import { ApiError } from "@/lib/api"
import { couponsService } from "@/lib/services"
import type { Coupon, CouponCreate, CouponType, CouponUpdate } from "@/lib/types"

const schema = z
  .object({
    code: z.string().min(1, "Bắt buộc").max(64),
    description: z.string().max(500).optional().or(z.literal("")),
    discount_type: z.enum(["percent", "fixed"]),
    discount_value: z.number().int().min(0),
    valid_from: z.string().optional().or(z.literal("")),
    valid_to: z.string().optional().or(z.literal("")),
    max_uses: z.number().int().min(1).nullable(),
    is_active: z.boolean(),
  })
  .refine((v) => v.discount_type !== "percent" || v.discount_value <= 100, {
    message: "Giảm theo % phải từ 0–100",
    path: ["discount_value"],
  })

export type CouponFormValues = z.infer<typeof schema>

function toLocalInput(iso: string | null): string {
  if (!iso) return ""
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

export function CouponForm({ initial }: { initial?: Coupon }) {
  const router = useRouter()
  const qc = useQueryClient()
  const isEdit = !!initial

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: initial?.code ?? "",
      description: initial?.description ?? "",
      discount_type: (initial?.discount_type ?? "percent") as CouponType,
      discount_value: initial?.discount_value ?? 0,
      valid_from: toLocalInput(initial?.valid_from ?? null),
      valid_to: toLocalInput(initial?.valid_to ?? null),
      max_uses: initial?.max_uses ?? null,
      is_active: initial?.is_active ?? true,
    },
  })

  const discountType = form.watch("discount_type")

  const onSubmit = async (values: CouponFormValues) => {
    const payload: CouponCreate | CouponUpdate = {
      code: values.code.trim().toUpperCase(),
      description: values.description || null,
      discount_type: values.discount_type,
      discount_value: values.discount_value,
      valid_from: values.valid_from
        ? new Date(values.valid_from).toISOString()
        : null,
      valid_to: values.valid_to
        ? new Date(values.valid_to).toISOString()
        : null,
      max_uses: values.max_uses,
      is_active: values.is_active,
    }
    try {
      if (isEdit && initial) {
        await couponsService.update(initial.id, payload as CouponUpdate)
        toast.success("Đã cập nhật mã")
      } else {
        await couponsService.create(payload as CouponCreate)
        toast.success("Đã tạo mã giảm giá")
      }
      await qc.invalidateQueries({ queryKey: ["coupons"] })
      router.push("/coupons")
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
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mã</FormLabel>
              <FormControl>
                <Input placeholder="VD: KHAIGIANG30" {...field} />
              </FormControl>
              <FormDescription>Tự động viết hoa khi lưu.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="discount_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Loại giảm</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="percent">Theo phần trăm (%)</SelectItem>
                    <SelectItem value="fixed">Số tiền cố định (₫)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discount_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Giá trị giảm {discountType === "percent" ? "(%)" : "(₫)"}
                </FormLabel>
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea rows={2} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="valid_from"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hiệu lực từ</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="valid_to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hết hạn</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="max_uses"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số lần dùng tối đa</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  placeholder="Bỏ trống = không giới hạn"
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
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Kích hoạt</FormLabel>
                <FormDescription>
                  Mã bị tắt sẽ không áp dụng được khi thanh toán.
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                : "Tạo mã"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Hủy
          </Button>
        </div>
      </form>
    </Form>
  )
}
