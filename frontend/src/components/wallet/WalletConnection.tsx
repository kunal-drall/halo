'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, User, Shield } from 'lucide-react'

export const WalletConnection = () => {
  const { wallet, connected, publicKey } = useWallet()

  if (connected && publicKey) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Shield className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle>Wallet Connected</CardTitle>
          <CardDescription>
            Connected to {wallet?.adapter.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs text-muted-foreground mb-1">Public Key</p>
            <p className="text-sm font-mono break-all">
              {publicKey.toString()}
            </p>
          </div>
          <WalletMultiButton className="!bg-secondary !text-secondary-foreground hover:!bg-secondary/80 w-full justify-center" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Wallet className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Connect Your Wallet</CardTitle>
        <CardDescription>
          Connect your Solana wallet to start using Halo Protocol
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <WalletMultiButton className="!bg-primary !text-primary-foreground hover:!bg-primary/90 w-full justify-center" />
        </div>
        <div className="text-center text-xs text-muted-foreground">
          <p>Supported wallets: Phantom, Solflare</p>
        </div>
      </CardContent>
    </Card>
  )
}

export const WalletButton = () => {
  return (
    <WalletMultiButton className="!bg-primary !text-primary-foreground hover:!bg-primary/90" />
  )
}