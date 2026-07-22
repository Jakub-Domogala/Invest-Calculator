import NumberFlow from "@number-flow/react"

import { SliderInputField } from "@/components/slider-input-field"
import { Stat } from "@/components/stat"
import { Button } from "@/components/ui/button"
import type { RetirementIncomeResult } from "@/lib/investment-calculator"
import {
  currencyFormat,
  locale,
  numberFlowPlugins,
  opacityTiming,
  spinTiming,
  transformTiming,
} from "@/lib/number-flow"
import { cn } from "@/lib/utils"

export const DEFAULT_WITHDRAWAL_RATE_PCT = 4

export function RetirementIncome({
  withdrawalRatePct,
  onWithdrawalRatePctChange,
  result,
  className,
}: {
  withdrawalRatePct: number
  onWithdrawalRatePctChange: (value: number) => void
  result: RetirementIncomeResult
  className?: string
}) {
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <SliderInputField
        id="withdrawal-rate"
        label="Withdrawal rate"
        value={withdrawalRatePct}
        onChange={onWithdrawalRatePctChange}
        min={2}
        max={6}
        step={0.25}
        unit="%"
        typedMin={0}
        typedMax={15}
        endAction={
          <Button
            type="button"
            variant="outline"
            size="xs"
            aria-label={`Set to the ${DEFAULT_WITHDRAWAL_RATE_PCT}% rule`}
            onClick={() => onWithdrawalRatePctChange(DEFAULT_WITHDRAWAL_RATE_PCT)}
          >
            4% rule
          </Button>
        }
      />
      <div className="grid grid-cols-3 gap-4 max-sm:gap-3">
        <Stat label="Annual withdrawal" description="At this rate, per year" compact>
          <NumberFlow
            value={result.annualWithdrawal}
            format={currencyFormat}
            locales={locale}
            plugins={numberFlowPlugins}
            transformTiming={transformTiming}
            spinTiming={spinTiming}
            opacityTiming={opacityTiming}
          />
        </Stat>
        <Stat label="Monthly withdrawal" description="Annual, divided by 12" compact>
          <NumberFlow
            value={result.monthlyWithdrawal}
            format={currencyFormat}
            locales={locale}
            plugins={numberFlowPlugins}
            transformTiming={transformTiming}
            spinTiming={spinTiming}
            opacityTiming={opacityTiming}
          />
        </Stat>
        <Stat
          label="Monthly, today's money"
          description="Adjusted for inflation"
          compact
        >
          <NumberFlow
            value={result.monthlyWithdrawalTodaysMoney}
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
