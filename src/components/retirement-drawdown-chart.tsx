import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  computeTickStepYears,
  type RetirementDrawdownPoint,
} from "@/lib/investment-calculator"
import { cn } from "@/lib/utils"

const chartConfig = {
  withdrawal: {
    label: "Withdrawal",
    color: "var(--chart-3)",
  },
  withdrawalTodaysMoney: {
    label: "Today's money",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

const currencyFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
})

const compactCurrencyFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
})

function formatCurrency(value: number): string {
  return `$${currencyFormatter.format(Math.round(value))}`
}

export function RetirementDrawdownChart({
  series,
  years,
  className,
}: {
  series: RetirementDrawdownPoint[]
  years: number
  className?: string
}) {
  const tickStep = computeTickStepYears(years)
  const ticks = React.useMemo(() => {
    const values: number[] = []
    for (let year = 0; year <= years; year += tickStep) {
      values.push(year)
    }
    if (values[values.length - 1] !== years) {
      values.push(years)
    }
    return values
  }, [years, tickStep])

  return (
    <ChartContainer
      config={chartConfig}
      className={cn("aspect-auto h-56 w-full min-w-0 sm:h-64", className)}
    >
      <AreaChart data={series} margin={{ left: 0, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="fill-withdrawal" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-withdrawal)"
              stopOpacity={0.35}
            />
            <stop
              offset="95%"
              stopColor="var(--color-withdrawal)"
              stopOpacity={0.05}
            />
          </linearGradient>
          <linearGradient
            id="fill-withdrawalTodaysMoney"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="5%"
              stopColor="var(--color-withdrawalTodaysMoney)"
              stopOpacity={0.35}
            />
            <stop
              offset="95%"
              stopColor="var(--color-withdrawalTodaysMoney)"
              stopOpacity={0.05}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="year"
          type="number"
          domain={[1, Math.max(years, 1)]}
          ticks={ticks}
          tickFormatter={(value: number) => `${value}y`}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickFormatter={(value: number) => compactCurrencyFormatter.format(value)}
          tickLine={false}
          axisLine={false}
          width={44}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) =>
                `Year ${payload?.[0]?.payload?.year ?? 0}`
              }
              formatter={(value, name, item) => (
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <span
                      className="h-2.5 w-2.5 rounded-[2px]"
                      style={{
                        backgroundColor: `var(--color-${item.dataKey})`,
                      }}
                    />
                    {chartConfig[item.dataKey as keyof typeof chartConfig]
                      ?.label ?? name}
                  </span>
                  <span className="font-mono font-medium text-foreground tabular-nums">
                    {formatCurrency(Number(value))}
                  </span>
                </div>
              )}
            />
          }
        />
        <Area
          dataKey="withdrawal"
          type="monotone"
          fill="url(#fill-withdrawal)"
          stroke="var(--color-withdrawal)"
          strokeWidth={2}
          isAnimationActive
          animationDuration={300}
          animationEasing="ease-out"
        />
        <Area
          dataKey="withdrawalTodaysMoney"
          type="monotone"
          fill="url(#fill-withdrawalTodaysMoney)"
          stroke="var(--color-withdrawalTodaysMoney)"
          strokeWidth={2}
          isAnimationActive
          animationDuration={300}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ChartContainer>
  )
}
