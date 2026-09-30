import type { ReactNode } from "react"

import { StatExplanationPopover } from "@/components/stat-explanation"
import type { StatExplanation } from "@/lib/explanations"
import { cn } from "@/lib/utils"

export function Stat({
  label,
  description,
  emphasize = false,
  compact = false,
  explanation,
  children,
}: {
  label: string
  description: string
  emphasize?: boolean
  compact?: boolean
  /** When given, hovering or tapping the stat shows how it was calculated. */
  explanation?: StatExplanation
  children: ReactNode
}) {
  const stat = (
    <div className="space-y-1">
      <p
        className={cn(
          "text-sm text-muted-foreground",
          compact && "max-sm:text-xs",
          explanation &&
            "underline decoration-muted-foreground/40 decoration-dotted underline-offset-4"
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

  if (!explanation) {
    return stat
  }

  return (
    <StatExplanationPopover title={label} explanation={explanation}>
      {stat}
    </StatExplanationPopover>
  )
}
