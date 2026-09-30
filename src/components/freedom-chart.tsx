import * as React from "react"
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts"

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { FreedomDataPoint } from "@/lib/freedom-calculator"
import {
  computeTickStepMonths,
  formatYearsMonths,
} from "@/lib/investment-calculator"
import { cn } from "@/lib/utils"

const chartConfig = {
  target: {
    label: "Needed for freedom",
    color: "var(--chart-4)",
  },
  balance: {
    label: "Your portfolio",
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

export function FreedomChart({
  series,
  fireMonth,
  className,
}: {
  series: FreedomDataPoint[]
  /** Marked on the chart when freedom is reached. */
  fireMonth: number | null
  className?: string
}) {
  const totalMonths = series[series.length - 1]?.month ?? 0
  const tickStep = computeTickStepMonths(totalMonths)
  const ticks = React.useMemo(() => {
    const values: number[] = []
    for (let month = 0; month <= totalMonths; month += tickStep) {
      values.push(month)
    }
    return values
  }, [totalMonths, tickStep])

  return (
    <ChartContainer
      config={chartConfig}
      className={cn(
        "aspect-auto h-56 w-full min-w-0 touch-pan-y sm:h-80",
        className
      )}
    >
      <ComposedChart data={series} margin={{ left: 0, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="fill-balance" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-balance)"
              stopOpacity={0.35}
            />
            <stop
              offset="95%"
              stopColor="var(--color-balance)"
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
          tickFormatter={(value: number) =>
            compactCurrencyFormatter.format(value)
          }
          tickLine={false}
          axisLine={false}
          width={44}
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
          dataKey="balance"
          type="monotone"
          fill="url(#fill-balance)"
          stroke="var(--color-balance)"
          strokeWidth={2}
          isAnimationActive
          animationDuration={300}
          animationEasing="ease-out"
        />
        <Line
          dataKey="target"
          type="monotone"
          stroke="var(--color-target)"
          strokeWidth={2}
          strokeDasharray="6 4"
          dot={false}
          isAnimationActive
          animationDuration={300}
          animationEasing="ease-out"
        />
        {fireMonth !== null && fireMonth > 0 ? (
          <ReferenceLine
            x={fireMonth}
            stroke="var(--muted-foreground)"
            strokeDasharray="2 4"
            label={{
              value: "Free",
              position: "insideTopLeft",
              fill: "var(--muted-foreground)",
              fontSize: 12,
            }}
          />
        ) : null}
      </ComposedChart>
    </ChartContainer>
  )
}
