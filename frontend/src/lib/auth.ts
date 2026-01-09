'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'

// Wallet-based authentication hook
export const useAuth = () => {
  const { publicKey, connected, disconnect } = useWallet()
  const { setVisible } = useWalletModal()

  return {
    authenticated: connected && !!publicKey,
    login: () => setVisible(true),
    logout: () => disconnect(),
    user: publicKey ? {
      id: publicKey.toBase58(),
      wallet: {
        address: publicKey.toBase58()
      }
    } : null,
    publicKey
  }
}
