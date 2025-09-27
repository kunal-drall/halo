'use client'

import React from 'react'
import { PrivyProvider } from '@privy-io/react-auth'

interface PrivyAuthProviderProps {
  children: React.ReactNode
}

export const PrivyAuthProvider = ({ children }: PrivyAuthProviderProps) => {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'your-privy-app-id'}
      config={{
        // Customize Privy's appearance and features
        appearance: {
          theme: 'light',
          accentColor: '#3A0CA3',
          logo: '/halo-logo.png',
        },
        // Configure login methods
        loginMethods: ['google', 'email', 'apple', 'telegram'],
        // Configure embedded wallets
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
          noPromptOnSignature: false,
        },
        // Configure supported chains (Solana)
        supportedChains: [
          {
            id: 103, // Solana Mainnet
            name: 'Solana',
            network: 'mainnet-beta',
            nativeCurrency: {
              name: 'SOL',
              symbol: 'SOL',
              decimals: 9,
            },
            rpcUrls: {
              default: {
                http: [process.env.NEXT_PUBLIC_RPC_ENDPOINT || 'https://api.mainnet-beta.solana.com'],
              },
            },
          },
        ],
      }}
    >
      {children}
    </PrivyProvider>
  )
}