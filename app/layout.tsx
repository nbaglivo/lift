import type { Metadata } from 'next'
import { Newsreader, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const newsreader = Newsreader({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-newsreader',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Bitácora — Fito-Lift',
  description: 'Monthly gym routine tracker',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${newsreader.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
