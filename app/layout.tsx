import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import PWAInitializer from '@/components/pwa-initializer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CropIntel AR - AI Crop Disease Detection',
  description: 'AI-powered crop disease detection for Arkansas farmers. Real-time risk alerts and instant diagnosis.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
  themeColor: '#16a34a',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="CropIntel AR" />
        <meta name="apple-mobile-web-app-title" content="CropIntel AR" />
      </head>
      <body className={inter.className}>
        <PWAInitializer />
        {children}
        <Toaster />
      </body>
    </html>
  )
}
