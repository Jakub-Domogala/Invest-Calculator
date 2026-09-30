import type { ReactNode } from "react"

import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { StatExplanation } from "@/lib/explanations"

/**
 * Wraps a result so that hovering (or tapping, on touch screens where there
 * is no hover) opens the equation behind it.
 */
export function StatExplanationPopover({
  title,
  explanation,
  children,
}: {
  title: string
  explanation: StatExplanation
  children: ReactNode
}) {
  return (
    <Popover>
      <PopoverTrigger
        openOnHover
        delay={150}
        nativeButton={false}
        render={
          <div className="cursor-help rounded-md outline-hidden focus-visible:ring-2 focus-visible:ring-ring" />
        }
      >
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 max-w-[calc(100vw-2rem)] gap-3">
        <PopoverHeader>
          <PopoverTitle>{title}</PopoverTitle>
        </PopoverHeader>
        <p className="font-mono text-xs leading-relaxed">
          {explanation.formula}
        </p>
        {explanation.filledIn ? (
          <p className="rounded-lg bg-muted px-3 py-2 font-mono text-xs leading-relaxed tabular-nums">
            {explanation.filledIn}
          </p>
        ) : null}
        {explanation.terms?.length ? (
          <dl className="space-y-1.5 text-xs">
            {explanation.terms.map((term) => (
              <div
                key={term.label}
                className="flex items-baseline justify-between gap-4"
              >
                <dt className="text-muted-foreground">{term.label}</dt>
                <dd className="text-right font-mono tabular-nums">
                  {term.value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
        {explanation.note ? (
          <p className="text-xs text-muted-foreground">{explanation.note}</p>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}
