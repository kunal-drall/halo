import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { WalletContextProvider } from '@/contexts/WalletContext'
import { ToastProvider } from '@/components/ui/toast'
import { BottomNavigation } from '@/components/navigation/BottomNavigation'

export const metadata: Metadata = {
  title: 'Halo Protocol - Finance Powered by Community & Solana',
  description: 'Join trusted savings circles, earn yield, and build your financial reputation in the DeFi ecosystem.',
  keywords: ['Solana', 'DeFi', 'ROSCA', 'Savings', 'Lending', 'Trust Score', 'Community Finance'],
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
        <WalletContextProvider>
          <ToastProvider>
            <Providers>
              <div className="min-h-screen pb-20">
                {children}
              </div>
              <BottomNavigation />
            </Providers>
          </ToastProvider>
        </WalletContextProvider>
      </body>
    </html>
  )
}