'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WalletButton } from '@/components/wallet/WalletConnection'
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Wallet,
  PlusCircle,
  MinusCircle,
  RefreshCw,
  Info
} from 'lucide-react'
import Link from 'next/link'

export default function LendingPage() {
  const { connected } = useWallet()
  const [selectedAsset, setSelectedAsset] = useState('USDC')
  const [actionType, setActionType] = useState<'deposit' | 'borrow' | 'repay' | 'withdraw'>('deposit')
  const [amount, setAmount] = useState('')

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              You need to connect your wallet to access lending features
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <WalletButton />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Mock data for demonstration
  const marketData = [
    {
      asset: 'USDC',
      icon: '💵',
      depositAPY: 4.2,
      borrowAPY: 8.5,
      totalSupply: 12500000,
      totalBorrow: 8200000,
      utilization: 65.6,
      price: 1.00
    },
    {
      asset: 'SOL',
      icon: '🟣',
      depositAPY: 6.8,
      borrowAPY: 12.3,
      totalSupply: 125000,
      totalBorrow: 89000,
      utilization: 71.2,
      price: 98.45
    },
    {
      asset: 'USDT',
      icon: '💚',
      depositAPY: 3.9,
      borrowAPY: 7.8,
      totalSupply: 8900000,
      totalBorrow: 5100000,
      utilization: 57.3,
      price: 1.00
    },
    {
      asset: 'mSOL',
      icon: '🔵',
      depositAPY: 5.5,
      borrowAPY: 10.2,
      totalSupply: 85000,
      totalBorrow: 42000,
      utilization: 49.4,
      price: 106.78
    }
  ]

  const userPositions = [
    {
      id: '1',
      type: 'deposit' as const,
      asset: 'USDC',
      amount: 5000,
      apy: 4.2,
      earned: 87.5,
      value: 5087.5
    },
    {
      id: '2',
      type: 'deposit' as const,
      asset: 'SOL',
      amount: 50,
      apy: 6.8,
      earned: 1.2,
      value: 51.2 * 98.45
    },
    {
      id: '3',
      type: 'borrow' as const,
      asset: 'USDC',
      amount: 2000,
      apy: 8.5,
      interest: 45.2,
      value: 2045.2,
      healthFactor: 2.4
    }
  ]

  const selectedMarketData = marketData.find(m => m.asset === selectedAsset) || marketData[0]

  const handleAction = async () => {
    if (!amount) return
    
    console.log(`${actionType} ${amount} ${selectedAsset}`)
    // Here would be the actual Solend integration
    alert(`${actionType} ${amount} ${selectedAsset} - Transaction would be submitted`)
    setAmount('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Solend Lending
              </span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
              <WalletButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Lending Dashboard</h1>
          <p className="text-muted-foreground">
            Earn yield on deposits and borrow against your collateral through Solend Protocol.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="markets" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="markets">Markets</TabsTrigger>
                <TabsTrigger value="positions">Your Positions</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              {/* Markets Tab */}
              <TabsContent value="markets" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Markets</CardTitle>
                    <CardDescription>
                      Supply assets to earn yield or borrow against your collateral
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {marketData.map((market) => (
                        <div key={market.asset} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{market.icon}</div>
                            <div>
                              <h3 className="font-semibold">{market.asset}</h3>
                              <p className="text-sm text-muted-foreground">${market.price.toFixed(2)}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-6 text-sm">
                            <div className="text-center">
                              <p className="text-muted-foreground">Supply APY</p>
                              <p className="font-semibold text-green-600">{market.depositAPY}%</p>
                            </div>
                            <div className="text-center">
                              <p className="text-muted-foreground">Borrow APY</p>
                              <p className="font-semibold text-orange-600">{market.borrowAPY}%</p>
                            </div>
                            <div className="text-center">
                              <p className="text-muted-foreground">Utilization</p>
                              <p className="font-semibold">{market.utilization}%</p>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedAsset(market.asset)
                                setActionType('deposit')
                              }}
                            >
                              Supply
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => {
                                setSelectedAsset(market.asset)
                                setActionType('borrow')
                              }}
                            >
                              Borrow
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Positions Tab */}
              <TabsContent value="positions" className="space-y-4">
                <div className="grid gap-4">
                  {userPositions.map((position) => (
                    <Card key={position.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${position.type === 'deposit' ? 'bg-green-100' : 'bg-orange-100'}`}>
                              {position.type === 'deposit' ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-orange-600" />
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{position.asset}</CardTitle>
                              <CardDescription>
                                {position.type === 'deposit' ? 'Supply Position' : 'Borrow Position'}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className={position.type === 'deposit' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                            {position.type}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Amount</p>
                            <p className="font-semibold">{position.amount.toLocaleString()} {position.asset}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">APY</p>
                            <p className="font-semibold">{position.apy}%</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              {position.type === 'deposit' ? 'Earned' : 'Interest'}
                            </p>
                            <p className={`font-semibold ${position.type === 'deposit' ? 'text-green-600' : 'text-orange-600'}`}>
                              ${position.type === 'deposit' ? position.earned : position.interest}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Value</p>
                            <p className="font-semibold">${position.value?.toFixed(2)}</p>
                          </div>
                        </div>

                        {position.type === 'borrow' && position.healthFactor && (
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                            <AlertTriangle className={`h-4 w-4 ${position.healthFactor < 1.5 ? 'text-red-500' : 'text-green-500'}`} />
                            <span className="text-sm">Health Factor: </span>
                            <span className={`font-semibold ${position.healthFactor < 1.5 ? 'text-red-600' : 'text-green-600'}`}>
                              {position.healthFactor}
                            </span>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => {
                              setSelectedAsset(position.asset)
                              setActionType(position.type === 'deposit' ? 'withdraw' : 'repay')
                            }}
                          >
                            {position.type === 'deposit' ? 'Withdraw' : 'Repay'}
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => {
                              setSelectedAsset(position.asset)
                              setActionType(position.type === 'deposit' ? 'deposit' : 'borrow')
                            }}
                          >
                            {position.type === 'deposit' ? 'Add More' : 'Borrow More'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">$5,142.7</div>
                      <div className="text-sm text-muted-foreground">Total Supplied</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <TrendingDown className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-orange-600">$2,045.2</div>
                      <div className="text-sm text-muted-foreground">Total Borrowed</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6 text-center">
                      <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">$88.7</div>
                      <div className="text-sm text-muted-foreground">Net Earnings</div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Portfolio Health</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Health Factor</span>
                      <span className="text-lg font-semibold text-green-600">2.4</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '80%' }} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your portfolio is healthy. Health factor above 1.0 prevents liquidation.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Action */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Quick Action
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Action</label>
                  <select 
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value as any)}
                  >
                    <option value="deposit">Supply</option>
                    <option value="withdraw">Withdraw</option>
                    <option value="borrow">Borrow</option>
                    <option value="repay">Repay</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Asset</label>
                  <select 
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    value={selectedAsset}
                    onChange={(e) => setSelectedAsset(e.target.value)}
                  >
                    {marketData.map(market => (
                      <option key={market.asset} value={market.asset}>
                        {market.asset}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Amount</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {actionType === 'deposit' && `Supply APY: ${selectedMarketData.depositAPY}%`}
                    {actionType === 'borrow' && `Borrow APY: ${selectedMarketData.borrowAPY}%`}
                  </p>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleAction}
                  disabled={!amount || parseFloat(amount) <= 0}
                >
                  {actionType.charAt(0).toUpperCase() + actionType.slice(1)} {selectedAsset}
                </Button>
              </CardContent>
            </Card>

            {/* Market Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Market Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Protocol TVL:</span>
                  <span className="font-medium">$142.7M</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">24h Volume:</span>
                  <span className="font-medium">$8.4M</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Active Users:</span>
                  <span className="font-medium">12,847</span>
                </div>
                <div className="pt-3 border-t">
                  <Button variant="outline" className="w-full" asChild>
                    <a href="https://solend.fi" target="_blank" rel="noopener noreferrer">
                      View on Solend
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}