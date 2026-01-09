'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import { useCircleStore } from '@/stores/circleStore'
import { 
  Users, 
  Coins, 
  Calendar, 
  Search,
  Filter,
  ArrowRight,
  Wallet,
  Star,
  Shield,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

export default function CirclesPage() {
  const { authenticated } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  
  const { 
    availableCircles, 
    loading, 
    error, 
    fetchAvailableCircles,
    clearCache 
  } = useCircleStore()

  useEffect(() => {
    if (authenticated) {
      fetchAvailableCircles()
    }
  }, [authenticated, fetchAvailableCircles])

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Wallet className="h-8 w-8 text-primary" />
            </div>
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              You need to connect your wallet to browse circles
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <WalletMultiButton className="!bg-primary hover:!bg-primary/90" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleRefresh = () => {
    clearCache()
    fetchAvailableCircles()
  }

  const circles = availableCircles.map(circle => ({
    id: circle.id,
    name: `Circle ${circle.id.slice(0, 8)}`,
    description: `${circle.circleType} circle with ${circle.payoutMethod} payout`,
    contributionAmount: circle.contributionAmount,
    currentMembers: circle.currentMembers || 0,
    maxMembers: circle.maxMembers,
    durationMonths: circle.durationMonths,
    currentMonth: circle.currentRound,
    status: circle.status.toLowerCase() as 'active' | 'full' | 'completed' | 'paused',
    nextContribution: new Date(circle.createdAt + (circle.currentRound * 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
    penaltyRate: circle.penaltyRate,
    yieldRate: circle.totalYieldEarned > 0 ? (circle.totalYieldEarned / (circle.totalPot || 1)) * 100 : 4.2,
    creatorTrustScore: 650,
    minTrustScore: circle.minTrustTier * 200,
    tags: [circle.circleType, circle.payoutMethod, circle.isPublic ? 'Public' : 'Private']
  }))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'full': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-purple-100 text-purple-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTrustScoreColor = (score: number) => {
    if (score >= 800) return 'text-green-600'
    if (score >= 600) return 'text-blue-600'
    if (score >= 400) return 'text-orange-600'
    return 'text-red-600'
  }

  const filteredCircles = circles.filter(circle => {
    const matchesSearch = circle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         circle.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || circle.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Browse Circles
              </span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Button asChild>
                <Link href="/circles/create">Create Circle</Link>
              </Button>
              <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !text-sm !py-2 !px-4 !rounded-lg" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Savings Circles</h1>
          <p className="text-muted-foreground">
            Join trusted savings circles and start building your financial future.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <Button variant="link" onClick={handleRefresh} className="ml-2 text-red-700 underline">
              Try again
            </Button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search circles..."
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-input rounded-md bg-background"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="full">Full</option>
              <option value="completed">Completed</option>
            </select>
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {loading && circles.length === 0 && (
          <div className="flex justify-center py-12">
            <Loading />
          </div>
        )}

        {/* Circles Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCircles.map((circle) => (
            <Card key={circle.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{circle.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{circle.description}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(circle.status)}>
                    {circle.status}
                  </Badge>
                </div>
                
                <div className="flex flex-wrap gap-1 mt-2">
                  {circle.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {circle.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{circle.tags.length - 2}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-green-500" />
                    <span className="text-muted-foreground">Contribution:</span>
                  </div>
                  <div className="font-medium">${circle.contributionAmount}</div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-muted-foreground">Members:</span>
                  </div>
                  <div className="font-medium">{circle.currentMembers}/{circle.maxMembers}</div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <span className="text-muted-foreground">Duration:</span>
                  </div>
                  <div className="font-medium">{circle.durationMonths} months</div>
                  
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-orange-500" />
                    <span className="text-muted-foreground">Yield APY:</span>
                  </div>
                  <div className="font-medium text-green-600">{circle.yieldRate}%</div>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between text-sm mb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Creator Trust:</span>
                    </div>
                    <span className={`font-medium ${getTrustScoreColor(circle.creatorTrustScore)}`}>
                      {circle.creatorTrustScore}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-muted-foreground">Min. Trust Score:</span>
                    <span className="font-medium">{circle.minTrustScore}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    disabled={circle.status === 'full'}
                    asChild={circle.status !== 'full'}
                  >
                    {circle.status === 'full' ? (
                      'Circle Full'
                    ) : (
                      <Link href={`/circles/${circle.id}`}>
                        {circle.status === 'active' ? 'Join Circle' : 'View Details'}
                      </Link>
                    )}
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <Link href={`/circles/${circle.id}`}>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredCircles.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No circles found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters, or create a new circle.
              </p>
              <Button asChild>
                <Link href="/circles/create">Create New Circle</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Call to Action */}
        <div className="mt-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Don't See What You're Looking For?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Create your own savings circle with custom parameters that fit your community's needs.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/circles/create">
              Create Your Circle <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}