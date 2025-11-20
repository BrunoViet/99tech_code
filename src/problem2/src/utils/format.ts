const MIN_RATE_DISPLAY = 0.00000001

export const trimTrailingZeros = (value: string): string => {
  return value.replace(/(?:\.0+|(\.\d*?))0+$/, '$1').replace(/\.$/, '')
}

export const formatTokenAmount = (value: number, maxDecimals = 8): string => {
  if (!isFinite(value) || value === 0) {
    return '0'
  }

  const decimals = value >= 1 ? Math.min(4, maxDecimals) : maxDecimals
  const fixed = value.toFixed(decimals)
  return trimTrailingZeros(fixed)
}

export const formatBalanceDisplay = (value: number, symbol?: string): string => {
  const amount = formatTokenAmount(value)
  return symbol ? `${amount} ${symbol}` : amount
}

export const formatFiatValue = (value?: number): string | null => {
  if (value === undefined || !isFinite(value)) {
    return null
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

export const formatExchangeRate = (rate: number): string => {
  if (!isFinite(rate) || rate <= 0) {
    return '0'
  }

  if (rate < MIN_RATE_DISPLAY) {
    return rate.toExponential(2)
  }

  const decimals = rate >= 1 ? 4 : 8
  return trimTrailingZeros(rate.toFixed(decimals))
}

