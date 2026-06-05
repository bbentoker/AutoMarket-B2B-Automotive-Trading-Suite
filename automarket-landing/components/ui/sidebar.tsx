"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"

const SidebarContext = React.createContext<{
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  isMobile: boolean
}>({
  isOpen: false,
  setIsOpen: () => {},
  isMobile: false,
})

interface SidebarProviderProps {
  children: React.ReactNode
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkIsMobile()
    window.addEventListener("resize", checkIsMobile)
    return () => {
      window.removeEventListener("resize", checkIsMobile)
    }
  }, [])

  return <SidebarContext.Provider value={{ isOpen, setIsOpen, isMobile }}>{children}</SidebarContext.Provider>
}

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProps {
  children: React.ReactNode
  className?: string
}

export function Sidebar({ children, className }: SidebarProps) {
  const { isMobile } = useSidebar()

  if (isMobile) {
    return (
      <Drawer>
        <DrawerContent className="h-[90%]">
          <div className={cn("h-full w-full overflow-auto bg-sidebar", className)}>{children}</div>
        </DrawerContent>
      </Drawer>
    )
  }

  return <aside className={cn("h-screen w-64 overflow-auto bg-sidebar", className)}>{children}</aside>
}

interface SidebarHeaderProps {
  children: React.ReactNode
  className?: string
}

export function SidebarHeader({ children, className }: SidebarHeaderProps) {
  return <div className={cn("flex h-14 items-center border-b border-sidebar-border px-4", className)}>{children}</div>
}

interface SidebarContentProps {
  children: React.ReactNode
  className?: string
}

export function SidebarContent({ children, className }: SidebarContentProps) {
  return <div className={cn("flex-1 overflow-auto", className)}>{children}</div>
}

interface SidebarFooterProps {
  children: React.ReactNode
  className?: string
}

export function SidebarFooter({ children, className }: SidebarFooterProps) {
  return <div className={cn("border-t border-sidebar-border", className)}>{children}</div>
}

interface SidebarMenuProps {
  children: React.ReactNode
  className?: string
}

export function SidebarMenu({ children, className }: SidebarMenuProps) {
  return <nav className={cn("space-y-1 p-2", className)}>{children}</nav>
}

interface SidebarMenuItemProps {
  children: React.ReactNode
  className?: string
}

export function SidebarMenuItem({ children, className }: SidebarMenuItemProps) {
  return <div className={cn("", className)}>{children}</div>
}

const sidebarMenuButtonVariants = cva(
  "group flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
  {
    variants: {
      isActive: {
        true: "bg-sidebar-accent text-sidebar-accent-foreground",
        false: "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      },
    },
    defaultVariants: {
      isActive: false,
    },
  },
)

interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
  isActive?: boolean
  asChild?: boolean
}

export function SidebarMenuButton({
  children,
  className,
  isActive = false,
  asChild = false,
  ...props
}: SidebarMenuButtonProps) {
  const Comp = asChild ? React.Fragment : "button"
  const { setIsOpen, isMobile } = useSidebar()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isMobile) {
      setIsOpen(false)
    }
    props.onClick?.(e)
  }

  return (
    <Comp
      {...(asChild
        ? {}
        : { className: cn(sidebarMenuButtonVariants({ isActive }), className), ...props, onClick: handleClick })}
    >
      {children}
    </Comp>
  )
}

interface SidebarTriggerProps {
  children?: React.ReactNode
  className?: string
}

export function SidebarTrigger({ children, className }: SidebarTriggerProps) {
  const { setIsOpen } = useSidebar()

  return (
    <DrawerTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className={cn("", className)}
        onClick={() => {
          setIsOpen(true)
        }}
      >
        {children}
      </Button>
    </DrawerTrigger>
  )
}

interface SidebarCloseProps {
  children?: React.ReactNode
  className?: string
}

export function SidebarClose({ children, className }: SidebarCloseProps) {
  return (
    <DrawerClose asChild>
      <Button variant="ghost" size="icon" className={cn("", className)}>
        {children || <X className="h-4 w-4" />}
      </Button>
    </DrawerClose>
  )
}
