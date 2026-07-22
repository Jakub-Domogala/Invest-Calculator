export interface InvestmentInputs {
  /** Length of the investment horizon, in years (0-50). */
  years: number
  /** Lump sum invested at the very start. */
  initialInvestment: number
  /** Amount contributed every month. */
  monthlyContribution: number
  /** How much the monthly contribution grows each year, in percent (0 = stays flat). */
  contributionIncreasePct: number
  /** Expected average annual growth rate, in percent. */
  annualReturnPct: number
  /** Expected average annual inflation (or deflation) rate, in percent. */
  annualInflationPct: number
  /** Stop making monthly contributions after this many years. `null` means contribute for the whole horizon. */
  contributionStopYears: number | null
}

export interface InvestmentDataPoint {
  month: number
  /** Total amount paid in so far (initial + contributions). */
  invested: number
  /** Total account value so far, including growth. */
  total: number
}

export interface InvestmentSummary {
  /** Account value at the end of the horizon. */
  finalBalance: number
  /** Total amount paid in over the whole horizon. */
  totalContributions: number
  /** How much prices grow (or shrink) over the horizon, e.g. 1.35 = 35% more expensive. */
  inflationMultiplier: number
  /** Final balance expressed in today's purchasing power. */
  inflationAdjustedBalance: number
}

export interface InvestmentResult {
  series: InvestmentDataPoint[]
  summary: InvestmentSummary
}

export function calculateInvestment({
  years,
  initialInvestment,
  monthlyContribution,
  contributionIncreasePct,
  annualReturnPct,
  annualInflationPct,
  contributionStopYears,
}: InvestmentInputs): InvestmentResult {
  const totalMonths = Math.round(years * 12)
  const stopMonth =
    contributionStopYears == null
      ? totalMonths
      : Math.round(contributionStopYears * 12)
  const monthlyRate = Math.pow(1 + annualReturnPct / 100, 1 / 12) - 1
  const contributionGrowthRate = 1 + contributionIncreasePct / 100

  const series: InvestmentDataPoint[] = [
    { month: 0, invested: initialInvestment, total: initialInvestment },
  ]

  let balance = initialInvestment
  let invested = initialInvestment

  for (let month = 1; month <= totalMonths; month++) {
    const contributionYear = Math.floor((month - 1) / 12)
    const scheduledContribution =
      monthlyContribution * Math.pow(contributionGrowthRate, contributionYear)
    const contribution = month <= stopMonth ? scheduledContribution : 0
    balance = (balance + contribution) * (1 + monthlyRate)
    invested += contribution
    series.push({ month, invested, total: balance })
  }

  const inflationMultiplier = Math.pow(1 + annualInflationPct / 100, years)
  const finalBalance = balance

  return {
    series,
    summary: {
      finalBalance,
      totalContributions: invested,
      inflationMultiplier,
      inflationAdjustedBalance: finalBalance / inflationMultiplier,
    },
  }
}

export interface RetirementIncomeInputs {
  /** Account value the withdrawal rate is applied to. */
  finalBalance: number
  /** Same inflation multiplier as the investment phase, for a today's-money figure. */
  inflationMultiplier: number
  /** Share of the balance withdrawn per year, in percent (the "4% rule" uses 4). */
  withdrawalRatePct: number
}

export interface RetirementIncomeResult {
  annualWithdrawal: number
  monthlyWithdrawal: number
  /** Monthly withdrawal expressed in today's purchasing power. */
  monthlyWithdrawalTodaysMoney: number
}

export function calculateRetirementIncome({
  finalBalance,
  inflationMultiplier,
  withdrawalRatePct,
}: RetirementIncomeInputs): RetirementIncomeResult {
  const annualWithdrawal = finalBalance * (withdrawalRatePct / 100)
  const monthlyWithdrawal = annualWithdrawal / 12

  return {
    annualWithdrawal,
    monthlyWithdrawal,
    monthlyWithdrawalTodaysMoney: monthlyWithdrawal / inflationMultiplier,
  }
}

export interface RetirementDrawdownInputs {
  /** Balance at the start of retirement, before any withdrawals. */
  startingBalance: number
  /** Share of the *current* balance withdrawn every year. */
  withdrawalRatePct: number
  /** Same growth rate as the investment phase, applied to what's left after each withdrawal. */
  annualReturnPct: number
  /** Same inflation rate as the investment phase. */
  annualInflationPct: number
  /** How many years to simulate withdrawals for. */
  years: number
}

