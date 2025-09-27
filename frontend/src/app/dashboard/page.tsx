'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WalletButton } from '@/components/wallet/WalletConnection'
import { TrustScoreCard } from '@/components/TrustScoreCard'
import { CirclesList } from '@/components/CirclesList'
import { LendingPositions } from '@/components/LendingPositions'
import { 
  Users, 
  Coins, 
  TrendingUp, 
  Vote, 
  Shield, 
  CircleDollarSign,
  ArrowRight,
  Plus,
  Activity,
  Wallet
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { connected, publicKey } = useWallet()

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
              You need to connect your wallet to access the dashboard
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
  const userStats = {
    activeCircles: 3,
    totalContributions: 2500,
    yieldEarned: 127.5,
    trustScore: 750
  }

  const recentActivity = [
    { type: 'contribution', amount: 500, circle: 'Tech Savers Circle', date: '2024-01-15' },
    { type: 'yield', amount: 25.3, circle: 'Community Fund', date: '2024-01-14' },
    { type: 'distribution', amount: 2500, circle: 'Startup Circle', date: '2024-01-12' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <CircleDollarSign className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Halo Protocol
              </span>
            </Link>
            
            <div className="flex items-center gap-4">
              <WalletButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
          <p className="text-muted-foreground">
            Manage your circles, track contributions, and monitor your DeFi positions.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Circles</p>
                  <p className="text-2xl font-bold">{userStats.activeCircles}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Contributed</p>
                  <p className="text-2xl font-bold">${userStats.totalContributions.toLocaleString()}</p>
                </div>
                <Coins className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Yield Earned</p>
                  <p className="text-2xl font-bold">${userStats.yieldEarned}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Trust Score</p>
                  <p className="text-2xl font-bold">{userStats.trustScore}</p>
                </div>
                <Shield className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Dashboard */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="circles" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="circles">My Circles</TabsTrigger>
                <TabsTrigger value="lending">Lending</TabsTrigger>
                <TabsTrigger value="governance">Governance</TabsTrigger>
              </TabsList>

              <TabsContent value="circles" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Your Circles</h2>
                  <Button asChild>
                    <Link href="/circles/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Circle
                    </Link>
                  </Button>
                </div>
                <CirclesList />
              </TabsContent>

              <TabsContent value="lending" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Lending Positions</h2>
                  <Button variant="outline" asChild>
                    <Link href="/lending">
                      View All <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
                <LendingPositions />
              </TabsContent>

              <TabsContent value="governance" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Active Proposals</h2>
                  <Button variant="outline" asChild>
                    <Link href="/governance">
                      View All <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center text-muted-foreground">
                      <Vote className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No active proposals at the moment</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trust Score */}
            <TrustScoreCard />

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div>
                      <p className="text-sm font-medium">
                        {activity.type === 'contribution' && '💰 Contribution'}
                        {activity.type === 'yield' && '📈 Yield Earned'}
                        {activity.type === 'distribution' && '🎉 Distribution'}
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.circle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">${activity.amount}</p>
                      <p className="text-xs text-muted-foreground">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/circles">Browse Circles</Link>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/lending">Lending Dashboard</Link>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/trust-score">Improve Trust Score</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}