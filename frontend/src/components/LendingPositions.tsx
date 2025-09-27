'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react'

export const LendingPositions = () => {
  // Mock data for demonstration
  const positions = [
    {
      id: '1',
      type: 'deposit' as const,
      asset: 'USDC',
      amount: 5000,
      apy: 4.2,
      earned: 87.5,
      reserve: 'Main Pool'
    },
    {
      id: '2',
      type: 'deposit' as const,
      asset: 'SOL',
      amount: 50,
      apy: 6.8,
      earned: 12.3,
      reserve: 'SOL Reserve'
    },
    {
      id: '3',
      type: 'borrow' as const,
      asset: 'USDC',
      amount: 2000,
      apy: 8.5,
      interest: 45.2,
      healthFactor: 2.4,
      reserve: 'Main Pool'
    }
  ]

  const getTypeColor = (type: string) => {
    return type === 'deposit' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-orange-100 text-orange-800'
  }

  const getTypeIcon = (type: string) => {
    return type === 'deposit' ? TrendingUp : TrendingDown
  }

  const getHealthFactorColor = (healthFactor: number) => {
    if (healthFactor >= 2) return 'text-green-600'
    if (healthFactor >= 1.5) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {positions.map((position) => {
          const TypeIcon = getTypeIcon(position.type)
          return (
            <Card key={position.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${position.type === 'deposit' ? 'bg-green-100' : 'bg-orange-100'}`}>
                      <TypeIcon className={`h-4 w-4 ${position.type === 'deposit' ? 'text-green-600' : 'text-orange-600'}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{position.asset}</CardTitle>
                      <CardDescription>{position.reserve}</CardDescription>
                    </div>
                  </div>
                  <Badge className={getTypeColor(position.type)}>
                    {position.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="text-lg font-semibold">
                      {position.amount.toLocaleString()} {position.asset}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">APY</p>
                    <p className="text-lg font-semibold">{position.apy}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {position.type === 'deposit' ? 'Earned' : 'Interest Paid'}
                    </p>
                    <p className={`text-sm font-medium ${position.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                      ${position.type === 'deposit' ? position.earned : position.interest}
                    </p>
                  </div>
                  {position.type === 'borrow' && position.healthFactor && (
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        Health Factor
                        {position.healthFactor < 1.5 && (
                          <AlertTriangle className="h-3 w-3 text-yellow-500" />
                        )}
                      </p>
                      <p className={`text-sm font-medium ${getHealthFactorColor(position.healthFactor)}`}>
                        {position.healthFactor}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    {position.type === 'deposit' ? 'Withdraw' : 'Repay'}
                  </Button>
                  <Button size="sm" className="flex-1">
                    {position.type === 'deposit' ? 'Add More' : 'Add Collateral'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {positions.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No lending positions yet</p>
            <Button>Start Lending</Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-900">Earn More Yield</p>
              <p className="text-xs text-blue-700">
                Deposit your circle funds to earn up to 8% APY through Solend
              </p>
            </div>
            <Button size="sm" className="ml-auto">
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}