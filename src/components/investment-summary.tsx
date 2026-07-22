import NumberFlow from "@number-flow/react"

import { Stat } from "@/components/stat"
import type { InvestmentSummary as InvestmentSummaryData } from "@/lib/investment-calculator"
import { formatYearsMonths } from "@/lib/investment-calculator"
import {
  currencyFormat,
  locale,
  multiplierFormat,
  numberFlowPlugins,
  opacityTiming,
  spinTiming,
  transformTiming,
} from "@/lib/number-flow"
import { cn } from "@/lib/utils"

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
