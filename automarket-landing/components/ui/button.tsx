import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#FF385C] text-white hover:bg-[#E62E50] shadow-sm hover:shadow-md hover:shadow-[#FF385C]/20",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-[#222222] text-white hover:bg-[#333333] shadow-sm hover:shadow-md hover:shadow-[#222222]/20",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-[#FF385C] underline-offset-4 hover:underline hover:text-[#E62E50]",
        subtle: "bg-[#FF385C]/15 text-[#222222] hover:bg-[#FF385C]/25",
        glass:
          "bg-white/80 backdrop-blur-sm border border-white/20 text-[#222222] hover:bg-white/90 dark:bg-gray-900/80 dark:text-[#FF385C] dark:hover:bg-gray-900/90 shadow-sm",
        "primary-outline": "border-[#FF385C] text-[#FF385C] hover:bg-[#FF385C]/10",
        "white-outline": "border-2 border-white text-[#222222] hover:bg-white/10 hover:shadow-md hover:shadow-white/10",
        "dark-outline":
          "border-2 border-[#222222] text-[#222222] hover:bg-[#222222]/5 hover:shadow-md hover:shadow-[#222222]/10",
        "primary-gradient":
          "bg-gradient-to-r from-[#FF5C73] via-[#FF385C] to-[#FF5C73] text-white hover:from-[#E62E50] hover:via-[#FF385C] hover:to-[#E62E50] shadow-sm hover:shadow-md hover:shadow-[#FF385C]/20",
      },
      // Keep the rest of the variants unchanged
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8 text-base",
        xl: "h-12 rounded-md px-10 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8 [&_svg]:size-3.5",
      },
      rounded: {
        default: "rounded-md",
        full: "rounded-full",
        lg: "rounded-lg",
        xl: "rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      rounded: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, rounded, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    // Ensure colored buttons have white text for proper contrast
    const coloredVariants = ["default", "secondary", "destructive", "primary-gradient"]
    const ensureTextColor = coloredVariants.includes(variant as string) ? "text-white" : ""

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, rounded }), ensureTextColor, className)}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
