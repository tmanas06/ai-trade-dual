import { Prediction, PriceData } from './types';

interface AIDecisionFactors {
  momentum: number;      // -1 to 1
  volatility: number;    // 0 to 1
  randomness: number;    // 0 to 1
  contrarian: number;    // -1 to 1
}

/**
 * AI Prediction Engine for BTC price direction
 * Uses multiple factors to make a prediction:
 * 1. Momentum: Based on 24h price change
 * 2. Mean reversion: Contrarian to extreme moves
 * 3. Randomness: Adds unpredictability
 */
export function generateAIPrediction(priceData: PriceData): Prediction {
  const factors = calculateFactors(priceData);
  const score = computeDecisionScore(factors);

  // Score > 0 means UP, Score <= 0 means DOWN
  return score > 0 ? 'UP' : 'DOWN';
}

function calculateFactors(priceData: PriceData): AIDecisionFactors {
  const change = priceData.change24h;

  // Momentum: Follow the trend
  // Normalized to -1 to 1 range
  const momentum = Math.tanh(change / 5);

  // Volatility estimate from absolute change
  const volatility = Math.min(Math.abs(change) / 10, 1);

  // Randomness factor
  const randomness = Math.random();

  // Contrarian: Go against extreme moves (mean reversion)
  // Activates when change is > 3% in either direction
  let contrarian = 0;
  if (Math.abs(change) > 3) {
    contrarian = -Math.sign(change) * Math.min((Math.abs(change) - 3) / 5, 0.5);
  }

  return { momentum, volatility, randomness, contrarian };
}

function computeDecisionScore(factors: AIDecisionFactors): number {
  // Weights for each factor
  const weights = {
    momentum: 0.35,
    contrarian: 0.25,
    randomness: 0.40,
  };

  // Combine factors
  let score = 0;

  // Momentum contribution (follow trend)
  score += factors.momentum * weights.momentum;

  // Contrarian contribution (mean reversion)
  score += factors.contrarian * weights.contrarian;

  // Random component to make it less predictable
  // Convert 0-1 random to -1 to 1 range
  score += (factors.randomness - 0.5) * 2 * weights.randomness;

  // Adjust for high volatility (reduce confidence)
  if (factors.volatility > 0.5) {
    score *= 1 - (factors.volatility - 0.5);
  }

  return score;
}

/**
 * Get AI's confidence level (for display purposes)
 */
export function getAIConfidence(priceData: PriceData): number {
  const volatility = Math.min(Math.abs(priceData.change24h) / 10, 1);
  // Base confidence reduced by volatility
  const confidence = Math.round((0.5 + Math.random() * 0.3 - volatility * 0.2) * 100);
  return Math.max(50, Math.min(85, confidence)); // Clamp between 50-85%
}

/**
 * Generate AI's reasoning (for display)
 */
export function getAIReasoning(priceData: PriceData, prediction: Prediction): string {
  const change = priceData.change24h;
  const absChange = Math.abs(change);

  if (absChange < 1) {
    return prediction === 'UP'
      ? "Market is stable, expecting slight upward momentum"
      : "Market is stable, anticipating minor correction";
  }

  if (change > 3) {
    return prediction === 'UP'
      ? "Strong bullish momentum, riding the trend"
      : "Overbought conditions, expecting pullback";
  }

  if (change < -3) {
    return prediction === 'UP'
      ? "Oversold bounce expected"
      : "Bearish momentum continues";
  }

  return prediction === 'UP'
    ? "Technical indicators suggest upside"
    : "Technical indicators point to downside";
}
