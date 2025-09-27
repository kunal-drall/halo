'use client'

import { WalletConnection } from '@/components/wallet/WalletConnection'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useWallet } from '@solana/wallet-adapter-react'
import { Badge } from '@/components/ui/badge'
import { NetworkSwitch } from '@/components/NetworkSwitch'
import { 
  Users, 
  Coins, 
  TrendingUp, 
  Vote, 
  Shield, 
  CircleDollarSign,
  ArrowRight,
  Star,
  Activity
} from 'lucide-react'

export default function HomePage() {
  const { connected } = useWallet()

  const features = [
    {
      icon: Users,
      title: 'Savings Circles',
      description: 'Create or join rotating savings and credit circles with trusted members',
      color: 'text-blue-500'
    },
    {
      icon: TrendingUp,
      title: 'Yield Generation',
      description: 'Earn yield on pooled funds through Solend integration',
      color: 'text-green-500'
    },
    {
      icon: Shield,
      title: 'Trust Scoring',
      description: 'Build your reputation with social proofs and contribution history',
      color: 'text-purple-500'
    },
    {
      icon: Vote,
      title: 'Governance',
      description: 'Vote on protocol parameters and community proposals',
      color: 'text-orange-500'
    }
  ]

  const stats = [
    { label: 'Active Circles', value: '247', icon: CircleDollarSign },
    { label: 'Total Value Locked', value: '$2.4M', icon: Coins },
    { label: 'Monthly Yield', value: '5.2%', icon: TrendingUp },
    { label: 'Active Users', value: '1,834', icon: Users }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <CircleDollarSign className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Halo Protocol
            </span>
            <Badge variant="secondary" className="text-xs">
              {process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet-beta' ? 'Mainnet' : 'Devnet'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4">
            <NetworkSwitch />
            {connected && (
              <Button variant="outline" asChild>
                <a href="/dashboard">
                  Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
            Decentralized Savings Circles on Solana
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join trusted savings circles, earn yield on your contributions, and build your financial reputation in the DeFi ecosystem.
          </p>
          
          {!connected ? (
            <div className="flex justify-center">
              <WalletConnection />
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="/circles/create">
                  Create Circle <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="/circles">
                  Browse Circles
                </a>
              </Button>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <Icon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Halo Protocol?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience the future of community-driven savings with built-in yield generation and trust-based lending.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="text-center pb-4">
                    <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100`}>
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-center">
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* CTA Section */}
        {connected && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Saving?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join thousands of users already earning yield and building financial reputation through our trusted savings circles.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <a href="/dashboard">
                  Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10" asChild>
                <a href="/circles">
                  Explore Circles
                </a>
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 bg-white">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 Halo Protocol. Building the future of decentralized finance.</p>
        </div>
      </footer>
    </div>
  )
}