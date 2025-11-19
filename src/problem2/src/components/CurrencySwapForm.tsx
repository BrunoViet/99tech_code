import { useState, useEffect, useCallback } from 'react'
import { Token, SwapFormData, ValidationError, TokenPrice } from '../types'
import {
  fetchTokenPrices,
  getTokenIconUrl,
  calculateExchangeRate,
  calculateToAmount,
} from '../utils/api'
import TokenSelector from './TokenSelector'
import SwapButton from './SwapButton'
import SuccessModal from './SuccessModal'
import './CurrencySwapForm.css'

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

const CurrencySwapForm = () => {
  const [formData, setFormData] = useState<SwapFormData>({
    fromToken: null,
    toToken: null,
    fromAmount: '1',
    toAmount: '',
  })

  const [tokenPrices, setTokenPrices] = useState<TokenPrice>({})
  const [availableTokens, setAvailableTokens] = useState<Token[]>([])
  const [errors, setErrors] = useState<ValidationError[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [successSwapData, setSuccessSwapData] = useState<{
    fromAmount: string
    fromSymbol: string
    toAmount: string
    toSymbol: string
  } | null>(null)

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

        setTokenPrices(prices)
        setAvailableTokens(tokens)
        setDefaultTokens(tokens)
      } catch (error) {
        console.error('Error loading token data:', error)
        // Still show token list even if price fetch fails
        const tokens: Token[] = COMMON_TOKENS.map((symbol) => ({
          symbol,
          name: TOKEN_NAMES[symbol] || symbol,
          price: undefined,
          iconUrl: getTokenIconUrl(symbol),
        }))
        setAvailableTokens(tokens)
        setDefaultTokens(tokens)
      } finally {
        setIsLoading(false)
      }
    }

    const setDefaultTokens = (tokens: Token[]) => {
      const btcToken = tokens.find((t) => t.symbol === 'BTC')
      const usdtToken = tokens.find((t) => t.symbol === 'USDT')

      if (btcToken && usdtToken) {
        setFormData((prev) => ({
          ...prev,
          fromToken: btcToken,
          toToken: usdtToken,
          fromAmount: '',
        }))
      } else if (btcToken) {
        setFormData((prev) => ({
          ...prev,
          fromToken: btcToken,
          toToken: prev.toToken,
          fromAmount: '',
        }))
      }
    }

    loadTokenData()
  }, [])

  const validateForm = useCallback((): boolean => {
    const newErrors: ValidationError[] = []

    if (!formData.fromToken) {
      newErrors.push({
        field: 'fromToken',
        message: 'Please select source token',
      })
    }

    if (!formData.toToken) {
      newErrors.push({
        field: 'toToken',
        message: 'Please select destination token',
      })
    }

    if (formData.fromToken && formData.toToken) {
      if (formData.fromToken.symbol === formData.toToken.symbol) {
        newErrors.push({
          field: 'toToken',
          message: 'Source and destination tokens must be different',
        })
      }
    }

    if (!formData.fromAmount || formData.fromAmount === '0') {
      newErrors.push({
        field: 'fromAmount',
        message: 'Please enter amount',
      })
    } else {
      const amount = parseFloat(formData.fromAmount)
      if (isNaN(amount) || amount <= 0) {
        newErrors.push({
          field: 'fromAmount',
          message: 'Amount must be greater than 0',
        })
      }
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }, [formData])

  useEffect(() => {
    if (
      formData.fromToken &&
      formData.toToken &&
      formData.fromToken.price !== undefined &&
      formData.fromToken.price > 0 &&
      formData.toToken.price !== undefined &&
      formData.toToken.price > 0
    ) {
      const rate = calculateExchangeRate(
        formData.fromToken.price,
        formData.toToken.price
      )
      setExchangeRate(rate)
    } else {
      setExchangeRate(null)
    }
  }, [formData.fromToken, formData.toToken])

  useEffect(() => {
    if (
      formData.fromToken &&
      formData.toToken &&
      formData.fromAmount &&
      exchangeRate !== null
    ) {
      const fromAmount = parseFloat(formData.fromAmount)
      if (!isNaN(fromAmount) && fromAmount > 0) {
        const toAmount = calculateToAmount(fromAmount, exchangeRate)
        setFormData((prev) => ({
          ...prev,
          toAmount: toAmount.toFixed(6).replace(/\.?0+$/, ''),
        }))
      } else {
        setFormData((prev) => ({ ...prev, toAmount: '' }))
      }
    } else {
      setFormData((prev) => ({ ...prev, toAmount: '' }))
    }
  }, [formData.fromAmount, formData.fromToken, formData.toToken, exchangeRate])

  const handleFromTokenChange = (token: Token | null) => {
    setFormData((prev) => ({ ...prev, fromToken: token }))
    setErrors((prev) => prev.filter((e) => e.field !== 'fromToken'))
  }

  const handleToTokenChange = (token: Token | null) => {
    setFormData((prev) => ({ ...prev, toToken: token }))
    setErrors((prev) => prev.filter((e) => e.field !== 'toToken'))
  }

  const handleFromAmountChange = (value: string) => {
    // Only allow numbers and one decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      const dotCount = (value.match(/\./g) || []).length
      if (dotCount <= 1) {
        setFormData((prev) => ({ ...prev, fromAmount: value }))
        setErrors((prev) => prev.filter((e) => e.field !== 'fromAmount'))
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Block non-numeric characters except navigation keys
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
    ]

    if (
      !allowedKeys.includes(e.key) &&
      !(e.ctrlKey || e.metaKey) && // Allow Ctrl+C, Ctrl+V, etc.
      !/^\d$/.test(e.key) && // Not a number
      e.key !== '.' // Not a decimal point
    ) {
      e.preventDefault()
    }
  }

  const handleSwapTokens = () => {
    setFormData((prev) => ({
      fromToken: prev.toToken,
      toToken: prev.fromToken,
      fromAmount: prev.toAmount,
      toAmount: prev.fromAmount,
    }))
    setErrors([])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm() && formData.fromToken && formData.toToken) {
      // Show success modal
      setSuccessSwapData({
        fromAmount: formData.fromAmount,
        fromSymbol: formData.fromToken.symbol,
        toAmount: formData.toAmount,
        toSymbol: formData.toToken.symbol,
      })
      setIsSuccessModalOpen(true)

      // Reset form
      setFormData({
        fromToken: formData.fromToken,
        toToken: formData.toToken,
        fromAmount: '',
        toAmount: '',
      })
    }
  }

  const getError = (field: ValidationError['field']): string | undefined => {
    return errors.find((e) => e.field === field)?.message
  }

  if (isLoading) {
    return (
      <div className="swap-form-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="swap-form-container">
      <div className="swap-form-card">
        <div className="swap-form-header">
          <h1>Currency Swap</h1>
          <p className="subtitle">Swap tokens easily</p>
        </div>

        <form onSubmit={handleSubmit} className="swap-form">
          {/* From Token */}
          <div className="swap-field">
            <label className="field-label">From</label>
            <div className="token-input-group">
              <input
                type="text"
                inputMode="decimal"
                className={`amount-input ${getError('fromAmount') ? 'error' : ''}`}
                placeholder="0.0"
                value={formData.fromAmount}
                onChange={(e) => handleFromAmountChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={validateForm}
              />
              <TokenSelector
                tokens={availableTokens}
                selectedToken={formData.fromToken}
                onTokenSelect={handleFromTokenChange}
                error={getError('fromToken')}
                isTopDropdown={true}
              />
            </div>
            {getError('fromAmount') && (
              <span className="error-message">{getError('fromAmount')}</span>
            )}
            {formData.fromToken?.price && (
              <span className="token-price">
                ≈ ${formData.fromToken.price.toLocaleString('en-US')}
              </span>
            )}
          </div>

          {/* Swap Button */}
          <div className="swap-button-container">
            <SwapButton onClick={handleSwapTokens} />
          </div>

          {/* To Token */}
          <div className="swap-field">
            <label className="field-label">To</label>
            <div className="token-input-group">
              <input
                type="text"
                className="amount-input"
                placeholder="0.0"
                value={formData.toAmount}
                readOnly
              />
              <TokenSelector
                tokens={availableTokens}
                selectedToken={formData.toToken}
                onTokenSelect={handleToTokenChange}
                error={getError('toToken')}
                isTopDropdown={false}
              />
            </div>
            {getError('toToken') && (
              <span className="error-message">{getError('toToken')}</span>
            )}
            {formData.toToken?.price && exchangeRate && (
              <div className="exchange-info">
                <span className="token-price">
                  ≈ ${formData.toToken.price.toLocaleString('en-US')}
                </span>
                <span className="exchange-rate">
                  1 {formData.fromToken?.symbol} = {exchangeRate.toFixed(6)}{' '}
                  {formData.toToken.symbol}
                </span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`submit-button ${!formData.fromToken || !formData.toToken || !formData.fromAmount ? 'disabled' : ''}`}
            disabled={
              !formData.fromToken ||
              !formData.toToken ||
              !formData.fromAmount
            }
          >
            Swap
          </button>
        </form>
      </div>

      {/* Success Modal */}
      {successSwapData && (
        <SuccessModal
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          fromAmount={successSwapData.fromAmount}
          fromSymbol={successSwapData.fromSymbol}
          toAmount={successSwapData.toAmount}
          toSymbol={successSwapData.toSymbol}
        />
      )}
    </div>
  )
}

export default CurrencySwapForm

