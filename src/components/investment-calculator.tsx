import * as React from "react"
import { RotateCcw } from "lucide-react"

import { InvestmentChart } from "@/components/investment-chart"
import { InvestmentSummary } from "@/components/investment-summary"
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
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { calculateInvestment, formatYearsMonths } from "@/lib/investment-calculator"
import {
  INITIAL_INVESTMENT_STEPS,
  MONTHLY_CONTRIBUTION_STEPS,
} from "@/lib/slider-steps"

const DEFAULT_YEARS = 20
const DEFAULT_INITIAL_INVESTMENT = 10_000
const DEFAULT_MONTHLY_CONTRIBUTION = 500
const DEFAULT_ANNUAL_RETURN_PCT = 7
const DEFAULT_ANNUAL_INFLATION_PCT = 2.5
const DEFAULT_STOP_CONTRIBUTIONS_ENABLED = false
const DEFAULT_STOP_CONTRIBUTIONS_YEARS = 10

// Long-run historical averages, offered as one-tap presets.
const AVERAGE_INFLATION_PCT = 2.5
const SP500_AVERAGE_RETURN_PCT = 10

export function InvestmentCalculator() {
  const [years, setYears] = React.useState(DEFAULT_YEARS)
  const [initialInvestment, setInitialInvestment] = React.useState(
    DEFAULT_INITIAL_INVESTMENT
  )
  const [monthlyContribution, setMonthlyContribution] = React.useState(
    DEFAULT_MONTHLY_CONTRIBUTION
  )
  const [annualReturnPct, setAnnualReturnPct] = React.useState(
    DEFAULT_ANNUAL_RETURN_PCT
  )
  const [annualInflationPct, setAnnualInflationPct] = React.useState(
    DEFAULT_ANNUAL_INFLATION_PCT
  )
  const [stopContributionsEnabled, setStopContributionsEnabled] =
    React.useState(DEFAULT_STOP_CONTRIBUTIONS_ENABLED)
  const [stopContributionsYears, setStopContributionsYears] = React.useState(
    DEFAULT_STOP_CONTRIBUTIONS_YEARS
  )

  function resetToDefaults() {
    setYears(DEFAULT_YEARS)
    setInitialInvestment(DEFAULT_INITIAL_INVESTMENT)
    setMonthlyContribution(DEFAULT_MONTHLY_CONTRIBUTION)
    setAnnualReturnPct(DEFAULT_ANNUAL_RETURN_PCT)
    setAnnualInflationPct(DEFAULT_ANNUAL_INFLATION_PCT)
    setStopContributionsEnabled(DEFAULT_STOP_CONTRIBUTIONS_ENABLED)
    setStopContributionsYears(DEFAULT_STOP_CONTRIBUTIONS_YEARS)
  }

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
    <div className="mx-auto flex min-h-svh max-w-6xl flex-col gap-[30px] p-6 max-sm:h-svh max-sm:snap-y max-sm:snap-mandatory max-sm:overflow-y-auto max-sm:pb-0">
      <header className="flex items-center justify-between gap-4 max-sm:shrink-0 max-sm:snap-start max-sm:scroll-mt-6">
        <h1 className="font-heading text-2xl font-medium">
          Investment Calculator
        </h1>
        <ThemeToggle />
      </header>

      <Card className="max-sm:shrink-0">
        <CardHeader>
          <CardTitle>Your plan</CardTitle>
          <CardDescription>
            Set your contributions and expected market conditions.
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
            id="annual-inflation"
            label="Expected inflation"
            value={annualInflationPct}
            onChange={setAnnualInflationPct}
            min={-2}
            max={5}
            step={0.25}
            unit="%"
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
            <div className="min-h-[52px]">
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
                <p className="flex h-[52px] items-center text-sm text-muted-foreground">
                  Contributing for the full {years}-year period.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* On mobile this wrapper is capped at exactly one viewport tall, with
          the card at its natural height and the spacer below claiming
          whatever room is left over via flex-1. That bounds the max scroll
          position to right where the card is fully visible, instead of a
          fixed-height spacer adding extra scrollable room past it. */}
      <div className="max-sm:flex max-sm:h-svh max-sm:shrink-0 max-sm:flex-col">
        <Card className="max-sm:shrink-0 max-sm:snap-start max-sm:scroll-mt-[23px] max-sm:[--card-spacing:--spacing(3)]">
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

        <div aria-hidden className="hidden max-sm:block max-sm:flex-1" />
      </div>
    </div>
  )
}
