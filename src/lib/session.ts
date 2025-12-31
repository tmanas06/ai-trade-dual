import { GameSession, GameStatus, Prediction } from './types';

// In-memory session storage (use Redis/DB in production)
const sessions = new Map<string, GameSession>();
const userSessions = new Map<number, string[]>(); // fid -> gameIds

export function generateGameId(): string {
  return `game_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function createSession(
  fid: number,
  userPrediction: Prediction,
  aiPrediction: Prediction,
  entryPrice: number,
  warpReward: number
): GameSession {
  const id = generateGameId();
  const session: GameSession = {
    id,
    fid,
    userPrediction,
    aiPrediction,
    entryPrice,
    settlementPrice: null,
    status: 'ACTIVE',
    winner: null,
    warpReward,
    createdAt: Date.now(),
    settledAt: null,
  };

  sessions.set(id, session);

  // Track user's games
  const userGames = userSessions.get(fid) || [];
  userGames.push(id);
  userSessions.set(fid, userGames);

  return session;
}

export function getSession(gameId: string): GameSession | null {
  return sessions.get(gameId) || null;
}

export function updateSession(gameId: string, updates: Partial<GameSession>): GameSession | null {
  const session = sessions.get(gameId);
  if (!session) return null;

  const updated = { ...session, ...updates };
  sessions.set(gameId, updated);
  return updated;
}

export function settleSession(
  gameId: string,
  settlementPrice: number
): GameSession | null {
  const session = sessions.get(gameId);
  if (!session || session.status !== 'ACTIVE') return null;

  const priceWentUp = settlementPrice > session.entryPrice;
  const actualDirection: Prediction = priceWentUp ? 'UP' : 'DOWN';

  const userCorrect = session.userPrediction === actualDirection;
  const aiCorrect = session.aiPrediction === actualDirection;

  let winner: 'USER' | 'AI' | 'TIE';
  if (userCorrect && !aiCorrect) {
    winner = 'USER';
  } else if (!userCorrect && aiCorrect) {
    winner = 'AI';
  } else {
    winner = 'TIE';
  }

  const updated: GameSession = {
    ...session,
    settlementPrice,
    status: 'SETTLED',
    winner,
    settledAt: Date.now(),
  };

  sessions.set(gameId, updated);
  return updated;
}

export function getUserActiveGame(fid: number): GameSession | null {
  const userGames = userSessions.get(fid) || [];

  for (const gameId of userGames.reverse()) {
    const session = sessions.get(gameId);
    if (session && session.status === 'ACTIVE') {
      return session;
    }
  }

  return null;
}

export function getUserStats(fid: number): { wins: number; losses: number; ties: number; warpsWon: number } {
  const userGames = userSessions.get(fid) || [];
  let wins = 0;
  let losses = 0;
  let ties = 0;
  let warpsWon = 0;

  for (const gameId of userGames) {
    const session = sessions.get(gameId);
    if (session && session.status === 'SETTLED') {
      if (session.winner === 'USER') {
        wins++;
        warpsWon += session.warpReward;
      } else if (session.winner === 'AI') {
        losses++;
      } else {
        ties++;
      }
    }
  }

  return { wins, losses, ties, warpsWon };
}

// Cleanup old sessions (call periodically)
export function cleanupOldSessions(maxAgeMs: number = 24 * 60 * 60 * 1000): void {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.createdAt > maxAgeMs) {
      sessions.delete(id);
    }
  }
}
