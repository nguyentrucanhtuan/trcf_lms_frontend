"use client"

import { useQuery } from "@tanstack/react-query"
import { BookOpen, Users as UsersIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { coursesService, usersService } from "@/lib/services"

function StatCard({
  label,
  value,
  loading,
  icon: Icon,
}: {
  label: string
  value: number | string
  loading?: boolean
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardDescription>{label}</CardDescription>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-7 w-16" />
        ) : (
          <div className="text-2xl font-semibold">{value}</div>
        )}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const usersQuery = useQuery({
    queryKey: ["users", "stat"],
    queryFn: () => usersService.list({ limit: 200 }),
  })
  const coursesQuery = useQuery({
    queryKey: ["courses", "stat"],
    queryFn: () => coursesService.list({ limit: 200 }),
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tổng quan</h1>
        <p className="text-sm text-muted-foreground">
          Thống kê nhanh về hệ thống.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Người dùng"
          icon={UsersIcon}
          loading={usersQuery.isLoading}
          value={usersQuery.data?.length ?? 0}
        />
        <StatCard
          label="Khóa học"
          icon={BookOpen}
          loading={coursesQuery.isLoading}
          value={coursesQuery.data?.length ?? 0}
        />
        <StatCard
          label="Khóa published"
          icon={BookOpen}
          loading={coursesQuery.isLoading}
          value={
            coursesQuery.data?.filter((c) => c.status === "published").length ??
            0
          }
        />
        <StatCard
          label="Admin"
          icon={UsersIcon}
          loading={usersQuery.isLoading}
          value={
            usersQuery.data?.filter((u) => u.role === "admin").length ?? 0
          }
        />
      </div>
    </div>
  )
}
