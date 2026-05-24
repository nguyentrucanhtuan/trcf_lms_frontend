"use client"

import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { GripVertical, Pencil, Plus } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ApiError } from "@/lib/api"
import { lessonsService, sectionsService } from "@/lib/services"
import { cn } from "@/lib/utils"
import type { Lesson, Section } from "@/lib/types"

export function CourseOutline({ courseId }: { courseId: number }) {
  const qc = useQueryClient()

  const sectionsQuery = useQuery({
    queryKey: ["sections", { course_id: courseId }],
    queryFn: () => sectionsService.listByCourse(courseId),
  })
  const lessonsQuery = useQuery({
    queryKey: ["lessons", { course_id: courseId }],
    queryFn: () => lessonsService.list({ course_id: courseId }),
  })

  // Local state for optimistic reordering
  const [sections, setSections] = useState<Section[]>([])
  const [lessonsBySection, setLessonsBySection] = useState<
    Map<number | null, Lesson[]>
  >(new Map())

  useEffect(() => {
    const sorted = (sectionsQuery.data ?? [])
      .slice()
      .sort((a, b) => a.position - b.position || a.id - b.id)
    setSections(sorted)
  }, [sectionsQuery.data])

  useEffect(() => {
    const lessons = (lessonsQuery.data ?? [])
      .slice()
      .sort((a, b) => a.position - b.position || a.id - b.id)
    const map = new Map<number | null, Lesson[]>()
    map.set(null, [])
    for (const s of sectionsQuery.data ?? []) map.set(s.id, [])
    for (const l of lessons) {
      const key = l.section_id ?? null
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(l)
    }
    setLessonsBySection(map)
  }, [lessonsQuery.data, sectionsQuery.data])

  const onError = (err: unknown) => {
    const msg = err instanceof ApiError ? err.message : "Cập nhật thất bại"
    toast.error(msg)
  }

  const reorderSectionsMutation = useMutation({
    mutationFn: (items: Section[]) =>
      Promise.all(
        items.map((s, i) =>
          s.position !== i + 1
            ? sectionsService.update(s.id, { position: i + 1 })
            : Promise.resolve(s),
        ),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sections"] }),
    onError,
  })

  const reorderLessonsMutation = useMutation({
    mutationFn: (items: Lesson[]) =>
      Promise.all(
        items.map((l, i) =>
          l.position !== i + 1
            ? lessonsService.update(l.id, { position: i + 1 })
            : Promise.resolve(l),
        ),
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["lessons"] }),
    onError,
  })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleSectionsDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIdx = sections.findIndex((s) => `s-${s.id}` === active.id)
    const newIdx = sections.findIndex((s) => `s-${s.id}` === over.id)
    if (oldIdx < 0 || newIdx < 0) return
    const next = arrayMove(sections, oldIdx, newIdx)
    setSections(next)
    reorderSectionsMutation.mutate(next)
  }

  const handleLessonsDragEnd =
    (sectionId: number | null) => (e: DragEndEvent) => {
      const { active, over } = e
      if (!over || active.id === over.id) return
      const current = lessonsBySection.get(sectionId) ?? []
      const oldIdx = current.findIndex((l) => `l-${l.id}` === active.id)
      const newIdx = current.findIndex((l) => `l-${l.id}` === over.id)
      if (oldIdx < 0 || newIdx < 0) return
      const next = arrayMove(current, oldIdx, newIdx)
      const map = new Map(lessonsBySection)
      map.set(sectionId, next)
      setLessonsBySection(map)
      reorderLessonsMutation.mutate(next)
    }

  if (sectionsQuery.isLoading || lessonsQuery.isLoading) {
    return <Skeleton className="h-64 w-full" />
  }

  const noSectionLessons = lessonsBySection.get(null) ?? []

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Sắp xếp nội dung</CardTitle>
          <CardDescription>
            Kéo thả vào icon ⋮⋮ để sắp xếp lại chương và bài học. Kéo chương sẽ
            di chuyển cùng các bài học bên trong.
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            render={
              <Link href={`/sections/new?course_id=${courseId}`}>
                <Plus />
                Thêm chương
              </Link>
            }
          />
          <Button
            size="sm"
            variant="outline"
            render={
              <Link href={`/lessons/new?course_id=${courseId}`}>
                <Plus />
                Thêm bài
              </Link>
            }
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {sections.length === 0 && noSectionLessons.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Khóa học chưa có chương hoặc bài học nào.
          </p>
        ) : null}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleSectionsDragEnd}
        >
          <SortableContext
            items={sections.map((s) => `s-${s.id}`)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {sections.map((s) => {
                const sLessons = lessonsBySection.get(s.id) ?? []
                return (
                  <SortableSection
                    key={s.id}
                    section={s}
                    lessons={sLessons}
                    onLessonsDragEnd={handleLessonsDragEnd(s.id)}
                    sensors={sensors}
                  />
                )
              })}
            </div>
          </SortableContext>
        </DndContext>

        {noSectionLessons.length > 0 ? (
          <div className="space-y-2">
            <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm font-medium text-muted-foreground">
              Bài không thuộc chương
            </div>
            <div className="ml-6">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleLessonsDragEnd(null)}
              >
                <SortableContext
                  items={noSectionLessons.map((l) => `l-${l.id}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-1">
                    {noSectionLessons.map((l) => (
                      <SortableLesson key={l.id} lesson={l} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function SortableSection({
  section,
  lessons,
  onLessonsDragEnd,
  sensors,
}: {
  section: Section
  lessons: Lesson[]
  onLessonsDragEnd: (e: DragEndEvent) => void
  sensors: ReturnType<typeof useSensors>
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `s-${section.id}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn("space-y-2", isDragging && "opacity-50")}
    >
      <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
          aria-label="Kéo để sắp xếp chương"
        >
          <GripVertical className="size-4" />
        </button>
        <span className="font-mono text-xs text-muted-foreground">
          {section.position}
        </span>
        <div className="flex-1">
          <div className="font-medium">{section.title}</div>
          <div className="text-xs text-muted-foreground">
            {lessons.length} bài
          </div>
        </div>
        <Button
          size="icon"
          variant="ghost"
          render={
            <Link
              href={`/sections/${section.id}/edit`}
              aria-label="Sửa chương"
            />
          }
        >
          <Pencil className="size-4" />
        </Button>
      </div>
      <div className="ml-6">
        {lessons.length === 0 ? (
          <p className="text-xs text-muted-foreground">Chưa có bài học.</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onLessonsDragEnd}
          >
            <SortableContext
              items={lessons.map((l) => `l-${l.id}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1">
                {lessons.map((l) => (
                  <SortableLesson key={l.id} lesson={l} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}

function SortableLesson({ lesson }: { lesson: Lesson }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `l-${lesson.id}` })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-md border bg-background px-3 py-2",
        isDragging && "opacity-50",
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
        aria-label="Kéo để sắp xếp bài"
      >
        <GripVertical className="size-4" />
      </button>
      <span className="font-mono text-xs text-muted-foreground">
        {lesson.position}
      </span>
      <div className="flex-1">
        <div className="text-sm font-medium">{lesson.title}</div>
        {lesson.duration_minutes != null ? (
          <div className="text-xs text-muted-foreground">
            {lesson.duration_minutes} phút
          </div>
        ) : null}
      </div>
      {!lesson.is_published ? <Badge variant="outline">Draft</Badge> : null}
      {lesson.is_preview ? <Badge variant="secondary">Preview</Badge> : null}
      <Button
        size="icon"
        variant="ghost"
        render={
          <Link href={`/lessons/${lesson.id}/edit`} aria-label="Sửa bài" />
        }
      >
        <Pencil className="size-4" />
      </Button>
    </div>
  )
}
