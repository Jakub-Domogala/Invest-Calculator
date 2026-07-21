import type { ReactNode } from "react"

import NumberFlow, { type Format, type Plugin } from "@number-flow/react"

import type { InvestmentSummary as InvestmentSummaryData } from "@/lib/investment-calculator"
import { formatYearsMonths } from "@/lib/investment-calculator"
import { cn } from "@/lib/utils"

// Force en-US formatting so the currency symbol is always "$" — with the
// device's own locale, Intl often renders USD as "US$" to disambiguate it
// from the local currency.
const locale = "en-US"

const currencyFormat: Format = {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
}

const multiplierFormat: Format = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}

/**
 * By default each digit rolls past every number between its old and new
 * value (1 -> 7 spins through 2,3,4,5,6). We only ever want a single-step
 * roll that lands directly on the target digit, so this plugin overrides
 * the roll distance to always be exactly one position, keeping the correct
 * up/down direction (including digit wrap, e.g. 9 -> 0).
 */
const singleStepPlugin: Plugin = {
  getDelta(value, prev, context) {
    if (value === prev) return 0
    const trend = context.flow.computedTrend || Math.sign(value - prev)
    if (trend < 0 && value > prev) return -1
    if (trend > 0 && value < prev) return 1
    return value > prev ? 1 : -1
  },
}

const numberFlowPlugins = [singleStepPlugin]
const transformTiming: EffectTiming = { duration: 350, easing: "ease-out" }
const spinTiming: EffectTiming = { duration: 350, easing: "ease-out" }
const opacityTiming: EffectTiming = { duration: 200, easing: "ease-out" }

export function InvestmentSummary({
  summary,
  totalMonths,
  className,
}: {
  summary: InvestmentSummaryData
  totalMonths: number
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <Stat
        label="Final balance"
        description={`After ${formatYearsMonths(totalMonths)}`}
        emphasize
      >
        <NumberFlow
          value={summary.finalBalance}
          format={currencyFormat}
          locales={locale}
          plugins={numberFlowPlugins}
          transformTiming={transformTiming}
          spinTiming={spinTiming}
          opacityTiming={opacityTiming}
        />
      </Stat>
      <div className="flex flex-col gap-5 max-sm:grid max-sm:grid-cols-3 max-sm:gap-3">
        <Stat
          label="Total contributions"
          description="Initial + monthly, paid in"
          compact
        >
          <NumberFlow
            value={summary.totalContributions}
            format={currencyFormat}
            locales={locale}
            plugins={numberFlowPlugins}
            transformTiming={transformTiming}
            spinTiming={spinTiming}
            opacityTiming={opacityTiming}
          />
        </Stat>
        <Stat label="Inflation multiplier" description="Prices vs. today" compact>
          <NumberFlow
            value={summary.inflationMultiplier}
            format={multiplierFormat}
            suffix="×"
            locales={locale}
            plugins={numberFlowPlugins}
            transformTiming={transformTiming}
            spinTiming={spinTiming}
            opacityTiming={opacityTiming}
          />
        </Stat>
        <Stat
          label="Inflation-adjusted balance"
          description="Final balance in today's money"
          compact
        >
          <NumberFlow
            value={summary.inflationAdjustedBalance}
            format={currencyFormat}
            locales={locale}
            plugins={numberFlowPlugins}
            transformTiming={transformTiming}
            spinTiming={spinTiming}
            opacityTiming={opacityTiming}
          />
        </Stat>
      </div>
    </div>
  )
}

function Stat({
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
