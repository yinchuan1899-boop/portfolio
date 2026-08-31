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
  title: 'LIN DESIGN — UI 界面设计作品集',
  description: '专注 UI 界面与交互体验，也为公司活动提供海报等视觉设计支持。',
  openGraph: {
    title: 'LIN DESIGN — UI 界面设计作品集',
    description: '让界面，好用也好看。UI 界面、交互体验与活动海报作品集。',
    type: 'website',
    locale: 'zh_CN',
    images: [{ url: '/og.png', width: 1792, height: 1005, alt: '把复杂，设计得简单。' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LIN DESIGN — UI 界面设计作品集',
    description: '让界面，好用也好看。UI 界面、交互体验与活动海报作品集。',
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
