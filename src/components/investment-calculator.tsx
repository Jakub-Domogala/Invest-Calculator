import * as React from "react"
import { RotateCcw } from "lucide-react"

import { InvestmentChart } from "@/components/investment-chart"
import { InvestmentSummary } from "@/components/investment-summary"
import {
  DEFAULT_DRAWDOWN_YEARS,
  RetirementDrawdown,
} from "@/components/retirement-drawdown"
import {
  DEFAULT_WITHDRAWAL_RATE_PCT,
  RetirementIncome,
} from "@/components/retirement-income"
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
import {
  calculateInvestment,
  calculateRetirementDrawdown,
  calculateRetirementIncome,
  formatYearsMonths,
} from "@/lib/investment-calculator"
import {
  INITIAL_INVESTMENT_STEPS,
  MONTHLY_CONTRIBUTION_STEPS,
} from "@/lib/slider-steps"

const DEFAULT_YEARS = 20
const DEFAULT_INITIAL_INVESTMENT = 10_000
const DEFAULT_MONTHLY_CONTRIBUTION = 500
const DEFAULT_CONTRIBUTION_INCREASE_PCT = 0
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
  const [contributionIncreasePct, setContributionIncreasePct] = React.useState(
    DEFAULT_CONTRIBUTION_INCREASE_PCT
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
  const [withdrawalRatePct, setWithdrawalRatePct] = React.useState(
    DEFAULT_WITHDRAWAL_RATE_PCT
  )
  const [drawdownYears, setDrawdownYears] = React.useState(
    DEFAULT_DRAWDOWN_YEARS
  )

  function resetToDefaults() {
    setYears(DEFAULT_YEARS)
    setInitialInvestment(DEFAULT_INITIAL_INVESTMENT)
    setMonthlyContribution(DEFAULT_MONTHLY_CONTRIBUTION)
    setContributionIncreasePct(DEFAULT_CONTRIBUTION_INCREASE_PCT)
    setAnnualReturnPct(DEFAULT_ANNUAL_RETURN_PCT)
    setAnnualInflationPct(DEFAULT_ANNUAL_INFLATION_PCT)
    setStopContributionsEnabled(DEFAULT_STOP_CONTRIBUTIONS_ENABLED)
    setStopContributionsYears(DEFAULT_STOP_CONTRIBUTIONS_YEARS)
    setWithdrawalRatePct(DEFAULT_WITHDRAWAL_RATE_PCT)
    setDrawdownYears(DEFAULT_DRAWDOWN_YEARS)
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
        contributionIncreasePct,
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
      contributionIncreasePct,
      annualReturnPct,
      annualInflationPct,
      stopContributionsEnabled,
      effectiveStopYears,
    ]
  )

  const totalMonths = Math.round(years * 12)

  const retirementIncome = calculateRetirementIncome({
    finalBalance: summary.finalBalance,
    inflationMultiplier: summary.inflationMultiplier,
    withdrawalRatePct,
  })

  const retirementDrawdown = calculateRetirementDrawdown({
    startingBalance: summary.finalBalance,
    withdrawalRatePct,
    annualReturnPct,
    annualInflationPct,
    years: drawdownYears,
  })

  return (
    <div className="mx-auto flex min-h-svh max-w-6xl flex-col gap-[30px] p-6 max-sm:h-svh max-sm:snap-y max-sm:snap-mandatory max-sm:overflow-y-auto max-sm:pb-0">
      <header className="flex items-center justify-between gap-4 max-sm:shrink-0 max-sm:snap-start max-sm:scroll-mt-6">
        <h1 className="font-heading text-2xl font-medium">
          Investment Calculator
        </h1>
        <ThemeToggle />
      </header>

      <Card className="max-sm:shrink-0 max-sm:snap-start max-sm:scroll-mt-[5px]">
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
            typedMin={0}
            typedMax={100}
          />
          <SliderInputField
            id="initial-investment"
            label="Initial investment"
            value={initialInvestment}
            onChange={setInitialInvestment}
            steps={INITIAL_INVESTMENT_STEPS}
            prefix="$"
            typedMin={0}
            typedMax={5_000_000}
          />
          <SliderInputField
            id="monthly-contribution"
            label="Monthly contribution"
            value={monthlyContribution}
            onChange={setMonthlyContribution}
            steps={MONTHLY_CONTRIBUTION_STEPS}
            prefix="$"
            typedMin={0}
            typedMax={500_000}
          />
          <SliderInputField
            id="contribution-increase"
            label="Annual contribution increase"
            value={contributionIncreasePct}
            onChange={setContributionIncreasePct}
            min={0}
            max={10}
            step={0.5}
            unit="%"
            typedMin={0}
            typedMax={25}
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
            id="annual-inflation"
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
                  typedMin={1}
                  typedMax={Math.max(years, 1) * 2}
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

      {/* On mobile this wrapper is capped at exactly one viewport tall, with
          the card at its natural height and the spacer below claiming
          whatever room is left over via flex-1. That bounds the max scroll
          position to right where the card is fully visible, instead of a
          fixed-height spacer adding extra scrollable room past it. */}
      <div className="max-sm:flex max-sm:h-svh max-sm:shrink-0 max-sm:flex-col">
        <Card className="max-sm:shrink-0 max-sm:snap-start max-sm:scroll-mt-6">
          <CardHeader>
            <CardTitle>Retirement income</CardTitle>
            <CardDescription>
              What your final balance could pay out for the rest of your
              life, using a fixed withdrawal rate.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RetirementIncome
              withdrawalRatePct={withdrawalRatePct}
              onWithdrawalRatePctChange={setWithdrawalRatePct}
              result={retirementIncome}
            />
            <Separator />
            <RetirementDrawdown
              years={drawdownYears}
              onYearsChange={setDrawdownYears}
              series={retirementDrawdown.series}
              trend={retirementDrawdown.trend}
            />
          </CardContent>
        </Card>

        <div aria-hidden className="hidden max-sm:block max-sm:flex-1" />
      </div>
    </div>
  )
}
