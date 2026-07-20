import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  computeTickStepMonths,
  formatYearsMonths,
  type InvestmentDataPoint,
} from "@/lib/investment-calculator"
import { cn } from "@/lib/utils"

const chartConfig = {
  invested: {
    label: "Money invested",
    color: "var(--chart-1)",
  },
  total: {
    label: "Total value",
    color: "var(--chart-2)",
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

export function InvestmentChart({
  series,
  totalMonths,
  className,
}: {
  series: InvestmentDataPoint[]
  totalMonths: number
  className?: string
}) {
  const tickStep = computeTickStepMonths(totalMonths)
  const ticks = React.useMemo(() => {
    const values: number[] = []
    for (let month = 0; month <= totalMonths; month += tickStep) {
      values.push(month)
    }
    if (values[values.length - 1] !== totalMonths) {
      values.push(totalMonths)
    }
    return values
  }, [totalMonths, tickStep])

  return (
    <ChartContainer
      config={chartConfig}
      className={cn("aspect-auto h-72 w-full min-w-0 sm:h-80", className)}
    >
      <AreaChart data={series} margin={{ left: 8, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="fill-total" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-total)" stopOpacity={0.35} />
            <stop offset="95%" stopColor="var(--color-total)" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="fill-invested" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-invested)"
              stopOpacity={0.35}
            />
            <stop
              offset="95%"
              stopColor="var(--color-invested)"
              stopOpacity={0.05}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          type="number"
          domain={[0, Math.max(totalMonths, 1)]}
          ticks={ticks}
          tickFormatter={formatYearsMonths}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <YAxis
          tickFormatter={(value: number) => compactCurrencyFormatter.format(value)}
          tickLine={false}
          axisLine={false}
          width={56}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) =>
                formatYearsMonths(Number(payload?.[0]?.payload?.month ?? 0))
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
          dataKey="invested"
          type="monotone"
          fill="url(#fill-invested)"
          stroke="var(--color-invested)"
          strokeWidth={2}
          isAnimationActive
          animationDuration={300}
          animationEasing="ease-out"
        />
        <Area
          dataKey="total"
          type="monotone"
          fill="url(#fill-total)"
          stroke="var(--color-total)"
          strokeWidth={2}
          isAnimationActive
          animationDuration={300}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ChartContainer>
  )
}
