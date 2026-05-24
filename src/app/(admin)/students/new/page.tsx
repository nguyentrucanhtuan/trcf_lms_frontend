import { PageHeader } from "@/components/page-header"
import { StudentForm } from "../_form"

export default function NewStudentPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Thêm học viên"
        description="Tạo hồ sơ học viên từ tài khoản user (role=student)."
      />
      <StudentForm />
    </div>
  )
}
