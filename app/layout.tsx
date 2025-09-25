import type { Metadata } from 'next';
import { Noto_Sans, Noto_Sans_Bengali, Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const notoSans = Noto_Sans({ 
  subsets: ['latin'], 
  weight: ['400','500','600','700'],
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
  preload: true,
  variable: '--font-noto-sans'
});

const notoSansBengali = Noto_Sans_Bengali({ 
  subsets: ['bengali'], 
  weight: ['400','500','600','700'],
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
  preload: true,
  variable: '--font-noto-sans-bengali'
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter'
});

export const metadata: Metadata = {
  title: 'Bangladesh National Elections Inquiry Commission',
  description: 'Official portal for election investigations and public submissions',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script src="/scripts/theme-init.js" strategy="beforeInteractive" />
      </head>
      <body className={`${notoSans.variable} ${notoSansBengali.variable} ${inter.variable} watermark-bg`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
