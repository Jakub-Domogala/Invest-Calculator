import * as React from "react"
import { RotateCcw } from "lucide-react"

import { FreedomChart } from "@/components/freedom-chart"
import { FreedomSummary } from "@/components/freedom-summary"
import { SliderInputField } from "@/components/slider-input-field"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { calculateFreedom } from "@/lib/freedom-calculator"
import {
  INITIAL_INVESTMENT_STEPS,
  MONTHLY_SALARY_STEPS,
} from "@/lib/slider-steps"

const DEFAULT_CURRENT_SAVINGS = 10_000
const DEFAULT_MONTHLY_SALARY = 5_000
const DEFAULT_SAVINGS_RATE_PCT = 20
const DEFAULT_ANNUAL_RETURN_PCT = 7
const DEFAULT_ANNUAL_INFLATION_PCT = 2.5
const DEFAULT_LIFESTYLE_INFLATION_PCT = 1
const DEFAULT_WITHDRAWAL_RATE_PCT = 4

// Long-run historical averages, offered as one-tap presets.
const AVERAGE_INFLATION_PCT = 2.5
const SP500_AVERAGE_RETURN_PCT = 10

export function FreedomCalculator() {
  const [currentSavings, setCurrentSavings] = React.useState(
    DEFAULT_CURRENT_SAVINGS
  )
  const [monthlySalary, setMonthlySalary] = React.useState(
    DEFAULT_MONTHLY_SALARY
  )
  const [savingsRatePct, setSavingsRatePct] = React.useState(
    DEFAULT_SAVINGS_RATE_PCT
  )
  const [annualReturnPct, setAnnualReturnPct] = React.useState(
    DEFAULT_ANNUAL_RETURN_PCT
  )
  const [annualInflationPct, setAnnualInflationPct] = React.useState(
    DEFAULT_ANNUAL_INFLATION_PCT
  )
  const [lifestyleInflationPct, setLifestyleInflationPct] = React.useState(
    DEFAULT_LIFESTYLE_INFLATION_PCT
  )
  const [withdrawalRatePct, setWithdrawalRatePct] = React.useState(
    DEFAULT_WITHDRAWAL_RATE_PCT
  )

  function resetToDefaults() {
    setCurrentSavings(DEFAULT_CURRENT_SAVINGS)
    setMonthlySalary(DEFAULT_MONTHLY_SALARY)
    setSavingsRatePct(DEFAULT_SAVINGS_RATE_PCT)
    setAnnualReturnPct(DEFAULT_ANNUAL_RETURN_PCT)
    setAnnualInflationPct(DEFAULT_ANNUAL_INFLATION_PCT)
    setLifestyleInflationPct(DEFAULT_LIFESTYLE_INFLATION_PCT)
    setWithdrawalRatePct(DEFAULT_WITHDRAWAL_RATE_PCT)
  }

  const { series, summary } = React.useMemo(
    () =>
      calculateFreedom({
        currentSavings,
        monthlySalary,
        savingsRatePct,
        annualReturnPct,
        annualInflationPct,
        lifestyleInflationPct,
        withdrawalRatePct,
      }),
    [
      currentSavings,
      monthlySalary,
      savingsRatePct,
      annualReturnPct,
      annualInflationPct,
      lifestyleInflationPct,
      withdrawalRatePct,
    ]
  )

  return (
    <div className="mx-auto flex min-h-svh max-w-6xl flex-col gap-[30px] p-6 max-sm:h-svh max-sm:snap-y max-sm:snap-mandatory max-sm:overflow-y-auto max-sm:pb-0">
      <header className="flex items-center justify-between gap-4 max-sm:shrink-0 max-sm:snap-start max-sm:scroll-mt-6">
        <h1 className="font-heading text-2xl font-medium">
          Freedom Calculator
        </h1>
        <ThemeToggle />
      </header>

      <Card className="max-sm:shrink-0 max-sm:snap-start max-sm:scroll-mt-[5px]">
        <CardHeader>
          <CardTitle>Your plan</CardTitle>
          <CardDescription>
            Set your income, how much of it you invest, and expected market
            conditions.
          </CardDescription>
          <CardAction>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Reset to defaults"
              onClick={resetToDefaults}
            >
              <RotateCcw />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          <SliderInputField
            id="freedom-monthly-salary"
            label="Monthly salary"
            value={monthlySalary}
            onChange={setMonthlySalary}
            steps={MONTHLY_SALARY_STEPS}
            prefix="$"
            typedMin={0}
            typedMax={1_000_000}
          />
          <SliderInputField
            id="freedom-savings-rate"
            label="Share of salary invested"
            value={savingsRatePct}
            onChange={setSavingsRatePct}
            min={0}
            max={80}
            step={1}
            unit="%"
            typedMin={0}
            typedMax={100}
          />
          <SliderInputField
            id="freedom-current-savings"
            label="Already invested"
            value={currentSavings}
            onChange={setCurrentSavings}
            steps={INITIAL_INVESTMENT_STEPS}
            prefix="$"
            typedMin={0}
            typedMax={50_000_000}
          />
          <SliderInputField
            id="freedom-annual-return"
            label="Expected annual return"
            value={annualReturnPct}
            onChange={setAnnualReturnPct}
            min={0}
            max={25}
            step={0.5}
            unit="%"
            typedMin={0}
            typedMax={50}
            endAction={
              <Button
                type="button"
                variant="outline"
                size="xs"
                aria-label={`Set to the S&P 500 average of ${SP500_AVERAGE_RETURN_PCT}%`}
                onClick={() => setAnnualReturnPct(SP500_AVERAGE_RETURN_PCT)}
              >
                S&amp;P avg
              </Button>
            }
          />
          <SliderInputField
            id="freedom-annual-inflation"
            label="Expected inflation"
            value={annualInflationPct}
            onChange={setAnnualInflationPct}
            min={-2}
            max={5}
            step={0.25}
            unit="%"
            typedMin={-10}
            typedMax={15}
            endAction={
              <Button
                type="button"
                variant="outline"
                size="xs"
                aria-label={`Set to the average of ${AVERAGE_INFLATION_PCT}%`}
                onClick={() => setAnnualInflationPct(AVERAGE_INFLATION_PCT)}
              >
                avg
              </Button>
            }
          />
          <SliderInputField
            id="freedom-lifestyle-inflation"
            label="Lifestyle inflation"
            value={lifestyleInflationPct}
            onChange={setLifestyleInflationPct}
            min={0}
            max={5}
            step={0.25}
            unit="%"
            typedMin={-5}
            typedMax={20}
          />
          <SliderInputField
            id="freedom-withdrawal-rate"
            label="Withdrawal rate"
            value={withdrawalRatePct}
            onChange={setWithdrawalRatePct}
            min={2}
            max={6}
            step={0.25}
            unit="%"
            typedMin={0.5}
            typedMax={15}
            endAction={
              <Button
                type="button"
                variant="outline"
                size="xs"
                aria-label={`Set to the ${DEFAULT_WITHDRAWAL_RATE_PCT}% rule`}
                onClick={() =>
                  setWithdrawalRatePct(DEFAULT_WITHDRAWAL_RATE_PCT)
                }
              >
                4% rule
              </Button>
            }
          />
        </CardContent>
      </Card>

      {/* Same trick as the last card of the investment calculator: on mobile
          the wrapper is exactly one viewport tall and the spacer takes what
          the card leaves over, so scrolling ends with the card fully visible. */}
      <div className="max-sm:flex max-sm:h-svh max-sm:shrink-0 max-sm:flex-col">
        <Card className="max-sm:shrink-0 max-sm:snap-start max-sm:scroll-mt-6 max-sm:[--card-spacing:--spacing(3)]">
          <CardHeader>
            <CardTitle>Path to freedom</CardTitle>
            <CardDescription>
              In today&apos;s money. Lifestyle inflation is how much your salary
              and spending grow each year on top of prices; it stops once you
              are free.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 lg:flex-row">
            <FreedomChart
              series={series}
              fireMonth={summary?.fireMonth ?? null}
              className="lg:flex-1"
            />

            <Separator orientation="vertical" className="hidden lg:block" />
            <Separator className="lg:hidden" />

            <FreedomSummary summary={summary} className="lg:w-56" />
          </CardContent>
        </Card>

        <div aria-hidden className="hidden max-sm:block max-sm:flex-1" />
      </div>
    </div>
  )
}
