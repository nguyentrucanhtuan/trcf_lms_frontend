"use client"

import {
  BookOpen,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  ListOrdered,
  PlaySquare,
  Tags,
  Ticket,
  Users as UsersIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { clearSession, getStoredUser } from "@/lib/auth"
import { authService } from "@/lib/services"

const NAV = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/users", label: "Người dùng", icon: UsersIcon },
  { href: "/courses", label: "Khóa học", icon: BookOpen },
  {
    href: "/course-categories",
    label: "Danh mục khóa học",
    icon: Tags,
  },
  { href: "/sections", label: "Chương", icon: ListOrdered },
  { href: "/lessons", label: "Bài học", icon: PlaySquare },
  { href: "/students", label: "Học viên", icon: GraduationCap },
  { href: "/enrollments", label: "Ghi danh", icon: Ticket },
  {
    href: "/payment-methods",
    label: "Phương thức thanh toán",
    icon: CreditCard,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const user = typeof window !== "undefined" ? getStoredUser() : null

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch {
      // ignore — we'll clear local state regardless
    }
    clearSession()
    router.replace("/login")
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 py-1 text-base font-semibold">TRCF LMS</div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Quản trị</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={active}
                      tooltip={item.label}
                      render={<Link href={item.href} />}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {user ? (
            <SidebarMenuItem>
              <div className="px-2 py-1 text-xs text-muted-foreground truncate">
                {user.email}
                <span className="ml-1 uppercase">({user.role})</span>
              </div>
            </SidebarMenuItem>
          ) : null}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} tooltip="Đăng xuất">
              <LogOut />
              <span>Đăng xuất</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
