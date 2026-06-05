import type * as React from "react"
import { cn } from "@/lib/utils"

interface GlassmorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  intensity?: "light" | "medium" | "strong"
  blur?: "none" | "slight" | "medium" | "heavy"
  border?: boolean
  children: React.ReactNode
}

export function GlassmorphicCard({
  className,
  intensity = "medium",
  blur = "medium",
  border = true,
  children,
  ...props
}: GlassmorphicCardProps) {
  // Intensity affects background opacity
  const intensityClasses = {
    light: "bg-white/30 dark:bg-gray-900/20",
    medium: "bg-white/50 dark:bg-gray-900/40",
    strong: "bg-white/70 dark:bg-gray-900/60",
  }

  // Blur affects backdrop-filter blur amount
  const blurClasses = {
    none: "",
    slight: "backdrop-blur-sm",
    medium: "backdrop-blur-md",
    heavy: "backdrop-blur-lg",
  }

  return (
    <div
      className={cn(
        "rounded-xl p-4",
        intensityClasses[intensity],
        blurClasses[blur],
        border && "border border-white/20 dark:border-gray-800/30",
        "shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
