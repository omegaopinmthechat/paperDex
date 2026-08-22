import { Space_Mono } from 'next/font/google';
import './globals.css';
import CookieBanner from './components/CookieBanner';

const courier = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-courier',
});

export const metadata = {
  title: 'PaperDEX',
  description: 'Paper trading DEX on Sepolia',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={courier.variable}>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
