import { PageHeader } from "@/components/page-header"
import { ArchiveCategoryForm } from "../_form"

export default function NewArchiveCategoryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Thêm danh mục nội dung"
        description="Tạo danh mục bài viết mới."
      />
      <ArchiveCategoryForm />
    </div>
  )
}
