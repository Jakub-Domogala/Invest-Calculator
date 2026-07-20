import * as React from "react"

import { InvestmentChart } from "@/components/investment-chart"
import { InvestmentSummary } from "@/components/investment-summary"
import { SliderInputField } from "@/components/slider-input-field"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { calculateInvestment, formatYearsMonths } from "@/lib/investment-calculator"
import {
  INITIAL_INVESTMENT_STEPS,
  MONTHLY_CONTRIBUTION_STEPS,
} from "@/lib/slider-steps"

export function InvestmentCalculator() {
  const [years, setYears] = React.useState(20)
  const [initialInvestment, setInitialInvestment] = React.useState(10_000)
  const [monthlyContribution, setMonthlyContribution] = React.useState(500)
  const [annualReturnPct, setAnnualReturnPct] = React.useState(7)
  const [annualInflationPct, setAnnualInflationPct] = React.useState(2.5)
  const [stopContributionsEnabled, setStopContributionsEnabled] =
    React.useState(false)
  const [stopContributionsYears, setStopContributionsYears] =
    React.useState(10)

  const effectiveStopYears = Math.min(
    stopContributionsYears,
    Math.max(years, 1)
  )

  const { series, summary } = React.useMemo(
    () =>
      calculateInvestment({
        years,
        initialInvestment,
        monthlyContribution,
        annualReturnPct,
        annualInflationPct,
        contributionStopYears: stopContributionsEnabled
          ? effectiveStopYears
          : null,
      }),
    [
      years,
      initialInvestment,
      monthlyContribution,
      annualReturnPct,
      annualInflationPct,
      stopContributionsEnabled,
      effectiveStopYears,
    ]
  )

  const totalMonths = Math.round(years * 12)

  return (
    <div className="mx-auto flex min-h-svh max-w-6xl flex-col gap-6 p-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-medium">
            Investment Calculator
          </h1>
          <p className="text-sm text-muted-foreground">
            Adjust any value below — everything recalculates instantly.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Your plan</CardTitle>
          <CardDescription>
            Set your contributions and expected market conditions.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
          <SliderInputField
            id="years"
            label="Investment period"
            value={years}
            onChange={setYears}
            min={0}
            max={50}
            step={1}
            unit="yr"
          />
          <SliderInputField
            id="initial-investment"
            label="Initial investment"
            value={initialInvestment}
            onChange={setInitialInvestment}
            steps={INITIAL_INVESTMENT_STEPS}
            prefix="$"
          />
          <SliderInputField
            id="monthly-contribution"
            label="Monthly contribution"
            value={monthlyContribution}
            onChange={setMonthlyContribution}
            steps={MONTHLY_CONTRIBUTION_STEPS}
            prefix="$"
          />
          <SliderInputField
            id="annual-return"
            label="Expected annual return"
            value={annualReturnPct}
            onChange={setAnnualReturnPct}
            min={0}
            max={25}
            step={0.5}
            unit="%"
          />
          <SliderInputField
            id="annual-inflation"
            label="Expected inflation"
            value={annualInflationPct}
            onChange={setAnnualInflationPct}
            min={-2}
            max={5}
            step={0.25}
            unit="%"
          />
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="stop-contributions-toggle">
                Stop contributions early
              </Label>
              <Switch
                id="stop-contributions-toggle"
                checked={stopContributionsEnabled}
                onCheckedChange={setStopContributionsEnabled}
                disabled={years === 0}
              />
            </div>
            {stopContributionsEnabled ? (
              <SliderInputField
                id="stop-contributions-years"
                label="Stop after"
                value={effectiveStopYears}
                onChange={setStopContributionsYears}
                min={1}
                max={Math.max(years, 1)}
                step={1}
                unit="yr"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Contributing for the full {years}-year period.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Growth over time</CardTitle>
          <CardDescription>
            Money invested vs. total value, compounding monthly over{" "}
            {formatYearsMonths(totalMonths)}.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 lg:flex-row">
          <InvestmentChart
            series={series}
            totalMonths={totalMonths}
            className="lg:flex-1"
          />

          <Separator orientation="vertical" className="hidden lg:block" />
          <Separator className="lg:hidden" />

          <InvestmentSummary
            summary={summary}
            totalMonths={totalMonths}
            className="lg:w-56"
          />
        </CardContent>
      </Card>
    </div>
  )
}
