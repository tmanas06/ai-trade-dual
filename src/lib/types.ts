export type Prediction = 'UP' | 'DOWN';

export type GameStatus = 'PENDING' | 'ACTIVE' | 'SETTLED';

export interface GameSession {
  id: string;
  fid: number;
  userPrediction: Prediction;
  aiPrediction: Prediction;
  entryPrice: number;
  settlementPrice: number | null;
  status: GameStatus;
  winner: 'USER' | 'AI' | 'TIE' | null;
  warpReward: number;
  createdAt: number;
  settledAt: number | null;
}

export interface PriceData {
  price: number;
  change24h: number;
  timestamp: number;
}

export interface OracleResult {
  entryPrice: number;
  settlementPrice: number;
  priceChange: number;
  direction: Prediction;
}

export interface FrameState {
  gameId?: string;
  step: 'HOME' | 'PREDICT' | 'WAITING' | 'RESULT';
}

export const CONSTANTS = {
  SETTLEMENT_DELAY_MS: 60000, // 1 minute for demo (adjust for production)
  WARP_REWARD: 10,
  COINGECKO_API: 'https://api.coingecko.com/api/v3',
  FRAME_IMAGE_WIDTH: 1200,
  FRAME_IMAGE_HEIGHT: 630,
} as const;
