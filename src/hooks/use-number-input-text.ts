import * as React from "react"

/**
 * Keeps a text input in sync with a clamped numeric value without fighting
 * the user mid-keystroke: typing stays free-form (so "" or "-" don't get
 * stomped), and the display text only resyncs from `value` when it changes
 * from somewhere else (a slider, a preset button, external state).
 */
export function useNumberInputText(
  value: number,
  onChange: (value: number) => void,
  { min, max }: { min: number; max: number }
) {
  const [text, setText] = React.useState(() => String(value))
  const [lastValue, setLastValue] = React.useState(value)

  if (value !== lastValue) {
    setLastValue(value)
    setText(String(value))
  }

  function handleChange(raw: string) {
    setText(raw)
    const parsed = Number(raw)
    if (raw.trim() !== "" && Number.isFinite(parsed)) {
      onChange(Math.min(max, Math.max(min, parsed)))
    }
  }

  function handleBlur() {
    setText(String(value))
  }

  return { text, handleChange, handleBlur }
}
