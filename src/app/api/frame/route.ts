import { FrameRequest, getFrameMessage, getFrameHtmlResponse } from '@coinbase/onchainkit/frame';
import { NextRequest, NextResponse } from 'next/server';
import { getBTCPrice } from '@/lib/coingecko';
import { createSession, getSession, getUserStats } from '@/lib/session';
import { generateAIPrediction, getAIConfidence } from '@/lib/ai-engine';
import { checkAndSettleGame, getTimeUntilSettlement, formatTimeRemaining } from '@/lib/oracle';
import { Prediction, CONSTANTS } from '@/lib/types';
import { BASE_URL } from '@/lib/config';

function generateImageUrl(params: Record<string, string>): string {
  const searchParams = new URLSearchParams(params);
  return `${BASE_URL}/api/og?${searchParams.toString()}`;
}

export async function GET() {
  const priceData = await getBTCPrice();

  return new NextResponse(
    getFrameHtmlResponse({
      buttons: [
        { label: '🎮 Play Now', action: 'post' },
        { label: '📊 My Stats', action: 'post' },
      ],
      image: {
        src: generateImageUrl({
          screen: 'home',
          price: priceData.price.toString(),
          change: priceData.change24h.toString(),
        }),
        aspectRatio: '1.91:1',
      },
      postUrl: `${BASE_URL}/api/frame`,
    })
  );
}

