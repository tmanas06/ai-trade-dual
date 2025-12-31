import { OracleResult, GameSession, CONSTANTS } from './types';
import { getBTCPrice } from './coingecko';
import { getSession, settleSession } from './session';

/**
 * Mock Oracle for settling predictions
 * In production, this would be a real oracle (Chainlink, Pyth, etc.)
 */

export async function checkAndSettleGame(gameId: string): Promise<OracleResult | null> {
  const session = getSession(gameId);

  if (!session) {
    console.error(`Game not found: ${gameId}`);
    return null;
  }

  if (session.status !== 'ACTIVE') {
    // Already settled, return existing result
    if (session.settlementPrice) {
      return {
        entryPrice: session.entryPrice,
        settlementPrice: session.settlementPrice,
        priceChange: ((session.settlementPrice - session.entryPrice) / session.entryPrice) * 100,
        direction: session.settlementPrice > session.entryPrice ? 'UP' : 'DOWN',
      };
    }
    return null;
  }

  // Check if enough time has passed for settlement
  const elapsed = Date.now() - session.createdAt;
  if (elapsed < CONSTANTS.SETTLEMENT_DELAY_MS) {
    return null; // Not ready for settlement yet
  }

  // Fetch current price for settlement
  const currentPrice = await getBTCPrice();

  // Settle the game
  const settledSession = settleSession(gameId, currentPrice.price);

  if (!settledSession) {
    return null;
  }

  return {
    entryPrice: settledSession.entryPrice,
    settlementPrice: currentPrice.price,
    priceChange: ((currentPrice.price - settledSession.entryPrice) / settledSession.entryPrice) * 100,
    direction: currentPrice.price > settledSession.entryPrice ? 'UP' : 'DOWN',
  };
}

/**
 * Get time remaining until settlement
 */
export function getTimeUntilSettlement(session: GameSession): number {
  const elapsed = Date.now() - session.createdAt;
  const remaining = CONSTANTS.SETTLEMENT_DELAY_MS - elapsed;
  return Math.max(0, remaining);
}

/**
 * Format time remaining for display
 */
export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'Ready to settle';

  const seconds = Math.ceil(ms / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Calculate potential winnings
 */
export function calculateWinnings(session: GameSession): {
  userWinAmount: number;
  aiWinAmount: number;
} {
  return {
    userWinAmount: session.warpReward,
    aiWinAmount: 0, // User loses nothing on loss in this version
  };
}

/**
 * Oracle health check
 */
export async function checkOracleHealth(): Promise<boolean> {
  try {
    const price = await getBTCPrice();
    return price.price > 0;
  } catch {
    return false;
  }
}
