import { useState, useRef, useEffect } from 'react'
import { Token, TokenBalances } from '../types'
import { formatTokenAmount } from '../utils/format'
import './TokenSelector.css'

interface TokenSelectorProps {
  tokens: Token[]
  selectedToken: Token | null
  onTokenSelect: (token: Token | null) => void
  error?: string
  isTopDropdown?: boolean
  balances?: TokenBalances
  excludeSymbols?: string[]
}

const TokenSelector = ({
  tokens,
  selectedToken,
  onTokenSelect,
  error,
  isTopDropdown = false,
  balances,
  excludeSymbols = [],
}: TokenSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [maxHeight, setMaxHeight] = useState<number>(400)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const dropdownElementRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Calculate max-height for bottom dropdown based on viewport
  useEffect(() => {
    if (isOpen && !isTopDropdown && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const spaceBelow = viewportHeight - buttonRect.bottom - 8 // 8px gap
      const calculatedMaxHeight = Math.min(380, Math.max(200, spaceBelow - 16))
      setMaxHeight(calculatedMaxHeight)
    } else if (isOpen && isTopDropdown) {
      setMaxHeight(400) // Keep default max-height for top dropdown
    }
  }, [isOpen, isTopDropdown])

  const filteredTokens = tokens.filter((token) => {
    const matchesQuery =
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesQuery) return false

    const isExcluded = excludeSymbols.includes(token.symbol)
    if (isExcluded && selectedToken?.symbol !== token.symbol) {
      return false
    }

    return true
  })

  const handleTokenClick = (token: Token) => {
    onTokenSelect(token)
    setIsOpen(false)
    setSearchQuery('')
  }

  const getTokenBalance = (symbol: string): string | null => {
    if (!balances) return null
    const amount = balances[symbol]
    if (amount === undefined) return null
    return `${formatTokenAmount(amount)} ${symbol}`
  }

  return (
    <div className={`token-selector ${error ? 'error' : ''}`} ref={dropdownRef}>
      <button
        ref={buttonRef}
        type="button"
        className="token-selector-button token-icon-button"
        onClick={() => setIsOpen(!isOpen)}
        title={selectedToken ? `${selectedToken.symbol} - ${selectedToken.name}` : 'Select token'}
        aria-label="Select token"
      >
        {selectedToken ? (
          <img
            src={selectedToken.iconUrl}
            alt={selectedToken.symbol}
            className="token-icon-large"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
            }}
          />
        ) : (
          <div className="token-placeholder-icon">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="16" cy="16" r="16" fill="var(--surface-light)" />
              <path
                d="M16 10V22M10 16H22"
                stroke="var(--text-muted)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}
      </button>

      {isOpen && (
        <div
          ref={dropdownElementRef}
          className={`token-dropdown ${isTopDropdown ? 'top-dropdown' : 'bottom-dropdown'}`}
          style={!isTopDropdown ? { maxHeight: `${maxHeight}px` } : undefined}
        >
          <div className="token-search">
            <input
              type="text"
              placeholder="Search token..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              autoFocus
              aria-label="Search tokens"
            />
          </div>
          <div className="token-list">
            {filteredTokens.length > 0 ? (
              filteredTokens.map((token) => {
                const tokenBalance = getTokenBalance(token.symbol)
                return (
                  <button
                    key={token.symbol}
                    type="button"
                    className={`token-option ${
                      selectedToken?.symbol === token.symbol ? 'selected' : ''
                    }`}
                    onClick={() => handleTokenClick(token)}
                  >
                    <img
                      src={token.iconUrl}
                      alt={token.symbol}
                      className="token-icon"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                      }}
                    />
                    <div className="token-info">
                      <div className="token-name-group">
                        <span className="token-symbol">{token.symbol}</span>
                        <span className="token-name">{token.name}</span>
                      </div>
                      <div className="token-meta">
                        {token.price && (
                          <span className="token-price">
                            ${token.price.toLocaleString('en-US')}
                          </span>
                        )}
                        {tokenBalance && (
                          <span className="token-balance">{tokenBalance}</span>
                        )}
                      </div>
                    </div>
                    {selectedToken?.symbol === token.symbol && (
                      <svg
                        className="check-icon"
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          d="M16.667 5L7.5 14.167L3.333 10"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                )
              })
            ) : (
              <div className="no-tokens">No tokens found</div>
            )}
          </div>
        </div>
      )}

      {error && <span className="error-message">{error}</span>}
    </div>
  )
}

export default TokenSelector

