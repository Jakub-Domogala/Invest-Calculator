import { RetirementDrawdownChart } from "@/components/retirement-drawdown-chart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNumberInputText } from "@/hooks/use-number-input-text"
import type {
  RetirementDrawdownPoint,
  RetirementDrawdownTrend,
} from "@/lib/investment-calculator"
import { cn } from "@/lib/utils"

export const DEFAULT_DRAWDOWN_YEARS = 25
const YEAR_PRESETS = [10, 25, 50]
const MIN_YEARS = 1
const MAX_YEARS = 100

export function RetirementDrawdown({
  years,
  onYearsChange,
  series,
  trend,
  className,
}: {
  years: number
  onYearsChange: (value: number) => void
  series: RetirementDrawdownPoint[]
  trend: RetirementDrawdownTrend
  className?: string
}) {
  const { text, handleChange, handleBlur } = useNumberInputText(
    years,
    onYearsChange,
    { min: MIN_YEARS, max: MAX_YEARS }
  )

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="drawdown-years">Years to simulate</Label>
        <div className="flex items-center gap-2">
          {YEAR_PRESETS.map((preset) => (
            <Button
              key={preset}
              type="button"
              variant="outline"
              size="xs"
              aria-label={`Simulate ${preset} years`}
              onClick={() => onYearsChange(preset)}
            >
              {preset}
            </Button>
          ))}
          <div className="relative">
            <Input
              id="drawdown-years"
              type="text"
              inputMode="numeric"
              value={text}
              onChange={(event) => handleChange(event.target.value)}
              onBlur={handleBlur}
              className="h-8 w-20 pr-8 text-right"
            />
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
              yr
            </span>
          </div>
        </div>
      </div>

      <RetirementDrawdownChart series={series} years={years} />

      {trend === "decreasing" ? (
        <p className="text-sm font-medium text-destructive">
          At this rate, your withdrawals lose purchasing power over time.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          {trend === "increasing"
            ? "Your withdrawals are projected to grow ahead of inflation."
            : "Your withdrawals are projected to roughly keep pace with inflation."}
        </p>
      )}
    </div>
  )
}
