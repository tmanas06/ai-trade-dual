import { getFrameMetadata } from '@coinbase/onchainkit/frame';
import { Metadata } from 'next';
import { getBTCPrice, formatPrice, formatPriceChange } from '@/lib/coingecko';
import { BASE_URL } from '@/lib/config';

export async function generateMetadata(): Promise<Metadata> {
  const priceData = await getBTCPrice();

  const frameMetadata = getFrameMetadata({
    buttons: [
      { label: '🎮 Play Now', action: 'post' },
      { label: '📊 My Stats', action: 'post' },
    ],
    image: {
      src: `${BASE_URL}/api/og?screen=home&price=${priceData.price}&change=${priceData.change24h}`,
      aspectRatio: '1.91:1',
    },
    postUrl: `${BASE_URL}/api/frame`,
  });

  return {
    title: 'AI Trade Duel - Predict BTC vs AI',
    description: 'Challenge AI to predict BTC price movements. Win Warps!',
    openGraph: {
      title: 'AI Trade Duel',
      description: 'Predict BTC price movements and beat the AI to win Warps!',
      images: [
        `${BASE_URL}/api/og?screen=home&price=${priceData.price}&change=${priceData.change24h}`,
      ],
    },
    other: {
      ...frameMetadata,
    },
  };
}

export default async function Home() {
  const priceData = await getBTCPrice();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">⚔️ AI Trade Duel</h1>
          <p className="text-xl text-slate-400 mb-8">
            Predict BTC Price vs AI • Win Warps
          </p>

          <div className="bg-slate-800/50 rounded-2xl p-8 max-w-md mx-auto mb-8">
            <p className="text-slate-400 mb-2">Current BTC Price</p>
            <p className="text-4xl font-bold mb-2">{formatPrice(priceData.price)}</p>
            <p
              className={`text-lg ${
                priceData.change24h >= 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {priceData.change24h >= 0 ? '↑' : '↓'}{' '}
              {formatPriceChange(priceData.change24h)} (24h)
            </p>
          </div>

          <div className="bg-slate-800/30 rounded-2xl p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">How to Play</h2>
            <div className="text-left space-y-4 text-slate-300">
              <div className="flex items-start gap-3">
                <span className="text-2xl">1️⃣</span>
                <p>
                  <strong>Make your prediction</strong> - Will BTC go UP or DOWN
                  in the next minute?
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">2️⃣</span>
                <p>
                  <strong>AI makes its prediction</strong> - Based on market
                  analysis and momentum
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">3️⃣</span>
                <p>
                  <strong>Oracle settles</strong> - After 1 minute, the oracle
                  checks the price
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">4️⃣</span>
                <p>
                  <strong>Win Warps!</strong> - Beat the AI and earn 10 Warps
                </p>
              </div>
            </div>
          </div>

          <p className="mt-8 text-slate-500">
            Open this page in Warpcast to play the Frame
          </p>
        </div>
      </div>
    </main>
  );
}
