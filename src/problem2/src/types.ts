export interface Token {
  symbol: string
  name: string
  price?: number
  iconUrl: string
}

export interface TokenPrice {
  [symbol: string]: number
}

export interface SwapFormData {
  fromToken: Token | null
  toToken: Token | null
  fromAmount: string
  toAmount: string
}

export interface ValidationError {
  field: 'fromToken' | 'toToken' | 'fromAmount' | 'toAmount'
  message: string
}

