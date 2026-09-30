import NumberFlow from "@number-flow/react"

import { Stat } from "@/components/stat"
import {
  MAX_FREEDOM_MONTHS,
  type FreedomSummary as FreedomSummaryData,
} from "@/lib/freedom-calculator"
import { formatYearsMonths } from "@/lib/investment-calculator"
import {
  currencyFormat,
  locale,
  numberFlowPlugins,
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
  summary,
  className,
}: {
  summary: FreedomSummaryData | null
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-5", className)}>
      <Stat
        label="Time to freedom"
        description={
          summary === null
            ? "Your spending grows as fast as your portfolio. Invest a larger share or lower lifestyle inflation."
            : "Working and investing until your portfolio covers your spending"
        }
        emphasize
      >
        {timeToFreedom(summary)}
      </Stat>
      {summary !== null ? (
        <div className="flex flex-col gap-5 max-sm:grid max-sm:grid-cols-3 max-sm:gap-3">
          <Stat
            label="Freedom number"
            description="Portfolio needed, in today's money"
            compact
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
        </div>
      ) : null}
    </div>
  )
}
