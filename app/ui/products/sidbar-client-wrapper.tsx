"use client"

import type React from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function SidebarClientWrapper({
  children,
  defaultOpen,
}: {
  children: React.ReactNode
  defaultOpen: boolean
}) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar />
      <main className="flex flex-1 flex-col">
        <div className="p-4 md:p-6">
          {/* toggle button on small screens */}
          <SidebarTrigger className="mb-4 lg:hidden" />
          {children}
        </div>
      </main>
    </SidebarProvider>
  )
}
