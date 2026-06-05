import { cn } from "@/lib/utils"
import type React from "react"
import { EuroIcon, BanknoteIcon } from "lucide-react"

interface IconContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: "default" | "primary" | "secondary" | "subtle" | "white" | "glass" | "euro" | "money"
  size?: "sm" | "md" | "lg"
  rounded?: "default" | "full"
  iconOnly?: boolean
}

export function IconContainer({
  children,
  variant = "default",
  size = "md",
  rounded = "default",
  iconOnly = false,
  className,
  ...props
}: IconContainerProps) {
  const variantStyles = {
    default: "bg-gray-100 text-gray-700",
    primary: "bg-[#FF385C] text-white",
    secondary: "bg-blue-900 text-white",
    subtle: "bg-[#FF385C]/10 text-[#FF385C]",
    white: "bg-white text-[#FF385C]",
    glass: "bg-white/20 backdrop-blur-sm text-white border border-white/20",
    euro: "bg-[#FF385C] text-white",
    money: "bg-[#FF385C] text-white",
  }

  const sizeStyles = {
    sm: "p-2",
    md: "p-3",
    lg: "p-4",
  }

  const roundedStyles = {
    default: "rounded-lg",
    full: "rounded-full",
  }

  const renderIcon = () => {
    if (iconOnly) {
      if (variant === "euro") return <EuroIcon className="w-5 h-5" />
      if (variant === "money") return <BanknoteIcon className="w-5 h-5" />
    }
    return children
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center transition-all duration-300",
        variantStyles[variant],
        sizeStyles[size],
        roundedStyles[rounded],
        className,
      )}
      {...props}
    >
      {renderIcon()}
    </div>
  )
}
