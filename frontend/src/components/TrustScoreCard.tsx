'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Shield, Star, Award, CheckCircle } from 'lucide-react'

export const TrustScoreCard = () => {
  // Mock data for demonstration
  const trustScore = {
    totalScore: 750,
    tier: 'Silver' as const,
    baseScore: 400,
    socialProofs: 200,
    defiActivity: 100,
    contributionHistory: 50,
    completedCircles: 3
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum': return 'bg-slate-100 text-slate-800'
      case 'Gold': return 'bg-yellow-100 text-yellow-800'
      case 'Silver': return 'bg-gray-100 text-gray-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'Platinum': return Award
      case 'Gold': return Star
      case 'Silver': return Shield
      default: return CheckCircle
    }
  }

  const TierIcon = getTierIcon(trustScore.tier)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-500" />
              Trust Score
            </CardTitle>
            <CardDescription>Your reputation in the network</CardDescription>
          </div>
          <Badge className={getTierColor(trustScore.tier)}>
            <TierIcon className="h-3 w-3 mr-1" />
            {trustScore.tier}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {trustScore.totalScore}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(trustScore.totalScore / 1000 * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {trustScore.totalScore < 600 && 'Keep building your reputation!'}
            {trustScore.totalScore >= 600 && trustScore.totalScore < 800 && 'Great progress!'}
            {trustScore.totalScore >= 800 && 'Excellent reputation!'}
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Base Score</span>
            <span className="font-medium">{trustScore.baseScore}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Social Proofs</span>
            <span className="font-medium">{trustScore.socialProofs}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">DeFi Activity</span>
            <span className="font-medium">{trustScore.defiActivity}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Contributions</span>
            <span className="font-medium">{trustScore.contributionHistory}</span>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button className="w-full" variant="outline" size="sm">
            Improve Score
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}