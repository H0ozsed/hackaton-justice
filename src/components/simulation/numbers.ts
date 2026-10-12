// Parsing of a number typed by a French-speaking person: "12,5", "12.5", "1 200", "-3".
// Returns NaN when the text is not a plain decimal number (letters, several separators, empty...),
// which a zod `number()` then refuses with its message.
export function parseDecimal(raw: unknown): number {
  if (typeof raw === 'number') return raw
  if (typeof raw !== 'string') return Number.NaN

  // `\s` also covers the no-break spaces used as thousands separators in French.
  const text = raw.replace(/\s/g, '')
  if (!/^-?(\d+([.,]\d+)?|[.,]\d+)$/.test(text)) return Number.NaN
  return Number(text.replace(',', '.'))
}

/** True when the number has at most two decimals (euros and cents). Float-safe. */
export function hasAtMostTwoDecimals(value: number): boolean {
  return Math.abs(value * 100 - Math.round(value * 100)) < 1e-6
}
