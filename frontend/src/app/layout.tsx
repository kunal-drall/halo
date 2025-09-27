import type { Metadata } from 'next'
import './globals.css'
import { WalletContextProvider } from '@/components/wallet/WalletContextProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Halo Protocol - Decentralized Savings Circles',
  description: 'Create and join savings circles on Solana with built-in lending and trust scoring',
  keywords: ['Solana', 'DeFi', 'ROSCA', 'Savings', 'Lending', 'Trust Score'],
  authors: [{ name: 'Halo Protocol Team' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>
          <WalletContextProvider>
            {children}
          </WalletContextProvider>
        </Providers>
      </body>
    </html>
  )
}