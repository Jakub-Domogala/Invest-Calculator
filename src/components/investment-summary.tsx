import NumberFlow from "@number-flow/react"

import { Stat } from "@/components/stat"
import { explainInvestment } from "@/lib/explanations"
import type {
  InvestmentInputs,
  InvestmentSummary as InvestmentSummaryData,
} from "@/lib/investment-calculator"
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
  inputs,
  summary,
  totalMonths,
  className,
}: {
  inputs: InvestmentInputs
  summary: InvestmentSummaryData
  totalMonths: number
  className?: string
}) {
  const explanations = explainInvestment(inputs, summary)

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <Stat
        label="Final balance"
        description={`After ${formatYearsMonths(totalMonths)}`}
        emphasize
        explanation={explanations.finalBalance}
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
          explanation={explanations.totalContributions}
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
        <Stat
          label="Inflation multiplier"
          description="Prices vs. today"
          compact
          explanation={explanations.inflationMultiplier}
        >
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
          explanation={explanations.inflationAdjustedBalance}
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
