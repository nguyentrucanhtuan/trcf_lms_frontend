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
import { paymentMethodsService } from "@/lib/services"
import type {
  PaymentMethod,
  PaymentMethodCreate,
  PaymentMethodUpdate,
} from "@/lib/types"

const schema = z.object({
  code: z.string().min(1, "Bắt buộc").max(64),
  name: z.string().min(1, "Bắt buộc").max(255),
  description: z.string().max(1000).optional().or(z.literal("")),
  display_order: z.number().int().min(0),
  is_active: z.boolean(),
})

export type PaymentMethodFormValues = z.infer<typeof schema>

export function PaymentMethodForm({ initial }: { initial?: PaymentMethod }) {
  const router = useRouter()
  const qc = useQueryClient()
  const isEdit = !!initial

  const form = useForm<PaymentMethodFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: initial?.code ?? "",
      name: initial?.name ?? "",
      description: initial?.description ?? "",
      display_order: initial?.display_order ?? 0,
      is_active: initial?.is_active ?? true,
    },
  })

  const onSubmit = async (values: PaymentMethodFormValues) => {
    const payload: PaymentMethodCreate | PaymentMethodUpdate = {
      code: values.code,
      name: values.name,
      description: values.description || null,
      display_order: values.display_order,
      is_active: values.is_active,
    }
    try {
      if (isEdit && initial) {
        await paymentMethodsService.update(
          initial.id,
          payload as PaymentMethodUpdate,
        )
        toast.success("Đã cập nhật phương thức")
      } else {
        await paymentMethodsService.create(payload as PaymentMethodCreate)
        toast.success("Đã tạo phương thức")
      }
      await qc.invalidateQueries({ queryKey: ["payment-methods"] })
      router.push("/payment-methods")
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
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mã code</FormLabel>
                <FormControl>
                  <Input placeholder="cash, bank_transfer, momo…" {...field} />
                </FormControl>
                <FormDescription>Duy nhất, dùng trong API.</FormDescription>
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
              <FormLabel>Tên hiển thị</FormLabel>
              <FormControl>
                <Input placeholder="Tiền mặt, Chuyển khoản…" {...field} />
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
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel>Kích hoạt</FormLabel>
                <FormDescription>
                  Phương thức bị tắt sẽ không cho phép tạo order mới.
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
                : "Tạo phương thức"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Hủy
          </Button>
        </div>
      </form>
    </Form>
  )
}
