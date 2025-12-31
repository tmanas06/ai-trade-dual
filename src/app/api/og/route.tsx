import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const WIDTH = 1200;
const HEIGHT = 630;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const screen = searchParams.get('screen') || 'home';

  try {
    switch (screen) {
      case 'home':
        return renderHomeScreen(searchParams);
      case 'predict':
        return renderPredictScreen(searchParams);
      case 'waiting':
        return renderWaitingScreen(searchParams);
      case 'result':
        return renderResultScreen(searchParams);
      case 'stats':
        return renderStatsScreen(searchParams);
      case 'error':
        return renderErrorScreen(searchParams);
      default:
        return renderHomeScreen(searchParams);
    }
  } catch (error) {
    console.error('OG Image error:', error);
    return renderErrorScreen(new URLSearchParams({ message: 'Image generation failed' }));
  }
}

function renderHomeScreen(params: URLSearchParams) {
  const price = parseFloat(params.get('price') || '0');
  const change = parseFloat(params.get('change') || '0');
  const isPositive = change >= 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 72, color: '#fff', marginBottom: 20 }}>
          ⚔️ AI Trade Duel
        </div>
        <div style={{ display: 'flex', fontSize: 32, color: '#94a3b8', marginBottom: 40 }}>
          Predict BTC Price vs AI • Win Warps
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 20,
            padding: '30px 60px',
          }}
        >
          <div style={{ display: 'flex', fontSize: 28, color: '#94a3b8' }}>Current BTC Price</div>
          <div style={{ display: 'flex', fontSize: 64, color: '#fff', fontWeight: 'bold' }}>
            ${price.toLocaleString()}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 28,
              color: isPositive ? '#22c55e' : '#ef4444',
            }}
          >
            {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(2)}% (24h)
          </div>
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT }
  );
}

function renderPredictScreen(params: URLSearchParams) {
  const price = parseFloat(params.get('price') || '0');
  const change = parseFloat(params.get('change') || '0');
  const isPositive = change >= 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 48, color: '#fff', marginBottom: 20 }}>
          🎯 Make Your Prediction
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 20,
            padding: '30px 60px',
            marginBottom: 30,
          }}
        >
          <div style={{ display: 'flex', fontSize: 24, color: '#94a3b8' }}>BTC Price</div>
          <div style={{ display: 'flex', fontSize: 56, color: '#fff', fontWeight: 'bold' }}>
            ${price.toLocaleString()}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 24,
              color: isPositive ? '#22c55e' : '#ef4444',
            }}
          >
            {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(2)}%
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 32, color: '#fbbf24' }}>
          Will BTC go UP or DOWN in 1 minute?
        </div>
        <div style={{ display: 'flex', fontSize: 24, color: '#94a3b8', marginTop: 20 }}>
          Win 10 Warps if you beat the AI!
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT }
  );
}

function renderWaitingScreen(params: URLSearchParams) {
  const userPrediction = params.get('userPrediction') || 'UP';
  const aiPrediction = params.get('aiPrediction') || 'DOWN';
  const entryPrice = parseFloat(params.get('entryPrice') || '0');
  const confidence = params.get('confidence') || '75';
  const timeRemaining = params.get('timeRemaining');

  return new ImageResponse(
    (
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 48, color: '#fff', marginBottom: 30 }}>
          ⚔️ Duel in Progress
        </div>
        <div style={{ display: 'flex', gap: 60, marginBottom: 40 }}>
          {/* User prediction */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: userPrediction === 'UP' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
              borderRadius: 20,
              padding: '30px 50px',
              border: `3px solid ${userPrediction === 'UP' ? '#22c55e' : '#ef4444'}`,
            }}
          >
            <div style={{ display: 'flex', fontSize: 24, color: '#94a3b8' }}>You</div>
            <div
              style={{
                display: 'flex',
                fontSize: 48,
                color: userPrediction === 'UP' ? '#22c55e' : '#ef4444',
              }}
            >
              {userPrediction === 'UP' ? '📈 UP' : '📉 DOWN'}
            </div>
          </div>
          {/* VS */}
          <div
            style={{ display: 'flex', alignItems: 'center', fontSize: 48, color: '#fbbf24' }}
          >
            VS
          </div>
          {/* AI prediction */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: aiPrediction === 'UP' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
              borderRadius: 20,
              padding: '30px 50px',
              border: `3px solid ${aiPrediction === 'UP' ? '#22c55e' : '#ef4444'}`,
            }}
          >
            <div style={{ display: 'flex', fontSize: 24, color: '#94a3b8' }}>AI ({confidence}%)</div>
            <div
              style={{
                display: 'flex',
                fontSize: 48,
                color: aiPrediction === 'UP' ? '#22c55e' : '#ef4444',
              }}
            >
              {aiPrediction === 'UP' ? '📈 UP' : '📉 DOWN'}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 28, color: '#94a3b8' }}>
          Entry: ${entryPrice.toLocaleString()}
        </div>
        {timeRemaining && (
          <div style={{ display: 'flex', fontSize: 32, color: '#fbbf24', marginTop: 20 }}>
            ⏱️ {timeRemaining} until settlement
          </div>
        )}
      </div>
    ),
    { width: WIDTH, height: HEIGHT }
  );
}

