import { PageHeader } from "@/components/page-header"
import { CourseForm } from "../_form"

export default function NewCoursePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Thêm khóa học"
        description="Tạo khóa học mới."
      />
      <CourseForm />
    </div>
  )
}
