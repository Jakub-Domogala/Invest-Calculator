import {
  MAX_FREEDOM_MONTHS,
  type FreedomInputs,
  type FreedomSummary,
} from "@/lib/freedom-calculator"
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format"
import {
  formatYearsMonths,
  type InvestmentInputs,
  type InvestmentSummary,
  type RetirementIncomeResult,
} from "@/lib/investment-calculator"

/** How a result was calculated, shown when hovering or tapping it. */
export interface StatExplanation {
  /** The equation in words, e.g. "final balance ÷ inflation multiplier". */
  formula: string
  /** The same equation with the actual numbers filled in, ending in the result. */
  filledIn?: string
  /** What each number in the equation is. */
  terms?: { label: string; value: string }[]
  note?: string
}

type Terms = NonNullable<StatExplanation["terms"]>

function formatMultiplier(value: number): string {
  return `${formatNumber(value, 4)}×`
}

export function explainInvestment(
  inputs: InvestmentInputs,
  summary: InvestmentSummary
) {
  const totalMonths = Math.round(inputs.years * 12)
  const contributingMonths =
    inputs.contributionStopYears == null
      ? totalMonths
      : Math.min(totalMonths, Math.round(inputs.contributionStopYears * 12))
  const monthlyReturnPct =
    (Math.pow(1 + inputs.annualReturnPct / 100, 1 / 12) - 1) * 100
  const contributionsGrow = inputs.contributionIncreasePct !== 0
  const monthlyContributionsTotal =
    summary.totalContributions - inputs.initialInvestment

  const contributionTerms: Terms = [
    {
      label: "Initial investment",
      value: formatCurrency(inputs.initialInvestment),
    },
    {
      label: "Monthly contribution",
      value: formatCurrency(inputs.monthlyContribution),
    },
  ]
  if (contributionsGrow) {
    contributionTerms.push({
      label: "Contribution increase",
      value: `${formatPercent(inputs.contributionIncreasePct)} each year`,
    })
  }
  contributionTerms.push({
    label: "Months contributing",
    value:
      contributingMonths === totalMonths
        ? `${contributingMonths}`
        : `${contributingMonths} of ${totalMonths}`,
  })

  const finalBalance: StatExplanation = {
    formula:
      "every month: balance = (balance + contribution) × (1 + monthly return)",
    filledIn: `${formatCurrency(inputs.initialInvestment)}, then ${totalMonths} months at ${formatPercent(monthlyReturnPct, 3)} = ${formatCurrency(summary.finalBalance)}`,
    terms: [
      ...contributionTerms,
      {
        label: "Monthly return",
        value: `(1 + ${formatPercent(inputs.annualReturnPct)})^(1/12) − 1 = ${formatPercent(monthlyReturnPct, 3)}`,
      },
    ],
  }

  const totalContributions: StatExplanation = {
    formula: "initial investment + all monthly contributions",
    filledIn: contributionsGrow
      ? `${formatCurrency(inputs.initialInvestment)} + ${formatCurrency(monthlyContributionsTotal)} = ${formatCurrency(summary.totalContributions)}`
      : `${formatCurrency(inputs.initialInvestment)} + ${formatCurrency(inputs.monthlyContribution)} × ${contributingMonths} = ${formatCurrency(summary.totalContributions)}`,
    terms: contributionTerms,
  }

  const inflationMultiplier: StatExplanation = {
    formula: "(1 + inflation) ^ years",
    filledIn: `(1 + ${formatPercent(inputs.annualInflationPct)}) ^ ${formatNumber(inputs.years)} = ${formatMultiplier(summary.inflationMultiplier)}`,
    terms: [
      {
        label: "Expected inflation",
        value: `${formatPercent(inputs.annualInflationPct)} per year`,
      },
      {
        label: "Investment period",
        value: `${formatNumber(inputs.years)} years`,
      },
    ],
  }

  const inflationAdjustedBalance: StatExplanation = {
    formula: "final balance ÷ inflation multiplier",
    filledIn: `${formatCurrency(summary.finalBalance)} ÷ ${formatNumber(summary.inflationMultiplier, 4)} = ${formatCurrency(summary.inflationAdjustedBalance)}`,
    terms: [
      { label: "Final balance", value: formatCurrency(summary.finalBalance) },
      {
        label: "Inflation multiplier",
        value: formatMultiplier(summary.inflationMultiplier),
      },
    ],
  }

  return {
    finalBalance,
    totalContributions,
    inflationMultiplier,
    inflationAdjustedBalance,
  }
}

