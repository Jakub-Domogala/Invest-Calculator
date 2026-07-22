import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function Stat({
  label,
  description,
  emphasize = false,
  compact = false,
  children,
}: {
  label: string
  description: string
  emphasize?: boolean
  compact?: boolean
  children: ReactNode
}) {
  return (
    <div className="space-y-1">
      <p
        className={cn(
          "text-sm text-muted-foreground",
          compact && "max-sm:text-xs"
        )}
      >
        {label}
      </p>
      <div
        className={cn(
          "font-mono font-medium tabular-nums",
          emphasize ? "text-3xl text-primary" : "text-xl",
          compact && "max-sm:text-sm"
        )}
      >
        {children}
      </div>
      <p
        className={cn(
          "text-xs text-muted-foreground",
          compact && "max-sm:hidden"
        )}
      >
        {description}
      </p>
    </div>
  )
}
