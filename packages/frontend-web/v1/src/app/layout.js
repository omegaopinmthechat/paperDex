import { Inter } from 'next/font/google';
import './globals.css';
import CookieBanner from './components/CookieBanner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata = {
  title: 'PaperDEX — Institutional Paper Trading',
  description: 'Simulate decentralized exchange trades on Sepolia Testnet with zero risk.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.variable} antialiased`}>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
