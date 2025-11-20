import { useMemo } from 'react'
import TokenSelector from './TokenSelector'
import SwapButton from './SwapButton'
import SuccessModal from './SuccessModal'
import { useSwapForm } from '../hooks/useSwapForm'
import './CurrencySwapForm.css'

const CurrencySwapForm = () => {
  const {
    state: {
      formData,
      availableTokens,
      isLoading,
      balances,
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
    helpers: { getError, formattedBalanceLabel },
  } = useSwapForm()

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

  const fromBalanceLabel = formattedBalanceLabel(formData.fromToken, fromBalance)
  const toBalanceLabel = formattedBalanceLabel(formData.toToken, toBalance)

  const disableSelectors = useMemo(() => {
    const fromExclude = formData.toToken ? [formData.toToken.symbol] : []
    const toExclude = formData.fromToken ? [formData.fromToken.symbol] : []
    return { fromExclude, toExclude }
  }, [formData.fromToken, formData.toToken])

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
            <div className="field-label-row">
              <label className="field-label">From</label>
            </div>
            <div className="token-input-group">
              <div className="amount-input-wrapper">
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
                {formData.fromToken && (
                  <button
                    type="button"
                    className="max-button"
                    onClick={handleMaxFromAmount}
                  >
                    MAX
                  </button>
                )}
              </div>
              <div className="token-selector-wrapper">
                {formData.fromToken && (
                  <button
                    type="button"
                    className="balance-chip floating"
                    onClick={handleMaxFromAmount}
                  >
                    Balance: {fromBalanceLabel}
                  </button>
                )}
                <TokenSelector
                  tokens={availableTokens}
                  selectedToken={formData.fromToken}
                  onTokenSelect={handleFromTokenChange}
                  error={getError('fromToken')}
                  isTopDropdown={true}
                  balances={balances}
                  excludeSymbols={disableSelectors.fromExclude}
                />
              </div>
            </div>
            <div className="field-helper-row">
              {!hasSufficientBalance ? (
                <span className="error-message passive">Insufficient balance</span>
              ) : getError('fromAmount') ? (
                <span className="error-message">{getError('fromAmount')}</span>
              ) : (
                <span className="helper-text">
                  {fromFiatValue ? `≈ ${fromFiatValue}` : 'Enter an amount to start'}
                </span>
              )}
            </div>
          </div>

          {/* Swap Button */}
          <div className="swap-button-container">
            <SwapButton onClick={handleSwapTokens} />
          </div>

          {/* To Token */}
          <div className="swap-field">
            <div className="field-label-row">
              <label className="field-label">To</label>
            </div>
            <div className="token-input-group">
              <div className="amount-input-wrapper">
                <input
                  type="text"
                  className="amount-input read-only"
                  placeholder="0.0"
                  value={formattedToAmount}
                  readOnly
                />
              </div>
              <div className="token-selector-wrapper">
                {formData.toToken && (
                  <span className="balance-chip ghost floating">
                    Balance: {toBalanceLabel}
                  </span>
                )}
                <TokenSelector
                  tokens={availableTokens}
                  selectedToken={formData.toToken}
                  onTokenSelect={handleToTokenChange}
                  error={getError('toToken')}
                  isTopDropdown={false}
                  balances={balances}
                  excludeSymbols={disableSelectors.toExclude}
                />
              </div>
            </div>
            {getError('toToken') && (
              <span className="error-message">{getError('toToken')}</span>
            )}
            <div className="exchange-info">
              {toFiatValue && <span className="token-price">≈ {toFiatValue}</span>}
              {formattedExchangeRate && (
                <span className="exchange-rate">{formattedExchangeRate}</span>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`submit-button ${isSubmitDisabled ? 'disabled' : ''}`}
            disabled={isSubmitDisabled}
          >
            Swap
          </button>
        </form>
      </div>

      {/* Success Modal */}
      {successSwapData && (
        <SuccessModal
          isOpen={isSuccessModalOpen}
          onClose={closeSuccessModal}
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

