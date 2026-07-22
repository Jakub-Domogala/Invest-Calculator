import type { Format, Plugin } from "@number-flow/react"

// Force en-US formatting so the currency symbol is always "$" — with the
// device's own locale, Intl often renders USD as "US$" to disambiguate it
// from the local currency.
export const locale = "en-US"

export const currencyFormat: Format = {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
}

export const multiplierFormat: Format = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}

/**
 * By default each digit rolls past every number between its old and new
 * value (1 -> 7 spins through 2,3,4,5,6). We only ever want a single-step
 * roll that lands directly on the target digit, so this plugin overrides
 * the roll distance to always be exactly one position, keeping the correct
 * up/down direction (including digit wrap, e.g. 9 -> 0).
 */
const singleStepPlugin: Plugin = {
  getDelta(value, prev, context) {
    if (value === prev) return 0
    const trend = context.flow.computedTrend || Math.sign(value - prev)
    if (trend < 0 && value > prev) return -1
    if (trend > 0 && value < prev) return 1
    return value > prev ? 1 : -1
  },
}

export const numberFlowPlugins = [singleStepPlugin]
export const transformTiming: EffectTiming = { duration: 350, easing: "ease-out" }
export const spinTiming: EffectTiming = { duration: 350, easing: "ease-out" }
export const opacityTiming: EffectTiming = { duration: 200, easing: "ease-out" }
