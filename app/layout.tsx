import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';
import './globals.css';

const notoSans = localFont({
  src: [
    {
      path: '../public/fonts/Noto_Sans/static/NotoSans-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Noto_Sans/static/NotoSans-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/Noto_Sans/static/NotoSans-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/Noto_Sans/static/NotoSans-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
  preload: true,
  variable: '--font-noto-sans'
});

const notoSansBengali = localFont({
  src: [
    {
      path: '../public/fonts/Noto_Sans_Bengali/static/NotoSansBengali-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Noto_Sans_Bengali/static/NotoSansBengali-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/Noto_Sans_Bengali/static/NotoSansBengali-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/Noto_Sans_Bengali/static/NotoSansBengali-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
  preload: true,
  variable: '--font-noto-sans-bengali'
});

const inter = localFont({
  src: [
    {
      path: '../public/fonts/Inter/static/Inter_18pt-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/Inter/static/Inter_18pt-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/Inter/static/Inter_18pt-SemiBold.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/Inter/static/Inter_18pt-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
  preload: true,
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
