import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  badge?: string
  title: string
  description?: string
  align?: "left" | "center" | "right"
  titleClassName?: string
  descriptionClassName?: string
  badgeClassName?: string
}

export function SectionHeading({
  badge,
  title,
  description,
  align = "center",
  titleClassName,
  descriptionClassName,
  badgeClassName,
}: SectionHeadingProps) {
  const alignmentClasses = {
    left: "text-left",
    center: "text-center mx-auto",
    right: "text-right ml-auto",
  }

  return (
    <div className={cn("mb-12", alignmentClasses[align])}>
      {badge && (
        <div
          className={cn(
            "inline-block bg-gray-900 text-white px-6 py-2 rounded-full text-sm font-medium mb-4",
            badgeClassName,
          )}
        >
          {badge}
        </div>
      )}
      <h2 className={cn("text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl", titleClassName)}>{title}</h2>
      {description && (
        <p className={cn("mt-4 text-lg text-gray-600 max-w-3xl", alignmentClasses[align], descriptionClassName)}>
          {description}
        </p>
      )}
    </div>
  )
}
