import { useEffect } from 'react'
import './SuccessModal.css'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  fromAmount: string
  fromSymbol: string
  toAmount: string
  toSymbol: string
}

const SuccessModal = ({
  isOpen,
  onClose,
  fromAmount,
  fromSymbol,
  toAmount,
  toSymbol,
}: SuccessModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div className="success-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="success-modal-header">
          <div className="success-icon-container">
            <div className="success-checkmark">
              <svg
                width="80"
                height="80"
                viewBox="0 0 80 80"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="40"
                  cy="40"
                  r="40"
                  fill="url(#successGradient)"
                  className="success-circle"
                />
                <path
                  d="M25 40L35 50L55 30"
                  stroke="white"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="success-check"
                />
                <defs>
                  <linearGradient id="successGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="success-particles">
              {[...Array(12)].map((_, i) => {
                const angle = (i * 360) / 12
                const radians = (angle * Math.PI) / 180
                const distance = 60
                const x = Math.cos(radians) * distance
                const y = Math.sin(radians) * distance
                return (
                  <div
                    key={i}
                    className="success-particle"
                    style={{
                      '--delay': `${i * 0.05}s`,
                      '--x': `${x}px`,
                      '--y': `${y}px`,
                    } as React.CSSProperties}
                  />
                )
              })}
            </div>
          </div>
          <h2 className="success-modal-title">Swap Successful!</h2>
          <p className="success-modal-subtitle">Your transaction has been completed</p>
        </div>

        <div className="success-modal-body">
          <div className="success-swap-details">
            <div className="success-swap-item">
              <div className="success-amount">{fromAmount}</div>
              <div className="success-symbol">{fromSymbol}</div>
            </div>
            <div className="success-arrow">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16 6L26 16L16 26M6 16H26"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="success-swap-item">
              <div className="success-amount">{toAmount}</div>
              <div className="success-symbol">{toSymbol}</div>
            </div>
          </div>
        </div>

        <div className="success-modal-footer">
          <button className="success-modal-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default SuccessModal

