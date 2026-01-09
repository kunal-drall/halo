'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Shield,
  Star,
  Award,
  CheckCircle,
  Twitter,
  Github,
  MessageCircle,
  Linkedin,
  Wallet,
  Plus,
  ExternalLink,
  TrendingUp,
  Users,
  History
} from 'lucide-react'
import Link from 'next/link'

export default function TrustScorePage() {
  const { authenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

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
              You need to connect your wallet to view your trust score
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <WalletMultiButton className="!bg-primary hover:!bg-primary/90" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Mock data for demonstration
  const trustScore = {
    totalScore: 750,
    tier: 'Silver' as const,
    baseScore: 400,
    socialProofs: 200,
    defiActivity: 100,
    contributionHistory: 50,
    completedCircles: 3,
    breakdown: {
      socialVerification: { current: 200, max: 300, percentage: 67 },
      defiActivity: { current: 100, max: 200, percentage: 50 },
      contributionHistory: { current: 50, max: 150, percentage: 33 },
      longevity: { current: 100, max: 100, percentage: 100 }
    }
  }

  const socialProofs = [
    {
      platform: 'Twitter',
      icon: Twitter,
      handle: '@johndoe',
      verified: true,
      score: 100,
      description: 'Active Twitter account with crypto engagement'
    },
    {
      platform: 'GitHub',
      icon: Github,
      handle: 'johndoe',
      verified: true,
      score: 100,
      description: 'Developer with contributions to DeFi projects'
    },
    {
      platform: 'Discord',
      icon: MessageCircle,
      handle: 'johndoe#1234',
      verified: false,
      score: 0,
      description: 'Verify your Discord account'
    },
    {
      platform: 'LinkedIn',
      icon: Linkedin,
      handle: 'john-doe',
      verified: false,
      score: 0,
      description: 'Professional networking verification'
    }
  ]

  const contributionHistory = [
    {
      circle: 'Tech Savers Circle',
      contributions: 12,
      onTime: 12,
      amount: 6000,
      completed: true
    },
    {
      circle: 'Community Fund',
      contributions: 7,
      onTime: 7,
      amount: 1750,
      completed: false
    },
    {
      circle: 'Startup Circle',
      contributions: 5,
      onTime: 5,
      amount: 5000,
      completed: true
    }
  ]

  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'Platinum':
        return {
          icon: Award,
          color: 'text-slate-600',
          bgColor: 'bg-slate-100',
          minScore: 900,
          maxScore: 1000,
          benefits: ['Lowest stake requirements', 'Priority circle placement', 'Governance voting power', 'Premium support']
        }
      case 'Gold':
        return {
          icon: Star,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          minScore: 700,
          maxScore: 899,
          benefits: ['Reduced stake requirements', 'Early access to new circles', 'Enhanced voting power', 'Priority support']
        }
      case 'Silver':
        return {
          icon: Shield,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          minScore: 500,
          maxScore: 699,
          benefits: ['Standard stake requirements', 'Access to most circles', 'Basic voting power', 'Standard support']
        }
      default:
        return {
          icon: CheckCircle,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          minScore: 0,
          maxScore: 499,
          benefits: ['Higher stake requirements', 'Limited circle access', 'Basic features only', 'Community support']
        }
    }
  }

  const tierInfo = getTierInfo(trustScore.tier)
  const TierIcon = tierInfo.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Trust Score
              </span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
              <WalletMultiButton className="!bg-primary hover:!bg-primary/90 !text-sm !py-2 !px-4 !rounded-lg" />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Trust Score Overview */}
          <div className="mb-8">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10" />
              <CardContent className="p-8 relative">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">Your Trust Score</h1>
                    <p className="text-muted-foreground">
                      Build your reputation to unlock better rates and access
                    </p>
                  </div>
                  <Badge className={`${tierInfo.bgColor} ${tierInfo.color} text-lg px-4 py-2`}>
                    <TierIcon className="h-5 w-5 mr-2" />
                    {trustScore.tier} Tier
                  </Badge>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="text-6xl font-bold text-purple-600 mb-4">
                      {trustScore.totalScore}
                    </div>
                    <div className="relative w-full bg-gray-200 rounded-full h-4 mb-4">
                      <div 
                        className="absolute left-0 top-0 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${((trustScore.totalScore - tierInfo.minScore) / (tierInfo.maxScore - tierInfo.minScore)) * 100}%` 
                        }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {tierInfo.maxScore - trustScore.totalScore} points to next tier
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Score Breakdown</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Social Verification</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${trustScore.breakdown.socialVerification.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12">
                            {trustScore.breakdown.socialVerification.current}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">DeFi Activity</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${trustScore.breakdown.defiActivity.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12">
                            {trustScore.breakdown.defiActivity.current}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Contribution History</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-500 h-2 rounded-full"
                              style={{ width: `${trustScore.breakdown.contributionHistory.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12">
                            {trustScore.breakdown.contributionHistory.current}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Account Longevity</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-500 h-2 rounded-full"
                              style={{ width: `${trustScore.breakdown.longevity.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12">
                            {trustScore.breakdown.longevity.current}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'social', label: 'Social Proofs' },
                { id: 'history', label: 'History' },
                { id: 'benefits', label: 'Tier Benefits' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-3" />
                    <div className="text-2xl font-bold">5.2%</div>
                    <div className="text-sm text-muted-foreground">Stake Reduction</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Based on your current trust tier
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Users className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                    <div className="text-2xl font-bold">{trustScore.completedCircles}</div>
                    <div className="text-sm text-muted-foreground">Circles Completed</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Perfect contribution record
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <History className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                    <div className="text-2xl font-bold">18</div>
                    <div className="text-sm text-muted-foreground">Months Active</div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Member since early 2023
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Social Proofs Tab */}
            {activeTab === 'social' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Social Verification</h3>
                  <Badge variant="outline">
                    {socialProofs.filter(p => p.verified).length}/{socialProofs.length} Verified
                  </Badge>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {socialProofs.map((proof) => {
                    const Icon = proof.icon
                    return (
                      <Card key={proof.platform} className={proof.verified ? 'border-green-200 bg-green-50' : ''}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-full ${
                              proof.verified ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                              <Icon className={`h-4 w-4 ${
                                proof.verified ? 'text-green-600' : 'text-gray-600'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{proof.platform}</h4>
                                {proof.verified ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Plus className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{proof.handle}</p>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-sm">+{proof.score}</div>
                              <div className="text-xs text-muted-foreground">points</div>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{proof.description}</p>
                          {!proof.verified && (
                            <Button size="sm" className="w-full">
                              <ExternalLink className="h-3 w-3 mr-2" />
                              Verify {proof.platform}
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Contribution History</h3>
                <div className="space-y-4">
                  {contributionHistory.map((history, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold">{history.circle}</h4>
                          <Badge className={history.completed ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                            {history.completed ? 'Completed' : 'Active'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Contributions</p>
                            <p className="font-medium">{history.contributions}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">On Time</p>
                            <p className="font-medium text-green-600">{history.onTime}/{history.contributions}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Total Amount</p>
                            <p className="font-medium">${history.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Success Rate</p>
                            <p className="font-medium">100%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits Tab */}
            {activeTab === 'benefits' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Tier Benefits</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {['Newcomer', 'Silver', 'Gold', 'Platinum'].map((tier) => {
                    const info = getTierInfo(tier)
                    const TierIconLocal = info.icon
                    const isCurrentTier = tier === trustScore.tier
                    
                    return (
                      <Card key={tier} className={isCurrentTier ? 'ring-2 ring-purple-500' : ''}>
                        <CardHeader className="text-center pb-3">
                          <div className={`mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full ${info.bgColor}`}>
                            <TierIconLocal className={`h-6 w-6 ${info.color}`} />
                          </div>
                          <CardTitle className="text-lg">{tier}</CardTitle>
                          <CardDescription>
                            {info.minScore} - {info.maxScore} points
                          </CardDescription>
                          {isCurrentTier && (
                            <Badge className="mt-2">Current Tier</Badge>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {info.benefits.map((benefit, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{benefit}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Call to Action */}
          <Card className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Improve Your Trust Score</h3>
              <p className="text-purple-100 mb-4">
                Complete social verifications and maintain perfect contribution records to unlock better rates.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="secondary" size="lg">
                  Verify Social Accounts
                </Button>
                <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white/10">
                  Join More Circles
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}