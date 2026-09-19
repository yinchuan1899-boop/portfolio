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

const productionHost =
  process.env.VERCEL_PROJECT_PRODUCTION_URL ??
  'lin-design-portfolio-2026.ycoo1.chatgpt.site';

export const metadata: Metadata = {
  metadataBase: new URL(`https://${productionHost}`),
  title: '造境｜殷川的转正作品集',
  description: '从创意构想，到体验现场。殷川的数字展陈界面、互动游戏 UI 与活动视觉作品集。',
  openGraph: {
    title: '造境｜殷川的转正作品集',
    description: '从创意构想，到体验现场。浏览数字展陈界面、互动游戏 UI 与活动视觉作品。',
    type: 'website',
    locale: 'zh_CN',
    images: [{ url: '/og.png', width: 1792, height: 1005, alt: '让界面，好用也好看。' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '造境｜殷川的转正作品集',
    description: '从创意构想，到体验现场。浏览数字展陈界面、互动游戏 UI 与活动视觉作品。',
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
