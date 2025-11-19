import './SwapButton.css'

interface SwapButtonProps {
  onClick: () => void
}

const SwapButton = ({ onClick }: SwapButtonProps) => {
  return (
    <button
      type="button"
      className="swap-icon-button"
      onClick={onClick}
      aria-label="Swap tokens"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        className="swap-icon"
      >
        <path
          d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}

export default SwapButton

