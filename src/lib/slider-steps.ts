/**
 * Fixed "nice" step tables for sliders that cover a wide value range.
 * Spacing grows exponentially so the slider stays useful at both the low
 * and high end, but every stop is a round, human-friendly number.
 */

export const INITIAL_INVESTMENT_STEPS = [
  0, 100, 250, 500, 1_000, 2_500, 5_000, 10_000, 25_000, 50_000, 100_000,
  250_000, 500_000, 750_000, 1_000_000,
]

export const MONTHLY_CONTRIBUTION_STEPS = [
  0, 25, 50, 100, 250, 500, 1_000, 2_500, 5_000, 10_000, 25_000, 50_000, 100_000,
]

/** Index of the value in `steps` closest to `value`. */
export function closestStepIndex(steps: number[], value: number): number {
  let closestIndex = 0
  let smallestDiff = Infinity

  for (let index = 0; index < steps.length; index++) {
    const diff = Math.abs(steps[index] - value)
    if (diff < smallestDiff) {
      smallestDiff = diff
      closestIndex = index
    }
  }

  return closestIndex
}