export async function POST(req: NextRequest) {
  try {
    const body: FrameRequest = await req.json();

    const { isValid, message } = await getFrameMessage(body, {
      neynarApiKey: process.env.NEYNAR_API_KEY || 'NEYNAR_ONCHAIN_KIT',
    });

    if (!isValid || !message) {
      return new NextResponse('Invalid frame message', { status: 400 });
    }

    const fid = message.interactor.fid;
    const buttonIndex = message.button;
    const encodedState = message.state?.serialized;

    // Parse state
    let currentState: { screen: string; gameId?: string } = { screen: 'home' };
    if (encodedState) {
      try {
        const decoded = Buffer.from(encodedState, 'base64').toString('utf-8');
        currentState = JSON.parse(decoded);
      } catch {
        currentState = { screen: 'home' };
      }
    }

    const priceData = await getBTCPrice();

    // Helper to encode state
    const encodeState = (state: object) =>
      Buffer.from(JSON.stringify(state)).toString('base64');

    // Route based on current screen and button
    switch (currentState.screen) {
      case 'home': {
        if (buttonIndex === 1) {
          // Play Now - Go to prediction screen
          return new NextResponse(
            getFrameHtmlResponse({
              buttons: [
                { label: '📈 UP', action: 'post' },
                { label: '📉 DOWN', action: 'post' },
                { label: '🔙 Back', action: 'post' },
              ],
              image: {
                src: generateImageUrl({
                  screen: 'predict',
                  price: priceData.price.toString(),
                  change: priceData.change24h.toString(),
                }),
                aspectRatio: '1.91:1',
              },
              postUrl: `${BASE_URL}/api/frame`,
              state: { screen: 'predict' },
            })
          );
        } else {
          // My Stats
          const stats = getUserStats(fid);
          return new NextResponse(
            getFrameHtmlResponse({
              buttons: [
                { label: '🎮 Play Now', action: 'post' },
                { label: '🔙 Back', action: 'post' },
              ],
              image: {
                src: generateImageUrl({
                  screen: 'stats',
                  wins: stats.wins.toString(),
                  losses: stats.losses.toString(),
                  ties: stats.ties.toString(),
                  warps: stats.warpsWon.toString(),
                }),
                aspectRatio: '1.91:1',
              },
              postUrl: `${BASE_URL}/api/frame`,
              state: { screen: 'stats' },
            })
          );
        }
      }

      case 'stats': {
        if (buttonIndex === 1) {
          // Play Now
          return new NextResponse(
            getFrameHtmlResponse({
              buttons: [
                { label: '📈 UP', action: 'post' },
                { label: '📉 DOWN', action: 'post' },
                { label: '🔙 Back', action: 'post' },
              ],
              image: {
                src: generateImageUrl({
                  screen: 'predict',
                  price: priceData.price.toString(),
                  change: priceData.change24h.toString(),
                }),
                aspectRatio: '1.91:1',
              },
              postUrl: `${BASE_URL}/api/frame`,
              state: { screen: 'predict' },
            })
          );
        } else {
          // Back to home
          return new NextResponse(
            getFrameHtmlResponse({
              buttons: [
                { label: '🎮 Play Now', action: 'post' },
                { label: '📊 My Stats', action: 'post' },
              ],
              image: {
                src: generateImageUrl({
                  screen: 'home',
                  price: priceData.price.toString(),
                  change: priceData.change24h.toString(),
                }),
                aspectRatio: '1.91:1',
              },
              postUrl: `${BASE_URL}/api/frame`,
              state: { screen: 'home' },
            })
          );
        }
      }

      case 'predict': {
        if (buttonIndex === 3) {
          // Back to home
          return new NextResponse(
            getFrameHtmlResponse({
              buttons: [
                { label: '🎮 Play Now', action: 'post' },
                { label: '📊 My Stats', action: 'post' },
              ],
              image: {
                src: generateImageUrl({
                  screen: 'home',
                  price: priceData.price.toString(),
                  change: priceData.change24h.toString(),
                }),
                aspectRatio: '1.91:1',
              },
              postUrl: `${BASE_URL}/api/frame`,
              state: { screen: 'home' },
            })
          );
        }

        // User made a prediction (1 = UP, 2 = DOWN)
        const userPrediction: Prediction = buttonIndex === 1 ? 'UP' : 'DOWN';
        const aiPrediction = generateAIPrediction(priceData);
        const aiConfidence = getAIConfidence(priceData);

        // Create game session
        const session = createSession(
          fid,
          userPrediction,
          aiPrediction,
          priceData.price,
          CONSTANTS.WARP_REWARD
        );

        return new NextResponse(
          getFrameHtmlResponse({
            buttons: [
              { label: '🔄 Check Result', action: 'post' },
              { label: '🔙 Back', action: 'post' },
            ],
            image: {
              src: generateImageUrl({
                screen: 'waiting',
                gameId: session.id,
                userPrediction,
                aiPrediction,
                entryPrice: priceData.price.toString(),
                confidence: aiConfidence.toString(),
              }),
              aspectRatio: '1.91:1',
            },
            postUrl: `${BASE_URL}/api/frame`,
            state: { screen: 'waiting', gameId: session.id },
          })
        );
      }

      case 'waiting': {
        if (buttonIndex === 2) {
          // Back to home
          return new NextResponse(
            getFrameHtmlResponse({
              buttons: [
                { label: '🎮 Play Now', action: 'post' },
                { label: '📊 My Stats', action: 'post' },
              ],
              image: {
                src: generateImageUrl({
                  screen: 'home',
                  price: priceData.price.toString(),
                  change: priceData.change24h.toString(),
                }),
                aspectRatio: '1.91:1',
              },
              postUrl: `${BASE_URL}/api/frame`,
              state: { screen: 'home' },
            })
          );
        }

        // Check result
        const gameId = currentState.gameId;
        if (!gameId) {
          return new NextResponse(
            getFrameHtmlResponse({
              buttons: [{ label: '🔙 Back to Home', action: 'post' }],
              image: {
                src: generateImageUrl({ screen: 'error', message: 'Game not found' }),
                aspectRatio: '1.91:1',
              },
              postUrl: `${BASE_URL}/api/frame`,
              state: { screen: 'home' },
            })
          );
        }

        const session = getSession(gameId);
        if (!session) {
          return new NextResponse(
            getFrameHtmlResponse({
              buttons: [{ label: '🔙 Back to Home', action: 'post' }],
              image: {
                src: generateImageUrl({ screen: 'error', message: 'Game expired' }),
                aspectRatio: '1.91:1',
              },
              postUrl: `${BASE_URL}/api/frame`,
              state: { screen: 'home' },
            })
          );
        }

        // Check if ready to settle
        const timeRemaining = getTimeUntilSettlement(session);
        if (timeRemaining > 0) {
          return new NextResponse(
            getFrameHtmlResponse({
              buttons: [
                { label: '🔄 Check Result', action: 'post' },
                { label: '🔙 Back', action: 'post' },
              ],
              image: {
                src: generateImageUrl({
                  screen: 'waiting',
                  gameId,
                  userPrediction: session.userPrediction,
                  aiPrediction: session.aiPrediction,
                  entryPrice: session.entryPrice.toString(),
                  timeRemaining: formatTimeRemaining(timeRemaining),
                }),
                aspectRatio: '1.91:1',
              },
              postUrl: `${BASE_URL}/api/frame`,
              state: { screen: 'waiting', gameId },
            })
          );
        }

        // Settle the game
        const result = await checkAndSettleGame(gameId);
        const settledSession = getSession(gameId);

        if (!result || !settledSession) {
          return new NextResponse(
            getFrameHtmlResponse({
              buttons: [{ label: '🔙 Back to Home', action: 'post' }],
              image: {
                src: generateImageUrl({ screen: 'error', message: 'Settlement failed' }),
                aspectRatio: '1.91:1',
              },
              postUrl: `${BASE_URL}/api/frame`,
              state: { screen: 'home' },
            })
          );
        }

        return new NextResponse(
          getFrameHtmlResponse({
            buttons: [
              { label: '🎮 Play Again', action: 'post' },
              { label: '📊 My Stats', action: 'post' },
            ],
            image: {
              src: generateImageUrl({
                screen: 'result',
                winner: settledSession.winner || 'TIE',
                userPrediction: settledSession.userPrediction,
                aiPrediction: settledSession.aiPrediction,
                entryPrice: settledSession.entryPrice.toString(),
                settlementPrice: result.settlementPrice.toString(),
                priceChange: result.priceChange.toFixed(2),
                warps: settledSession.winner === 'USER' ? CONSTANTS.WARP_REWARD.toString() : '0',
              }),
              aspectRatio: '1.91:1',
            },
            postUrl: `${BASE_URL}/api/frame`,
            state: { screen: 'result' },
          })
        );
      }

      case 'result': {
        if (buttonIndex === 1) {
          // Play Again
          return new NextResponse(
            getFrameHtmlResponse({
              buttons: [
                { label: '📈 UP', action: 'post' },
                { label: '📉 DOWN', action: 'post' },
                { label: '🔙 Back', action: 'post' },
              ],
              image: {
                src: generateImageUrl({
                  screen: 'predict',
                  price: priceData.price.toString(),
                  change: priceData.change24h.toString(),
                }),
                aspectRatio: '1.91:1',
              },
              postUrl: `${BASE_URL}/api/frame`,
              state: { screen: 'predict' },
            })
          );
        } else {
          // My Stats
          const stats = getUserStats(fid);
          return new NextResponse(
            getFrameHtmlResponse({
              buttons: [
                { label: '🎮 Play Now', action: 'post' },
                { label: '🔙 Back', action: 'post' },
              ],
              image: {
                src: generateImageUrl({
                  screen: 'stats',
                  wins: stats.wins.toString(),
                  losses: stats.losses.toString(),
                  ties: stats.ties.toString(),
                  warps: stats.warpsWon.toString(),
                }),
                aspectRatio: '1.91:1',
              },
              postUrl: `${BASE_URL}/api/frame`,
              state: { screen: 'stats' },
            })
          );
        }
      }

      default:
        // Fallback to home
        return new NextResponse(
          getFrameHtmlResponse({
            buttons: [
              { label: '🎮 Play Now', action: 'post' },
              { label: '📊 My Stats', action: 'post' },
            ],
            image: {
              src: generateImageUrl({
                screen: 'home',
                price: priceData.price.toString(),
                change: priceData.change24h.toString(),
              }),
              aspectRatio: '1.91:1',
            },
            postUrl: `${BASE_URL}/api/frame`,
            state: { screen: 'home' },
          })
        );
    }
  } catch (error) {
    console.error('Frame error:', error);
    return new NextResponse(
      getFrameHtmlResponse({
        buttons: [{ label: '🔙 Try Again', action: 'post' }],
        image: {
          src: generateImageUrl({ screen: 'error', message: 'Something went wrong' }),
          aspectRatio: '1.91:1',
        },
        postUrl: `${BASE_URL}/api/frame`,
        state: { screen: 'home' },
      })
    );
  }
}