function renderResultScreen(params: URLSearchParams) {
  const winner = params.get('winner') || 'TIE';
  const userPrediction = params.get('userPrediction') || 'UP';
  const aiPrediction = params.get('aiPrediction') || 'DOWN';
  const entryPrice = parseFloat(params.get('entryPrice') || '0');
  const settlementPrice = parseFloat(params.get('settlementPrice') || '0');
  const priceChange = params.get('priceChange') || '0';
  const warps = params.get('warps') || '0';

  const priceWentUp = settlementPrice > entryPrice;
  const userWon = winner === 'USER';
  const isTie = winner === 'TIE';

  return new ImageResponse(
    (
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: userWon
            ? 'linear-gradient(135deg, #14532d 0%, #166534 50%, #15803d 100%)'
            : isTie
            ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
            : 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #991b1b 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 64, color: '#fff', marginBottom: 20 }}>
          {userWon ? '🎉 You Won!' : isTie ? '🤝 It\'s a Tie!' : '😔 AI Wins'}
        </div>
        {userWon && (
          <div style={{ display: 'flex', fontSize: 48, color: '#fbbf24', marginBottom: 20 }}>
            +{warps} Warps 🪙
          </div>
        )}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: 20,
            padding: '30px 60px',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', fontSize: 24, color: '#94a3b8' }}>Price Movement</div>
          <div
            style={{
              display: 'flex',
              fontSize: 48,
              color: priceWentUp ? '#22c55e' : '#ef4444',
            }}
          >
            {priceWentUp ? '📈' : '📉'} {priceChange}%
          </div>
          <div style={{ display: 'flex', fontSize: 20, color: '#94a3b8', marginTop: 10 }}>
            ${entryPrice.toLocaleString()} → ${settlementPrice.toLocaleString()}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 40, fontSize: 24, color: '#94a3b8' }}>
          <span>You: {userPrediction}</span>
          <span>|</span>
          <span>AI: {aiPrediction}</span>
          <span>|</span>
          <span>Actual: {priceWentUp ? 'UP' : 'DOWN'}</span>
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT }
  );
}

function renderStatsScreen(params: URLSearchParams) {
  const wins = params.get('wins') || '0';
  const losses = params.get('losses') || '0';
  const ties = params.get('ties') || '0';
  const warps = params.get('warps') || '0';
  const totalGames = parseInt(wins) + parseInt(losses) + parseInt(ties);
  const winRate = totalGames > 0 ? ((parseInt(wins) / totalGames) * 100).toFixed(1) : '0';

  return new ImageResponse(
    (
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 56, color: '#fff', marginBottom: 40 }}>
          📊 Your Stats
        </div>
        <div style={{ display: 'flex', gap: 40, marginBottom: 40 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'rgba(34,197,94,0.2)',
              borderRadius: 20,
              padding: '30px 40px',
            }}
          >
            <div style={{ display: 'flex', fontSize: 48, color: '#22c55e', fontWeight: 'bold' }}>
              {wins}
            </div>
            <div style={{ display: 'flex', fontSize: 24, color: '#94a3b8' }}>Wins</div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'rgba(239,68,68,0.2)',
              borderRadius: 20,
              padding: '30px 40px',
            }}
          >
            <div style={{ display: 'flex', fontSize: 48, color: '#ef4444', fontWeight: 'bold' }}>
              {losses}
            </div>
            <div style={{ display: 'flex', fontSize: 24, color: '#94a3b8' }}>Losses</div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'rgba(148,163,184,0.2)',
              borderRadius: 20,
              padding: '30px 40px',
            }}
          >
            <div style={{ display: 'flex', fontSize: 48, color: '#94a3b8', fontWeight: 'bold' }}>
              {ties}
            </div>
            <div style={{ display: 'flex', fontSize: 24, color: '#94a3b8' }}>Ties</div>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'rgba(251,191,36,0.2)',
            borderRadius: 20,
            padding: '20px 60px',
          }}
        >
          <div style={{ display: 'flex', fontSize: 48, color: '#fbbf24', fontWeight: 'bold' }}>
            {warps} 🪙
          </div>
          <div style={{ display: 'flex', fontSize: 24, color: '#94a3b8' }}>Total Warps Won</div>
        </div>
        <div style={{ display: 'flex', fontSize: 28, color: '#94a3b8', marginTop: 30 }}>
          Win Rate: {winRate}% ({totalGames} games)
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT }
  );
}

function renderErrorScreen(params: URLSearchParams) {
  const message = params.get('message') || 'An error occurred';

  return new ImageResponse(
    (
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #991b1b 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 72, marginBottom: 20 }}>⚠️</div>
        <div style={{ display: 'flex', fontSize: 48, color: '#fff' }}>{message}</div>
        <div style={{ display: 'flex', fontSize: 28, color: '#fca5a5', marginTop: 20 }}>
          Please try again
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT }
  );
}
