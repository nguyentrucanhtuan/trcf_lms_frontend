import { PageHeader } from "@/components/page-header"
import { PaymentMethodForm } from "../_form"

export default function NewPaymentMethodPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Thêm phương thức"
        description="Tạo phương thức thanh toán mới."
      />
      <PaymentMethodForm />
    </div>
  )
}
