import { PriceData, CONSTANTS } from './types';

interface CoinGeckoResponse {
  bitcoin: {
    usd: number;
    usd_24h_change: number;
  };
}

let cachedPrice: PriceData | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 10000; // 10 seconds cache

export async function getBTCPrice(): Promise<PriceData> {
  const now = Date.now();

  // Return cached price if still valid
  if (cachedPrice && now - cacheTimestamp < CACHE_TTL) {
    return cachedPrice;
  }

  try {
    const response = await fetch(
      `${CONSTANTS.COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 10 },
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data: CoinGeckoResponse = await response.json();

    cachedPrice = {
      price: data.bitcoin.usd,
      change24h: data.bitcoin.usd_24h_change,
      timestamp: now,
    };
    cacheTimestamp = now;

    return cachedPrice;
  } catch (error) {
    console.error('Failed to fetch BTC price:', error);

    // Return cached price if available, even if stale
    if (cachedPrice) {
      return cachedPrice;
    }

    // Fallback mock price for development
    return {
      price: 95000 + Math.random() * 2000,
      change24h: (Math.random() - 0.5) * 10,
      timestamp: now,
    };
  }
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatPriceChange(change: number): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(2)}%`;
}
