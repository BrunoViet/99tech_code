import { TokenPrice } from '../types'

const PRICES_API_URL = 'https://interview.switcheo.com/prices.json'
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price'
const TOKEN_ICON_BASE_URL = 'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens'

// Mapping token symbols to CoinGecko IDs
const COINGECKO_IDS: { [key: string]: string } = {
  SWTH: 'switcheo',
  ETH: 'ethereum',
  BTC: 'bitcoin',
  USDC: 'usd-coin',
  USDT: 'tether',
  BNB: 'binancecoin',
  SOL: 'solana',
  ADA: 'cardano',
  DOT: 'polkadot',
  MATIC: 'matic-network',
  AVAX: 'avalanche-2',
  LINK: 'chainlink',
  UNI: 'uniswap',
  ATOM: 'cosmos',
  XRP: 'ripple',
}

export const getTokenIconUrl = (symbol: string): string => {
  return `${TOKEN_ICON_BASE_URL}/${symbol.toUpperCase()}.svg`
}

// Fetch prices from CoinGecko API
const fetchCoinGeckoPrices = async (): Promise<TokenPrice> => {
  try {
    const ids = Object.values(COINGECKO_IDS).join(',')
    const url = `${COINGECKO_API_URL}?ids=${ids}&vs_currencies=usd`
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })
    
    if (!response.ok) {
      console.warn(`CoinGecko API returned status ${response.status}`)
      throw new Error(`Failed to fetch from CoinGecko: ${response.status}`)
    }
    
    const data = await response.json()
    const prices: TokenPrice = {}
    
    // Convert CoinGecko format to our format
    Object.entries(COINGECKO_IDS).forEach(([symbol, id]) => {
      if (data[id] && data[id].usd !== undefined) {
        prices[symbol] = data[id].usd
      }
    })
    
    console.log(`Fetched ${Object.keys(prices).length} prices from CoinGecko`)
    return prices
  } catch (error) {
    console.error('Error fetching from CoinGecko:', error)
    return {}
  }
}

// Fetch prices from original API (fallback)
const fetchOriginalPrices = async (): Promise<TokenPrice> => {
  try {
    const response = await fetch(PRICES_API_URL)
    if (!response.ok) {
      throw new Error('Failed to fetch token prices')
    }
    const data = await response.json()
    return data as TokenPrice
  } catch (error) {
    console.error('Error fetching from original API:', error)
    return {}
  }
}

export const fetchTokenPrices = async (): Promise<TokenPrice> => {
  // Try CoinGecko first
  const coingeckoPrices = await fetchCoinGeckoPrices()
  
  // If we got some prices from CoinGecko, use them
  if (Object.keys(coingeckoPrices).length > 0) {
    console.log('Using CoinGecko prices')
    return coingeckoPrices
  }
  
  console.log('CoinGecko returned no prices, trying original API...')
  // Otherwise, try the original API as fallback
  const originalPrices = await fetchOriginalPrices()
  
  if (Object.keys(originalPrices).length > 0) {
    console.log('Using original API prices')
    return originalPrices
  }
  
  console.warn('No prices available from any API')
  // Return empty object if both fail
  return {}
}

export const calculateExchangeRate = (
  fromPrice: number,
  toPrice: number
): number => {
  if (toPrice === 0) return 0
  return fromPrice / toPrice
}

export const calculateToAmount = (
  fromAmount: number,
  exchangeRate: number
): number => {
  return fromAmount * exchangeRate
}