export interface RetirementDrawdownPoint {
  year: number
  /** That year's withdrawal, in the dollars of that year. */
  withdrawal: number
  /** That year's withdrawal, expressed in today's purchasing power. */
  withdrawalTodaysMoney: number
}

export type RetirementDrawdownTrend = "increasing" | "decreasing" | "flat"

export interface RetirementDrawdownResult {
  series: RetirementDrawdownPoint[]
  /** Whether the *purchasing power* of the withdrawals rises, falls, or holds over the horizon. */
  trend: RetirementDrawdownTrend
}

// Below this, a change over the whole horizon reads as noise rather than a
// real trend (e.g. return and inflation nearly offsetting each other).
const FLAT_TREND_THRESHOLD = 0.02

/**
 * Simulates withdrawing a fixed *percentage* of the balance once a year
 * (re-evaluated against whatever's left, not a fixed dollar amount), with
 * the remainder continuing to grow at the same rate as the investment
 * phase. Because the withdrawal is a constant share of a compounding
 * balance, its purchasing power trend is set from year one: it rises, falls,
 * or holds depending on whether growth net of withdrawals outpaces inflation.
 */
export function calculateRetirementDrawdown({
  startingBalance,
  withdrawalRatePct,
  annualReturnPct,
  annualInflationPct,
  years,
}: RetirementDrawdownInputs): RetirementDrawdownResult {
  const withdrawalRate = withdrawalRatePct / 100
  const returnRate = annualReturnPct / 100
  const inflationRate = annualInflationPct / 100
  const totalYears = Math.round(years)

  const series: RetirementDrawdownPoint[] = []
  let balance = startingBalance

  for (let year = 1; year <= totalYears; year++) {
    const withdrawal = balance * withdrawalRate
    const withdrawalTodaysMoney = withdrawal / Math.pow(1 + inflationRate, year)
    series.push({ year, withdrawal, withdrawalTodaysMoney })
    balance = (balance - withdrawal) * (1 + returnRate)
  }

  const first = series[0]?.withdrawalTodaysMoney ?? 0
  const last = series[series.length - 1]?.withdrawalTodaysMoney ?? 0
  const relativeChange = first === 0 ? 0 : (last - first) / first

  let trend: RetirementDrawdownTrend = "flat"
  if (relativeChange > FLAT_TREND_THRESHOLD) {
    trend = "increasing"
  } else if (relativeChange < -FLAT_TREND_THRESHOLD) {
    trend = "decreasing"
  }

  return { series, trend }
}

/** Formats a month count as "Xy Ym", omitting the part that's zero. */
export function formatYearsMonths(months: number): string {
  const years = Math.floor(months / 12)
  const remainingMonths = Math.round(months % 12)

  if (years === 0) {
    return `${remainingMonths}m`
  }

  if (remainingMonths === 0) {
    return `${years}y`
  }

  return `${years}y ${remainingMonths}m`
}

const TICK_STEP_CANDIDATES_MONTHS = [
  1, 3, 6, 12, 24, 36, 60, 120, 180, 240, 300, 360,
]

/** Picks a "nice" month interval for x-axis ticks, aiming for roughly 6-8 ticks. */
export function computeTickStepMonths(totalMonths: number): number {
  if (totalMonths <= 0) {
    return 1
  }

  for (const step of TICK_STEP_CANDIDATES_MONTHS) {
    if (totalMonths / step <= 8) {
      return step
    }
  }

  return TICK_STEP_CANDIDATES_MONTHS[TICK_STEP_CANDIDATES_MONTHS.length - 1]
}

const TICK_STEP_CANDIDATES_YEARS = [1, 2, 5, 10, 15, 20, 25, 30, 40, 50, 100]

/** Picks a "nice" year interval for x-axis ticks, aiming for roughly 6-8 ticks. */
export function computeTickStepYears(totalYears: number): number {
  if (totalYears <= 0) {
    return 1
  }

  for (const step of TICK_STEP_CANDIDATES_YEARS) {
    if (totalYears / step <= 8) {
      return step
    }
  }

  return TICK_STEP_CANDIDATES_YEARS[TICK_STEP_CANDIDATES_YEARS.length - 1]
}
