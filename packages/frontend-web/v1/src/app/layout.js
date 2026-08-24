import { Inter } from 'next/font/google';
import './globals.css';
import CookieBanner from './components/CookieBanner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata = {
  title: 'PaperDEX: paper trading',
  description: 'Simulate decentralized exchange trades with zero risk.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
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
