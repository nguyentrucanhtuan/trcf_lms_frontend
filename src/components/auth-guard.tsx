"use client"

import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { getAccessToken, getStoredUser } from "@/lib/auth"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const token = getAccessToken()
    const user = getStoredUser()
    if (!token || !user) {
      const next = encodeURIComponent(pathname || "/dashboard")
      router.replace(`/login?next=${next}`)
      return
    }
    if (user.role !== "admin" && user.role !== "teacher") {
      router.replace("/login")
      return
    }
    setReady(true)
  }, [pathname, router])

  if (!ready) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8 text-sm text-muted-foreground">
        Đang tải…
      </div>
    )
  }
  return <>{children}</>
}
