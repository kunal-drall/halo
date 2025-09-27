'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Globe, RefreshCw } from 'lucide-react'

export const NetworkSwitch = () => {
  const [currentNetwork, setCurrentNetwork] = useState(
    process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'
  )
  const [isLoading, setIsLoading] = useState(false)

  const handleNetworkSwitch = async () => {
    setIsLoading(true)
    // In a real implementation, this would update environment variables
    // and potentially reload the application or update the wallet connection
    
    setTimeout(() => {
      const newNetwork = currentNetwork === 'devnet' ? 'mainnet-beta' : 'devnet'
      setCurrentNetwork(newNetwork)
      setIsLoading(false)
      // This would normally require a page reload or state management update
      console.log(`Switched to ${newNetwork}`)
    }, 1000)
  }

  const networkConfig = {
    devnet: {
      label: 'Devnet',
      description: 'Development network',
      color: 'bg-yellow-100 text-yellow-800',
    },
    'mainnet-beta': {
      label: 'Mainnet',
      description: 'Production network',
      color: 'bg-green-100 text-green-800',
    }
  }

  const config = networkConfig[currentNetwork as keyof typeof networkConfig]

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className={`${config.color} flex items-center gap-1`}>
        <Globe className="h-3 w-3" />
        {config.label}
      </Badge>
      <Button
        variant="outline"
        size="sm"
        onClick={handleNetworkSwitch}
        disabled={isLoading}
        className="text-xs"
      >
        {isLoading ? (
          <RefreshCw className="h-3 w-3 animate-spin mr-1" />
        ) : (
          'Switch'
        )}
      </Button>
    </div>
  )
}