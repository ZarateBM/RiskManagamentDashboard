import type { Metadata } from 'next'
import { Nav } from '@/components/nav'
import './globals.css'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'UCR - risk management',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Nav />
        {children}
        <Footer />
      </body>
    </html>
  )
}
