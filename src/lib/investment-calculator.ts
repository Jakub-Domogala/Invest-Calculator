export interface InvestmentInputs {
  /** Length of the investment horizon, in years (0-50). */
  years: number
  /** Lump sum invested at the very start. */
  initialInvestment: number
  /** Amount contributed every month. */
  monthlyContribution: number
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

  const series: InvestmentDataPoint[] = [
    { month: 0, invested: initialInvestment, total: initialInvestment },
  ]

  let balance = initialInvestment
  let invested = initialInvestment

  for (let month = 1; month <= totalMonths; month++) {
    const contribution = month <= stopMonth ? monthlyContribution : 0
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
