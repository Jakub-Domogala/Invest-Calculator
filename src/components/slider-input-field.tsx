import * as React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { closestStepIndex } from "@/lib/slider-steps"
import { cn } from "@/lib/utils"

interface SliderInputFieldCommonProps {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  /** Shown after the number, e.g. "%" or "yr". */
  unit?: string
  /** Shown before the number, e.g. "$". */
  prefix?: string
}

interface LinearSliderInputFieldProps extends SliderInputFieldCommonProps {
  min: number
  max: number
  step: number
  steps?: undefined
}

interface DiscreteSliderInputFieldProps extends SliderInputFieldCommonProps {
  /** Fixed list of allowed values, e.g. for wide exponential-feeling ranges. */
  steps: number[]
  min?: undefined
  max?: undefined
  step?: undefined
}

export type SliderInputFieldProps =
  | LinearSliderInputFieldProps
  | DiscreteSliderInputFieldProps

function isDiscreteField(
  props: SliderInputFieldProps
): props is DiscreteSliderInputFieldProps {
  return props.steps !== undefined
}

export function SliderInputField(props: SliderInputFieldProps) {
  const { id, label, value, onChange, disabled, unit, prefix } = props
  const discrete = isDiscreteField(props)

  const min = discrete ? props.steps[0] : props.min
  const max = discrete ? props.steps[props.steps.length - 1] : props.max

  const [text, setText] = React.useState(() => String(value))
  const [lastValue, setLastValue] = React.useState(value)

  if (value !== lastValue) {
    setLastValue(value)
    setText(String(value))
  }

  function handleTextChange(raw: string) {
    setText(raw)
    const parsed = Number(raw)
    if (raw.trim() !== "" && Number.isFinite(parsed)) {
      onChange(Math.min(max, Math.max(min, parsed)))
    }
  }

  function handleBlur() {
    setText(String(value))
  }

  function handleSliderChange(newValue: number | readonly number[]) {
    const nextValue = Array.isArray(newValue) ? newValue[0] : (newValue as number)
    onChange(discrete ? props.steps[nextValue] : nextValue)
  }

  const sliderValue = discrete ? [closestStepIndex(props.steps, value)] : [value]
  const sliderMin = discrete ? 0 : min
  const sliderMax = discrete ? props.steps.length - 1 : max
  const sliderStep = discrete ? 1 : props.step

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        <div className="relative">
          {prefix ? (
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
              {prefix}
            </span>
          ) : null}
          <Input
            id={id}
            type="text"
            inputMode="decimal"
            disabled={disabled}
            value={text}
            onChange={(event) => handleTextChange(event.target.value)}
            onBlur={handleBlur}
            className={cn(
              "h-8 w-28 text-right",
              prefix && "pl-6",
              unit && "pr-8"
            )}
          />
          {unit ? (
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
              {unit}
            </span>
          ) : null}
        </div>
      </div>
      <Slider
        id={`${id}-slider`}
        value={sliderValue}
        onValueChange={handleSliderChange}
        min={sliderMin}
        max={sliderMax}
        step={sliderStep}
        disabled={disabled}
      />
    </div>
  )
}
