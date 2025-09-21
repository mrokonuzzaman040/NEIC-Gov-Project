import type { Metadata } from 'next';
import { Noto_Sans } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const noto = Noto_Sans({ subsets: ['latin'], weight: ['400','500','600','700'] });

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
      <body className={`${noto.className} watermark-bg`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
