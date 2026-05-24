import { PageHeader } from "@/components/page-header"
import { CourseCategoryForm } from "../_form"

export default function NewCourseCategoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Thêm danh mục"
        description="Tạo danh mục khóa học mới."
      />
      <CourseCategoryForm />
    </div>
  )
}
