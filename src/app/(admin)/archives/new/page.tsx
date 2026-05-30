import { PageHeader } from "@/components/page-header"
import { ArchiveForm } from "../_form"

export default function NewArchivePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Thêm bài viết" description="Soạn bài viết mới." />
      <ArchiveForm />
    </div>
  )
}
