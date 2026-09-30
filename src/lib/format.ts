const currencyFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
})

/** "$1,234" - same "$" handling as `currencyFormat` in number-flow.ts. */
export function formatCurrency(value: number): string {
  const rounded = Math.round(value)
  return `${rounded < 0 ? "-" : ""}$${currencyFormatter.format(Math.abs(rounded))}`
}

/** "7%", "2.5%", "0.565%" - up to `maxDecimals`, without trailing zeros. */
export function formatPercent(value: number, maxDecimals = 2): string {
  return `${Number(value.toFixed(maxDecimals))}%`
}

/** A plain number with up to `maxDecimals`, without trailing zeros. */
export function formatNumber(value: number, maxDecimals = 2): string {
  return `${Number(value.toFixed(maxDecimals))}`
}
