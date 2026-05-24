import { PageHeader } from "@/components/page-header"
import { UserForm } from "../_form"

export default function NewUserPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Thêm người dùng"
        description="Tạo tài khoản mới cho hệ thống."
      />
      <UserForm />
    </div>
  )
}
