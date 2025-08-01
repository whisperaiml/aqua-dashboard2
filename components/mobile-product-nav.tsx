"use client"

import { Home, Package, PlusCircle, Settings } from "lucide-react"
import Link from "next/link"

const navItems = [
  { title: "Dashboard", url: "#", icon: Home },
  { title: "Products", url: "/dashboard/products", icon: Package },
  { title: "Add New Product", url: "/dashboard/products/create", icon: PlusCircle },
  { title: "Settings", url: "#", icon: Settings },
]

export default function MobileProductNav() {
  return (
    <nav className="flex justify-around border-b bg-secondary py-2 lg:hidden">
      {navItems.map(({ title, url, icon: Icon }) => (
        <Link key={title} href={url} className="flex flex-col items-center gap-1 text-sm">
          <Icon className="h-5 w-5" />
          <span className="sr-only">{title}</span>
        </Link>
      ))}
    </nav>
  )
}
