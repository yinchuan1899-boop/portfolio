import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'LIN DESIGN — 视觉与产品设计作品集',
  description: '专注品牌、数字产品与动态视觉，在逻辑与感受之间寻找恰好的平衡。',
  openGraph: {
    title: 'LIN DESIGN — 视觉与产品设计作品集',
    description: '把复杂，设计得简单。品牌、数字产品与动态视觉作品集。',
    type: 'website',
    locale: 'zh_CN',
    images: [{ url: '/og.png', width: 1792, height: 1005, alt: '把复杂，设计得简单。' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LIN DESIGN — 视觉与产品设计作品集',
    description: '把复杂，设计得简单。品牌、数字产品与动态视觉作品集。',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
