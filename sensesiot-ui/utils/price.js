import Decimal from 'decimal.js'

export function isPriceEqual(value1, value2) {
  const d1 = new Decimal(value1)
  const d2 = new Decimal(value2)
  return d1.equals(d2)
}
export function formatCurrency(value, unit = '') {
  return `${unit}${value}`
}

export default Object.freeze({
  isPriceEqual,
  formatCurrency,
})
