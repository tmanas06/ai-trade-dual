import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Trade Duel - Predict BTC vs AI',
  description: 'Challenge AI to predict BTC price movements. Win Warps!',
  openGraph: {
    title: 'AI Trade Duel',
    description: 'Predict BTC price movements and beat the AI to win Warps!',
    images: [`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?screen=home`],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
