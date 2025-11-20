export interface Token {
  symbol: string
  name: string
  price?: number
  iconUrl: string
}

export interface TokenPrice {
  [symbol: string]: number
}

export type TokenBalances = Record<string, number>

export interface SwapFormData {
  fromToken: Token | null
  toToken: Token | null
  fromAmount: string
}

export interface ValidationError {
  field: 'fromToken' | 'toToken' | 'fromAmount'
  message: string
}

export interface SuccessSwapData {
  fromAmount: string
  fromSymbol: string
  toAmount: string
  toSymbol: string
}

