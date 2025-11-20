import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Token,
  SwapFormData,
  TokenBalances,
  ValidationError,
  SuccessSwapData,
} from '../types'
import {
  fetchTokenPrices,
  getTokenIconUrl,
  calculateExchangeRate,
  calculateToAmount,
} from '../utils/api'
import {
  formatBalanceDisplay,
  formatExchangeRate,
  formatFiatValue,
  formatTokenAmount,
} from '../utils/format'

const TOKEN_NAMES: { [key: string]: string } = {
  SWTH: 'Switcheo',
  ETH: 'Ethereum',
  BTC: 'Bitcoin',
  USDC: 'USD Coin',
  USDT: 'Tether',
  BNB: 'Binance Coin',
  SOL: 'Solana',
  ADA: 'Cardano',
  DOT: 'Polkadot',
  MATIC: 'Polygon',
  AVAX: 'Avalanche',
  LINK: 'Chainlink',
  UNI: 'Uniswap',
  ATOM: 'Cosmos',
  XRP: 'Ripple',
}

const COMMON_TOKENS = [
  'SWTH',
  'ETH',
  'BTC',
  'USDC',
  'USDT',
  'BNB',
  'SOL',
  'ADA',
  'DOT',
  'MATIC',
  'AVAX',
  'LINK',
  'UNI',
  'ATOM',
  'XRP',
]

const INITIAL_BALANCES: TokenBalances = {
  BTC: 12.34,
  ETH: 25.12,
  SWTH: 125000,
  USDC: 3421.55,
  USDT: 1984.44,
  BNB: 80.25,
  SOL: 320.5,
  ADA: 4500,
  DOT: 980.2,
  MATIC: 5100.67,
  AVAX: 150.12,
  LINK: 900.78,
  UNI: 1120.45,
  ATOM: 640.33,
  XRP: 8600,
}

const DEFAULT_FORM: SwapFormData = {
  fromToken: null,
  toToken: null,
  fromAmount: '',
}

