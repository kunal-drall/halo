'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Coins, Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export const CirclesList = () => {
  // Mock data for demonstration
  const circles = [
    {
      id: '1',
      name: 'Tech Savers Circle',
      description: 'Monthly savings for tech professionals',
      contributionAmount: 500,
      currentMembers: 8,
      maxMembers: 10,
      currentMonth: 3,
      durationMonths: 12,
      status: 'active' as const,
      nextContribution: '2024-02-01',
      totalPot: 4000,
      myTurn: false
    },
    {
      id: '2',
      name: 'Community Fund',
      description: 'Building community wealth together',
      contributionAmount: 250,
      currentMembers: 12,
      maxMembers: 12,
      currentMonth: 7,
      durationMonths: 12,
      status: 'active' as const,
      nextContribution: '2024-02-15',
      totalPot: 3000,
      myTurn: true
    },
    {
      id: '3',
      name: 'Startup Circle',
      description: 'Supporting early-stage entrepreneurs',
      contributionAmount: 1000,
      currentMembers: 5,
      maxMembers: 5,
      currentMonth: 5,
      durationMonths: 5,
      status: 'completed' as const,
      nextContribution: null,
      totalPot: 5000,
      myTurn: false
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      {circles.map((circle) => (
        <Card key={circle.id} className="relative">
          {circle.myTurn && (
            <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Your Turn!
            </div>
          )}
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{circle.name}</CardTitle>
                <CardDescription>{circle.description}</CardDescription>
              </div>
              <Badge className={getStatusColor(circle.status)}>
                {circle.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Coins className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">Contribution:</span>
                <span className="font-medium">${circle.contributionAmount}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-muted-foreground">Members:</span>
                <span className="font-medium">{circle.currentMembers}/{circle.maxMembers}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-purple-500" />
                <span className="text-muted-foreground">Progress:</span>
                <span className="font-medium">{circle.currentMonth}/{circle.durationMonths} months</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Total Pot:</span>
                <span className="font-medium ml-2">${circle.totalPot.toLocaleString()}</span>
              </div>
            </div>

            {circle.status === 'active' && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {circle.nextContribution && (
                      <>Next contribution: {circle.nextContribution}</>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {circle.myTurn && (
                      <Button size="sm">
                        Claim Distribution
                      </Button>
                    )}
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/circles/${circle.id}`}>
                        View Details <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {circle.status === 'completed' && (
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-green-600 font-medium">
                    ✅ Circle completed successfully
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/circles/${circle.id}`}>
                      View History <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {circles.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">You're not part of any circles yet</p>
            <Button asChild>
              <Link href="/circles">
                Browse Circles <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}