export function explainRetirementIncome({
  finalBalance,
  inflationMultiplier,
  withdrawalRatePct,
  result,
}: {
  finalBalance: number
  inflationMultiplier: number
  withdrawalRatePct: number
  result: RetirementIncomeResult
}) {
  const annualWithdrawal: StatExplanation = {
    formula: "final balance × withdrawal rate",
    filledIn: `${formatCurrency(finalBalance)} × ${formatPercent(withdrawalRatePct)} = ${formatCurrency(result.annualWithdrawal)}`,
    terms: [
      { label: "Final balance", value: formatCurrency(finalBalance) },
      { label: "Withdrawal rate", value: formatPercent(withdrawalRatePct) },
    ],
  }

  const monthlyWithdrawal: StatExplanation = {
    formula: "annual withdrawal ÷ 12",
    filledIn: `${formatCurrency(result.annualWithdrawal)} ÷ 12 = ${formatCurrency(result.monthlyWithdrawal)}`,
  }

  const monthlyWithdrawalTodaysMoney: StatExplanation = {
    formula: "monthly withdrawal ÷ inflation multiplier",
    filledIn: `${formatCurrency(result.monthlyWithdrawal)} ÷ ${formatNumber(inflationMultiplier, 4)} = ${formatCurrency(result.monthlyWithdrawalTodaysMoney)}`,
    terms: [
      {
        label: "Monthly withdrawal",
        value: formatCurrency(result.monthlyWithdrawal),
      },
      {
        label: "Inflation multiplier",
        value: formatMultiplier(inflationMultiplier),
      },
    ],
  }

  return { annualWithdrawal, monthlyWithdrawal, monthlyWithdrawalTodaysMoney }
}

