export interface FreedomInputs {
  /** Amount already invested today. */
  currentSavings: number
  /** Take-home pay per month, today. */
  monthlySalary: number
  /**
   * Share of today's salary that is invested, in percent. The rest is spent.
   * The share drifts over time when salary and spending grow at different
   * rates.
   */
  savingsRatePct: number
  /** How much the salary grows each year *on top of* price inflation, in percent. */
  salaryIncreasePct: number
  /** Expected average annual growth rate, in percent. */
  annualReturnPct: number
  /** Expected average annual price inflation, in percent. */
  annualInflationPct: number
  /**
   * How much spending grows each year *on top of* price inflation, in
   * percent. Stops once financial independence is reached.
   */
  lifestyleInflationPct: number
  /** Share of the portfolio withdrawn per year once free (the "4% rule" uses 4). */
  withdrawalRatePct: number
}

/** All amounts are in today's money. */
export interface FreedomDataPoint {
  month: number
  balance: number
  /** Portfolio needed to cover that month's spending level forever. */
  target: number
}

export interface FreedomSummary {
  /** Months of working and investing until the balance reaches the target. */
  fireMonth: number
  /** Portfolio needed at that point, in today's money. */
  fireNumber: number
  /** The same portfolio in the dollars of that future date. */
  fireNumberFutureMoney: number
  /** Monthly spending the portfolio then covers, in today's money. */
  monthlySpending: number
  /** Monthly salary by then, in today's money. */
  monthlySalary: number
  /** Share of the salary being invested by then, in percent. */
  savingsRatePctAtFreedom: number
}

export interface FreedomResult {
  series: FreedomDataPoint[]
  /** `null` when the target isn't reached within `MAX_FREEDOM_MONTHS`. */
  summary: FreedomSummary | null
}

/** Past this the answer is "never" for any practical purpose. */
export const MAX_FREEDOM_MONTHS = 100 * 12

// How much of an unreached plan to chart.
const UNREACHED_CHART_MONTHS = 50 * 12

// How long to keep charting after freedom is reached: a third of the time it
// took to get there, within these bounds.
const MIN_TAIL_MONTHS = 5 * 12
const MAX_TAIL_MONTHS = 15 * 12

/**
 * Simulates working and investing whatever isn't spent until the portfolio
 * can cover spending forever at the given withdrawal rate.
 *
 * Everything is tracked in today's money. Price inflation raises salary,
 * spending and the target alike, so it cancels out of all of them and only
 * shows up as a lower ("real") investment return. What is left is growth
 * beyond prices: salary grows by the salary increase, spending by lifestyle
 * inflation, and the difference between the two is invested. Raises that
 * outpace lifestyle inflation grow the invested share; growing spending moves
 * the target away until it's caught. Spending never exceeds the salary.
 *
 * Once free, lifestyle inflation stops: spending is frozen in today's money
 * (it still rises with prices), which is what a withdrawal rate assumes.
 */
export function calculateFreedom({
  currentSavings,
  monthlySalary,
  savingsRatePct,
  salaryIncreasePct,
  annualReturnPct,
  annualInflationPct,
  lifestyleInflationPct,
  withdrawalRatePct,
}: FreedomInputs): FreedomResult {
  const savingsRate = Math.min(1, Math.max(0, savingsRatePct / 100))
  const withdrawalRate = Math.max(withdrawalRatePct, 0.1) / 100
  const inflationRate = annualInflationPct / 100
  const realMonthlyReturn =
    Math.pow((1 + annualReturnPct / 100) / (1 + inflationRate), 1 / 12) - 1
  // Both applied monthly rather than as a yearly step, so the target is a
  // smooth curve instead of a staircase.
  const monthlySalaryGrowth = Math.pow(1 + salaryIncreasePct / 100, 1 / 12)
  const monthlyLifestyleGrowth = Math.pow(
    1 + lifestyleInflationPct / 100,
    1 / 12
  )

  const targetFor = (spending: number) => (spending * 12) / withdrawalRate

  let balance = currentSavings
  let salary = monthlySalary
  let spending = salary * (1 - savingsRate)
  let target = targetFor(spending)
  let month = 0
  let fireMonth: number | null = balance >= target ? 0 : null

  const series: FreedomDataPoint[] = [{ month, balance, target }]

  while (fireMonth === null && month < MAX_FREEDOM_MONTHS) {
    month++
    balance = (balance + salary - spending) * (1 + realMonthlyReturn)
    salary *= monthlySalaryGrowth
    spending = Math.min(spending * monthlyLifestyleGrowth, salary)
    target = targetFor(spending)
    series.push({ month, balance, target })
    if (balance >= target) {
      fireMonth = month
    }
  }

  if (fireMonth === null) {
    return {
      series: series.slice(0, UNREACHED_CHART_MONTHS + 1),
      summary: null,
    }
  }

  const monthlySpending = spending
  const salaryAtFreedom = salary
  const tailMonths = Math.min(
    MAX_TAIL_MONTHS,
    Math.max(MIN_TAIL_MONTHS, Math.round(fireMonth / 36) * 12)
  )

  for (let tail = 1; tail <= tailMonths; tail++) {
    month++
    balance = Math.max(0, (balance - monthlySpending) * (1 + realMonthlyReturn))
    series.push({ month, balance, target })
  }

  return {
    series,
    summary: {
      fireMonth,
      fireNumber: target,
      fireNumberFutureMoney:
        target * Math.pow(1 + inflationRate, fireMonth / 12),
      monthlySpending,
      monthlySalary: salaryAtFreedom,
      savingsRatePctAtFreedom:
        salaryAtFreedom > 0 ? (1 - monthlySpending / salaryAtFreedom) * 100 : 0,
    },
  }
}
