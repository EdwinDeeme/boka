import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import Providers from './Providers'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
  preload: false,
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'BOKA — Comida rápida a tu puerta',
  description: 'Pedidos en línea. Para recoger o envío a domicilio.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'BOKA' },
}

export const viewport: Viewport = {
  themeColor: '#f97316',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={jakarta.variable}>
      <head>
        <link rel="apple-touch-icon" href="/boka-logo.png" />
      </head>
      <body className="font-sans">
        <Providers>{children}</Providers>
        <script dangerouslySetInnerHTML={{
          __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').catch(()=>{})}`
        }} />
      </body>
    </html>
  )
}
