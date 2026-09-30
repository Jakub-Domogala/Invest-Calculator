import NumberFlow from "@number-flow/react"

import { Stat } from "@/components/stat"
import { explainFreedom } from "@/lib/explanations"
import {
  MAX_FREEDOM_MONTHS,
  type FreedomInputs,
  type FreedomSummary as FreedomSummaryData,
} from "@/lib/freedom-calculator"
import { formatYearsMonths } from "@/lib/investment-calculator"
import {
  currencyFormat,
  locale,
  numberFlowPlugins,
  percentFormat,
  opacityTiming,
  spinTiming,
  transformTiming,
} from "@/lib/number-flow"
import { cn } from "@/lib/utils"

function timeToFreedom(summary: FreedomSummaryData | null): string {
  if (summary === null) {
    return `${MAX_FREEDOM_MONTHS / 12}+ years`
  }

  return summary.fireMonth === 0 ? "Now" : formatYearsMonths(summary.fireMonth)
}

export function FreedomSummary({
  inputs,
  summary,
  className,
}: {
  inputs: FreedomInputs
  summary: FreedomSummaryData | null
  className?: string
}) {
  const explanations = explainFreedom(inputs, summary)

  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <Stat
        label="Time to freedom"
        description={
          summary === null
            ? "Your spending grows as fast as your portfolio. Invest a larger share, raise your salary increase, or lower lifestyle inflation."
            : "Working and investing until your portfolio covers your spending"
        }
        emphasize
        explanation={explanations.timeToFreedom}
      >
        {timeToFreedom(summary)}
      </Stat>
      {summary !== null ? (
        <div className="flex flex-col gap-5 max-sm:grid max-sm:grid-cols-2 max-sm:gap-3">
          <Stat
            label="Freedom number"
            description="Portfolio needed, in today's money"
            compact
            explanation={explanations.fireNumber}
          >
            <NumberFlow
              value={summary.fireNumber}
              format={currencyFormat}
              locales={locale}
              plugins={numberFlowPlugins}
              transformTiming={transformTiming}
              spinTiming={spinTiming}
              opacityTiming={opacityTiming}
            />
          </Stat>
          <Stat
            label="In future dollars"
            description="The same portfolio at that date's prices"
            compact
            explanation={explanations.fireNumberFutureMoney}
          >
            <NumberFlow
              value={summary.fireNumberFutureMoney}
              format={currencyFormat}
              locales={locale}
              plugins={numberFlowPlugins}
              transformTiming={transformTiming}
              spinTiming={spinTiming}
              opacityTiming={opacityTiming}
            />
          </Stat>
          <Stat
            label="Monthly spending"
            description="What it pays out, in today's money"
            compact
            explanation={explanations.monthlySpending}
          >
            <NumberFlow
              value={summary.monthlySpending}
              format={currencyFormat}
              locales={locale}
              plugins={numberFlowPlugins}
              transformTiming={transformTiming}
              spinTiming={spinTiming}
              opacityTiming={opacityTiming}
            />
          </Stat>
          <Stat
            label="Share invested"
            description="Of your salary by then"
            compact
            explanation={explanations.savingsRateAtFreedom}
          >
            <NumberFlow
              value={summary.savingsRatePctAtFreedom / 100}
              format={percentFormat}
              locales={locale}
              plugins={numberFlowPlugins}
              transformTiming={transformTiming}
              spinTiming={spinTiming}
              opacityTiming={opacityTiming}
            />
          </Stat>
        </div>
      ) : null}
    </div>
  )
}
