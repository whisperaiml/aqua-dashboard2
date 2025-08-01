import type React from "react"
import { cookies } from "next/headers"
import SidebarClientWrapper from "@/components/sidebar-client-wrapper"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  // server-side: read the persisted cookie
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true"

  return (
    <div
      className={`${GeistSans.variable} ${GeistMono.variable} min-h-screen flex`}
      style={{ fontFamily: GeistSans.style.fontFamily }}
    >
      {/* Move all hook-based providers into a dedicated client wrapper */}
      <SidebarClientWrapper defaultOpen={defaultOpen}>{children}</SidebarClientWrapper>
    </div>
  )
}
