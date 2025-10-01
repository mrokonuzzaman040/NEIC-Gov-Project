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
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: 'জাতীয় নির্বাচন তদন্ত কমিশন',
  description: 'বাংলাদেশের জাতীয় নির্বাচন (২০১৪, ২০১৮, ২০২৪) সম্পর্কে অভিমত ও ঘটনা আমাদের সাথে শেয়ার করুন',
  openGraph: {
    title: 'জাতীয় নির্বাচন তদন্ত কমিশন',
    description: 'বাংলাদেশের জাতীয় নির্বাচন (২০১৪, ২০১৮, ২০২৪) সম্পর্কে অভিমত ও ঘটনা আমাদের সাথে শেয়ার করুন',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'জাতীয় নির্বাচন তদন্ত কমিশনের লোগো',
      },
    ],
    locale: 'bn_BD',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'জাতীয় নির্বাচন তদন্ত কমিশন',
    description: 'বাংলাদেশের জাতীয় নির্বাচন (২০১৪, ২০১৮, ২০২৪) সম্পর্কে অভিমত ও ঘটনা আমাদের সাথে শেয়ার করুন',
    images: ['/og-image.png'],
  },
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