export const useSwapForm = () => {
  const [formData, setFormData] = useState<SwapFormData>(DEFAULT_FORM)
  const [availableTokens, setAvailableTokens] = useState<Token[]>([])
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [balances, setBalances] = useState<TokenBalances>(INITIAL_BALANCES)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [successSwapData, setSuccessSwapData] = useState<SuccessSwapData | null>(null)

  useEffect(() => {
    const loadTokenData = async () => {
      setIsLoading(true)
      try {
        const prices = await fetchTokenPrices()
        const tokens: Token[] = COMMON_TOKENS.map((symbol) => ({
          symbol,
          name: TOKEN_NAMES[symbol] || symbol,
          price: prices[symbol],
          iconUrl: getTokenIconUrl(symbol),
        }))

        setAvailableTokens(tokens)
        setDefaultTokens(tokens)
      } catch (error) {
        console.error('Error loading token data:', error)
        const tokens: Token[] = COMMON_TOKENS.map((symbol) => ({
          symbol,
          name: TOKEN_NAMES[symbol] || symbol,
          iconUrl: getTokenIconUrl(symbol),
        }))
        setAvailableTokens(tokens)
        setDefaultTokens(tokens)
      } finally {
        setIsLoading(false)
      }
    }

    const setDefaultTokens = (tokens: Token[]) => {
      const btcToken = tokens.find((t) => t.symbol === 'BTC') || tokens[0] || null
      const usdtToken =
        tokens.find((t) => t.symbol === 'USDT' && t.symbol !== btcToken?.symbol) ||
        tokens.find((t) => t.symbol !== btcToken?.symbol) ||
        null

      setFormData((prev) => ({
        ...prev,
        fromToken: btcToken,
        toToken: usdtToken,
        fromAmount: '',
      }))
    }

    loadTokenData()
  }, [])

  const fromBalance = useMemo(() => {
    if (!formData.fromToken) return 0
    return balances[formData.fromToken.symbol] ?? 0
  }, [balances, formData.fromToken])

  const toBalance = useMemo(() => {
    if (!formData.toToken) return 0
    return balances[formData.toToken.symbol] ?? 0
  }, [balances, formData.toToken])

  const exchangeRate = useMemo(() => {
    if (
      formData.fromToken?.price &&
      formData.fromToken.price > 0 &&
      formData.toToken?.price &&
      formData.toToken.price > 0
    ) {
      return calculateExchangeRate(formData.fromToken.price, formData.toToken.price)
    }
    return null
  }, [formData.fromToken, formData.toToken])

  const formattedExchangeRate = useMemo(() => {
    if (exchangeRate === null || !formData.fromToken || !formData.toToken) return null
    return `1 ${formData.fromToken.symbol} = ${formatExchangeRate(exchangeRate)} ${formData.toToken.symbol}`
  }, [exchangeRate, formData.fromToken, formData.toToken])

  const numericFromAmount = useMemo(() => {
    const amount = parseFloat(formData.fromAmount)
    return isNaN(amount) ? 0 : amount
  }, [formData.fromAmount])

  const toAmountValue = useMemo(() => {
    if (!exchangeRate || numericFromAmount <= 0) {
      return 0
    }
    return calculateToAmount(numericFromAmount, exchangeRate)
  }, [exchangeRate, numericFromAmount])

  const formattedToAmount = useMemo(() => {
    if (toAmountValue <= 0) return ''
    return formatTokenAmount(toAmountValue)
  }, [toAmountValue])

  const fromFiatValue = useMemo(() => {
    if (!formData.fromToken?.price || numericFromAmount <= 0) return null
    return formatFiatValue(numericFromAmount * formData.fromToken.price)
  }, [formData.fromToken, numericFromAmount])

  const toFiatValue = useMemo(() => {
    if (!formData.toToken?.price || toAmountValue <= 0) return null
    return formatFiatValue(toAmountValue * formData.toToken.price)
  }, [formData.toToken, toAmountValue])

  const hasSufficientBalance = useMemo(() => {
    if (!formData.fromToken || numericFromAmount <= 0) return true
    return numericFromAmount <= fromBalance
  }, [formData.fromToken, fromBalance, numericFromAmount])

  const getError = useCallback(
    (field: ValidationError['field']): string | undefined => {
      return errors.find((error) => error.field === field)?.message
    },
    [errors]
  )

  const validateForm = useCallback((): boolean => {
    const validationErrors: ValidationError[] = []

    if (!formData.fromToken) {
      validationErrors.push({ field: 'fromToken', message: 'Please select source token' })
    }

    if (!formData.toToken) {
      validationErrors.push({ field: 'toToken', message: 'Please select destination token' })
    }

    if (formData.fromToken && formData.toToken && formData.fromToken.symbol === formData.toToken.symbol) {
      validationErrors.push({
        field: 'toToken',
        message: 'Source and destination tokens must be different',
      })
    }

    if (!formData.fromAmount || formData.fromAmount === '0') {
      validationErrors.push({
        field: 'fromAmount',
        message: 'Please enter amount',
      })
    } else if (!hasSufficientBalance) {
      validationErrors.push({
        field: 'fromAmount',
        message: 'Insufficient balance',
      })
    } else {
      const amount = parseFloat(formData.fromAmount)
      if (isNaN(amount) || amount <= 0) {
        validationErrors.push({
          field: 'fromAmount',
          message: 'Amount must be greater than 0',
        })
      }
    }

    setErrors(validationErrors)
    return validationErrors.length === 0
  }, [formData, hasSufficientBalance])

  const handleFromTokenChange = useCallback((token: Token | null) => {
    setFormData((prev) => ({
      ...prev,
      fromToken: token,
      fromAmount: '',
    }))
    setErrors((prev) => prev.filter((error) => error.field !== 'fromToken' && error.field !== 'fromAmount'))
  }, [])

  const handleToTokenChange = useCallback((token: Token | null) => {
    setFormData((prev) => ({
      ...prev,
      toToken: token,
    }))
    setErrors((prev) => prev.filter((error) => error.field !== 'toToken'))
  }, [])

  const handleFromAmountChange = useCallback((value: string) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      const dotCount = (value.match(/\./g) || []).length
      if (dotCount <= 1) {
        setFormData((prev) => ({ ...prev, fromAmount: value }))
        setErrors((prev) => prev.filter((error) => error.field !== 'fromAmount'))
      }
    }
  }, [])

  const handleSwapTokens = useCallback(() => {
    setFormData((prev) => ({
      fromToken: prev.toToken,
      toToken: prev.fromToken,
      fromAmount: formattedToAmount,
    }))
    setErrors([])
  }, [formattedToAmount])

  const handleMaxFromAmount = useCallback(() => {
    if (!formData.fromToken) return
    setFormData((prev) => ({
      ...prev,
      fromAmount: formatTokenAmount(fromBalance),
    }))
    setErrors((prev) => prev.filter((error) => error.field !== 'fromAmount'))
  }, [formData.fromToken, fromBalance])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (
        !validateForm() ||
        !formData.fromToken ||
        !formData.toToken ||
        numericFromAmount <= 0 ||
        toAmountValue <= 0
      ) {
        return
      }

      const fromSymbol = formData.fromToken.symbol
      const toSymbol = formData.toToken.symbol

      setBalances((prev) => ({
        ...prev,
        [fromSymbol]: Math.max(0, (prev[fromSymbol] ?? 0) - numericFromAmount),
        [toSymbol]: (prev[toSymbol] ?? 0) + toAmountValue,
      }))

      const swapData: SuccessSwapData = {
        fromAmount: formatTokenAmount(numericFromAmount),
        fromSymbol,
        toAmount: formatTokenAmount(toAmountValue),
        toSymbol,
      }

      setSuccessSwapData(swapData)
      setIsSuccessModalOpen(true)
      setFormData((prev) => ({
        ...prev,
        fromAmount: '',
      }))
    },
    [formData.fromToken, formData.toToken, numericFromAmount, toAmountValue, validateForm]
  )

  const closeSuccessModal = useCallback(() => {
    setIsSuccessModalOpen(false)
  }, [])

  const isSubmitDisabled =
    !formData.fromToken || !formData.toToken || !formData.fromAmount || !hasSufficientBalance || toAmountValue <= 0

  return {
    state: {
      formData,
      availableTokens,
      isLoading,
      errors,
      balances,
      exchangeRate,
      formattedExchangeRate,
      formattedToAmount,
      fromBalance,
      toBalance,
      fromFiatValue,
      toFiatValue,
      isSuccessModalOpen,
      successSwapData,
      hasSufficientBalance,
      isSubmitDisabled,
    },
    handlers: {
      handleFromTokenChange,
      handleToTokenChange,
      handleFromAmountChange,
      handleSwapTokens,
      handleSubmit,
      handleMaxFromAmount,
      closeSuccessModal,
      validateForm,
    },
    helpers: {
      getError,
      formattedBalanceLabel: (token: Token | null, balance: number) =>
        token ? formatBalanceDisplay(balance, token.symbol) : '',
    },
  }
}

export type UseSwapFormReturn = ReturnType<typeof useSwapForm>

