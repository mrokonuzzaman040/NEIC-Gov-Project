import type { Metadata } from 'next';
import { Noto_Sans } from 'next/font/google';
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
    <html suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark') {
                  document.documentElement.classList.add('dark')
                } else {
                  document.documentElement.classList.remove('dark')
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${noto.className} watermark-bg`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}