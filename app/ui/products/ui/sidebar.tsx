"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"

import { cn } from "@/lib/utils"

const Sidebar = ({ className, children, ...props }: React.ComponentProps<"aside">) => {
  return (
    <aside className={cn("flex flex-col border-r bg-secondary text-secondary-foreground", className)} {...props}>
      {children}
    </aside>
  )
}
Sidebar.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div className={cn("flex h-16 items-center justify-between px-4 py-2", className)} ref={ref} {...props} />
  ),
)
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div className={cn("flex-1 overflow-y-auto p-4", className)} ref={ref} {...props} />
  ),
)
SidebarContent.displayName = "SidebarContent"

const SidebarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className={cn("space-y-1", className)} ref={ref} {...props} />,
)
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p className={cn("px-4 py-2 text-sm font-medium text-muted-foreground", className)} ref={ref} {...props} />
  ),
)
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className={cn("space-y-1", className)} ref={ref} {...props} />,
)
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarMenu = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, ...props }, ref) => <ul className={cn("space-y-1", className)} ref={ref} {...props} />,
)
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.HTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => <li className={cn("", className)} ref={ref} {...props} />,
)
SidebarMenuItem.displayName = "SidebarMenuItem"

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isActive?: boolean
    asChild?: boolean
  }
>(({ className, isActive, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(
        "group flex w-full items-center gap-2 rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground",
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className={cn("border-t", className)} ref={ref} {...props} />,
)
SidebarSeparator.displayName = "SidebarSeparator"

const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div className={cn("border-t p-4", className)} ref={ref} {...props} />,
)
SidebarFooter.displayName = "SidebarFooter"

import { createContext, useState, useContext } from "react"

interface SidebarContextProps {
  isOpen: boolean
  setOpen: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContextProps>({
  isOpen: false,
  setOpen: () => {},
})

interface SidebarProviderProps {
  defaultOpen?: boolean
  children: React.ReactNode
}

const SidebarProvider = ({ defaultOpen = false, children }: SidebarProviderProps) => {
  const [isOpen, setOpen] = useState(defaultOpen)

  return <SidebarContext.Provider value={{ isOpen, setOpen }}>{children}</SidebarContext.Provider>
}

const useSidebar = () => useContext(SidebarContext)

const SidebarTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    const { isOpen, setOpen } = useSidebar()

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2",
          className,
        )}
        onClick={() => setOpen(!isOpen)}
        {...props}
      >
        Toggle Sidebar
      </button>
    )
  },
)
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarInset = ({ className, children, ...props }: React.ComponentProps<"div">) => {
  const { isOpen } = useSidebar()

  return (
    <div className={cn("lg:pl-64", !isOpen && "hidden lg:block", className)} {...props}>
      {children}
    </div>
  )
}
SidebarInset.displayName = "SidebarInset"

const DropdownMenu = DropdownMenuPrimitive.Root
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger
const DropdownMenuContent = DropdownMenuPrimitive.Content
const DropdownMenuItem = DropdownMenuPrimitive.Item
const DropdownMenuSeparator = DropdownMenuPrimitive.Separator

export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarFooter,
  SidebarProvider,
  useSidebar,
  SidebarTrigger,
  SidebarInset,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
}
