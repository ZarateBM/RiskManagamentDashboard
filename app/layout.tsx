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
      <body className="layout-grid">
        <header>
          <Nav />
        </header>
        <main style={{minHeight: 'calc(100vh - 100px)'}}>
          {children}
        </main>
        <footer>
          <Footer />
        </footer>
      </body>
    </html>
  )
}
