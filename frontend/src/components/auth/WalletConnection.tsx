'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Wallet,
  Shield,
  LogOut,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

export const WalletConnection = () => {
  const { publicKey, connected, disconnect } = useWallet()
  const [copied, setCopied] = useState(false)

  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toBase58())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  if (connected && publicKey) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full max-w-md border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-gradient-primary">Wallet Connected</CardTitle>
            <CardDescription>
              Your Solana wallet is connected and ready
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 p-4 border border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  <span className="font-mono text-sm font-medium">
                    {shortenAddress(publicKey.toBase58())}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAddress}
                    className="h-8 w-8 p-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`https://explorer.solana.com/address/${publicKey.toBase58()}?cluster=devnet`, '_blank')}
                    className="h-8 w-8 p-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                Devnet
              </Badge>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => disconnect()}
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Disconnect Wallet
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-md border-primary/20 hover:border-primary/40 transition-colors">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-primary/10 to-secondary/10">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-gradient-primary">Connect Your Wallet</CardTitle>
          <CardDescription>
            Connect your Solana wallet to start using Halo Protocol
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            <WalletMultiButton className="!bg-gradient-to-r !from-primary !to-primary/90 hover:!from-primary/90 hover:!to-primary/80 !text-white !font-medium !py-3 !px-6 !rounded-xl !shadow-lg hover:!shadow-xl !transition-all !duration-200" />
          </div>

          <div className="text-center text-xs text-muted-foreground space-y-2">
            <p>Supported wallets:</p>
            <div className="flex justify-center gap-3">
              <Badge variant="outline" className="text-xs">
                Phantom
              </Badge>
              <Badge variant="outline" className="text-xs">
                Solflare
              </Badge>
              <Badge variant="outline" className="text-xs">
                Ledger
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Simple wallet button for nav/header
export const WalletButton = () => {
  const { connected, disconnect, publicKey } = useWallet()

  if (connected && publicKey) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="font-mono text-xs">
          {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => disconnect()}
          className="text-red-600 hover:text-red-700"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !text-white !text-sm !py-2 !px-4 !rounded-lg" />
}
