import { PageHeader } from "@/components/page-header"
import { CouponForm } from "../_form"

export default function NewCouponPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Thêm mã giảm giá" description="Tạo mã khuyến mãi mới." />
      <CouponForm />
    </div>
  )
}