export function explainFreedom(
  inputs: FreedomInputs,
  summary: FreedomSummary | null
) {
  const realReturnPct =
    ((1 + inputs.annualReturnPct / 100) /
      (1 + inputs.annualInflationPct / 100) -
      1) *
    100
  const spendingToday = inputs.monthlySalary * (1 - inputs.savingsRatePct / 100)

  const timeToFreedom: StatExplanation = {
    formula:
      "every month: portfolio = (portfolio + salary − spending) × (1 + real monthly return), until portfolio ≥ freedom number",
    filledIn:
      summary === null
        ? `not reached within ${MAX_FREEDOM_MONTHS / 12} years`
        : `portfolio first reaches ${formatCurrency(summary.fireNumber)} in month ${summary.fireMonth} = ${formatYearsMonths(summary.fireMonth)}`,
    terms: [
      {
        label: "Already invested",
        value: formatCurrency(inputs.currentSavings),
      },
      {
        label: "Invested in month 1",
        value: `${formatCurrency(inputs.monthlySalary)} × ${formatPercent(inputs.savingsRatePct)} = ${formatCurrency(inputs.monthlySalary * (inputs.savingsRatePct / 100))}`,
      },
      {
        label: "Real return",
        value: `(1 + ${formatPercent(inputs.annualReturnPct)}) ÷ (1 + ${formatPercent(inputs.annualInflationPct)}) − 1 = ${formatPercent(realReturnPct)}`,
      },
      {
        label: "Salary growth",
        value: `${formatPercent(inputs.salaryIncreasePct)} per year`,
      },
      {
        label: "Spending growth",
        value: `${formatPercent(inputs.lifestyleInflationPct)} per year`,
      },
      ...(summary === null
        ? []
        : [
            {
              label: "Share invested by then",
              value: formatPercent(summary.savingsRatePctAtFreedom, 1),
            },
          ]),
    ],
    note: "Everything is in today's money, so inflation only appears as a lower real return. Salary and spending grow on top of prices; what you don't spend is invested. The freedom number keeps growing with your spending until you reach it.",
  }

  if (summary === null) {
    return { timeToFreedom }
  }

  const years = formatNumber(summary.fireMonth / 12)

  const fireNumber: StatExplanation = {
    formula: "monthly spending × 12 ÷ withdrawal rate",
    filledIn: `${formatCurrency(summary.monthlySpending)} × 12 ÷ ${formatPercent(inputs.withdrawalRatePct)} = ${formatCurrency(summary.fireNumber)}`,
    terms: [
      {
        label: "Monthly spending at freedom",
        value: formatCurrency(summary.monthlySpending),
      },
      {
        label: "Withdrawal rate",
        value: formatPercent(inputs.withdrawalRatePct),
      },
    ],
  }

  const fireNumberFutureMoney: StatExplanation = {
    formula: "freedom number × (1 + inflation) ^ years",
    filledIn: `${formatCurrency(summary.fireNumber)} × (1 + ${formatPercent(inputs.annualInflationPct)}) ^ ${years} = ${formatCurrency(summary.fireNumberFutureMoney)}`,
    terms: [
      {
        label: "Freedom number, today's money",
        value: formatCurrency(summary.fireNumber),
      },
      {
        label: "Expected inflation",
        value: `${formatPercent(inputs.annualInflationPct)} per year`,
      },
      {
        label: "Time to freedom",
        value: `${formatYearsMonths(summary.fireMonth)} = ${years} years`,
      },
    ],
  }

  // Spending can't outgrow the salary; once it catches up it follows it.
  const spendingCapped =
    summary.monthlySpending <
    spendingToday *
      Math.pow(1 + inputs.lifestyleInflationPct / 100, summary.fireMonth / 12) -
      0.5

  const monthlySpending: StatExplanation = spendingCapped
    ? {
        formula: "spending grew until it reached your whole salary",
        filledIn: `salary after ${years} years = ${formatCurrency(summary.monthlySpending)}`,
        terms: [
          { label: "Spending today", value: formatCurrency(spendingToday) },
          {
            label: "Lifestyle inflation",
            value: `${formatPercent(inputs.lifestyleInflationPct)} per year`,
          },
          {
            label: "Salary increase",
            value: `${formatPercent(inputs.salaryIncreasePct)} per year`,
          },
        ],
        note: "Lifestyle inflation is higher than your salary increase, so spending caught up with your salary and nothing is left to invest.",
      }
    : {
        formula:
          "salary × (1 − share invested) × (1 + lifestyle inflation) ^ years",
        filledIn: `${formatCurrency(inputs.monthlySalary)} × (1 − ${formatPercent(inputs.savingsRatePct)}) × (1 + ${formatPercent(inputs.lifestyleInflationPct)}) ^ ${years} = ${formatCurrency(summary.monthlySpending)}`,
        terms: [
          { label: "Spending today", value: formatCurrency(spendingToday) },
          {
            label: "Lifestyle inflation",
            value: `${formatPercent(inputs.lifestyleInflationPct)} per year`,
          },
          {
            label: "Time to freedom",
            value: `${formatYearsMonths(summary.fireMonth)} = ${years} years`,
          },
        ],
      }

  const savingsRateAtFreedom: StatExplanation = {
    formula: "(salary − spending) ÷ salary, both at freedom",
    filledIn: `(${formatCurrency(summary.monthlySalary)} − ${formatCurrency(summary.monthlySpending)}) ÷ ${formatCurrency(summary.monthlySalary)} = ${formatPercent(summary.savingsRatePctAtFreedom, 1)}`,
    terms: [
      {
        label: "Share invested today",
        value: formatPercent(inputs.savingsRatePct),
      },
      {
        label: "Salary increase",
        value: `${formatPercent(inputs.salaryIncreasePct)} per year`,
      },
      {
        label: "Lifestyle inflation",
        value: `${formatPercent(inputs.lifestyleInflationPct)} per year`,
      },
    ],
    note: "Whatever part of each raise you don't spend is invested, so the share rises when your salary grows faster than your spending and falls when it doesn't.",
  }

  return {
    timeToFreedom,
    fireNumber,
    fireNumberFutureMoney,
    monthlySpending,
    savingsRateAtFreedom,
  }
}
