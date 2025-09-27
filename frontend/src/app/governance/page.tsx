'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
const AuthButton = () => {
  const { login } = useAuth()
  
  return (
    <Button 
      onClick={login}
      className="bg-gradient-to-r from-primary to-secondary text-white border-0"
    >
      Sign In
    </Button>
  )
}
import { 
  Vote,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Wallet,
  TrendingUp,
  Settings,
  DollarSign,
  Shield,
  Calendar,
  ArrowUp,
  ArrowDown,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

export default function GovernancePage() {
  const { authenticated } = useAuth()
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null)

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
              You need to connect your wallet to participate in governance
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <AuthButton />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Mock data for demonstration
  const proposals = [
    {
      id: 'prop-001',
      title: 'Reduce Minimum Trust Score Requirement',
      description: 'Lower the minimum trust score requirement for joining circles from 400 to 300 points to increase accessibility for new users.',
      type: 'parameter' as const,
      status: 'active' as const,
      votesFor: 1247,
      votesAgainst: 453,
      quorum: 1000,
      totalVotes: 1700,
      startTime: new Date('2024-01-20'),
      endTime: new Date('2024-01-27'),
      creator: 'GovCouncil',
      proposalPower: 15.2,
      userVoted: false,
      category: 'Trust System'
    },
    {
      id: 'prop-002',
      title: 'Integrate Additional Lending Protocol',
      description: 'Add Mango Markets as an alternative lending protocol option alongside Solend to diversify yield sources and reduce protocol risk.',
      type: 'upgrade' as const,
      status: 'active' as const,
      votesFor: 892,
      votesAgainst: 234,
      quorum: 800,
      totalVotes: 1126,
      startTime: new Date('2024-01-22'),
      endTime: new Date('2024-01-29'),
      creator: 'TechTeam',
      proposalPower: 12.8,
      userVoted: true,
      userVoteSupport: true,
      category: 'Protocol Integration'
    },
    {
      id: 'prop-003',
      title: 'Community Treasury Allocation',
      description: 'Allocate 500,000 USDC from the community treasury for bug bounties and security audits to enhance protocol safety.',
      type: 'treasury' as const,
      status: 'succeeded' as const,
      votesFor: 2341,
      votesAgainst: 156,
      quorum: 1200,
      totalVotes: 2497,
      startTime: new Date('2024-01-15'),
      endTime: new Date('2024-01-22'),
      creator: 'SecurityCouncil',
      proposalPower: 28.5,
      userVoted: true,
      userVoteSupport: true,
      category: 'Treasury'
    },
    {
      id: 'prop-004',
      title: 'Increase Default Circle Duration',
      description: 'Change the default maximum circle duration from 12 months to 18 months to allow for longer-term savings goals.',
      type: 'parameter' as const,
      status: 'defeated' as const,
      votesFor: 234,
      votesAgainst: 1453,
      quorum: 800,
      totalVotes: 1687,
      startTime: new Date('2024-01-10'),
      endTime: new Date('2024-01-17'),
      creator: 'CommunityMember',
      proposalPower: 19.2,
      userVoted: true,
      userVoteSupport: false,
      category: 'Circle Parameters'
    }
  ]

  const userStats = {
    votingPower: 127.5,
    totalVotes: 12,
    proposalsCreated: 2,
    delegatedVotes: 0
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'succeeded': return 'bg-green-100 text-green-800'
      case 'defeated': return 'bg-red-100 text-red-800'
      case 'queued': return 'bg-yellow-100 text-yellow-800'
      case 'executed': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return Clock
      case 'succeeded': return CheckCircle
      case 'defeated': return XCircle
      case 'queued': return Clock
      case 'executed': return CheckCircle
      default: return Clock
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'parameter': return 'bg-blue-100 text-blue-800'
      case 'upgrade': return 'bg-purple-100 text-purple-800'
      case 'treasury': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleVote = (proposalId: string, support: boolean) => {
    console.log(`Voting ${support ? 'FOR' : 'AGAINST'} proposal ${proposalId}`)
    // Here would be the actual blockchain voting transaction
    alert(`Vote ${support ? 'FOR' : 'AGAINST'} proposal ${proposalId} - Transaction would be submitted`)
  }

  const calculateTimeRemaining = (endTime: Date) => {
    const now = new Date()
    const diff = endTime.getTime() - now.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h remaining`
    if (hours > 0) return `${hours}h remaining`
    return 'Voting ended'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                <Vote className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Governance
              </span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" asChild>
                <Link href="/dashboard">Back to Dashboard</Link>
              </Button>
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Protocol Governance</h1>
            <p className="text-muted-foreground">
              Participate in shaping the future of Halo Protocol through decentralized governance.
            </p>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <Vote className="h-6 w-6 text-indigo-500 mx-auto mb-2" />
                <div className="text-xl font-bold">{userStats.votingPower}</div>
                <div className="text-xs text-muted-foreground">Voting Power</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <div className="text-xl font-bold">{userStats.totalVotes}</div>
                <div className="text-xs text-muted-foreground">Votes Cast</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Settings className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <div className="text-xl font-bold">{userStats.proposalsCreated}</div>
                <div className="text-xs text-muted-foreground">Proposals Created</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                <div className="text-xl font-bold">{userStats.delegatedVotes}</div>
                <div className="text-xs text-muted-foreground">Delegated Votes</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="active" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="active">Active Proposals</TabsTrigger>
              <TabsTrigger value="all">All Proposals</TabsTrigger>
              <TabsTrigger value="my-votes">My Votes</TabsTrigger>
              <TabsTrigger value="create">Create Proposal</TabsTrigger>
            </TabsList>

            {/* Active Proposals */}
            <TabsContent value="active" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Active Proposals</h2>
                <Badge variant="outline">
                  {proposals.filter(p => p.status === 'active').length} Active
                </Badge>
              </div>
              
              <div className="space-y-4">
                {proposals.filter(p => p.status === 'active').map((proposal) => {
                  const StatusIcon = getStatusIcon(proposal.status)
                  const quorumReached = proposal.totalVotes >= proposal.quorum
                  const votingProgress = (proposal.totalVotes / proposal.quorum) * 100
                  const supportPercentage = (proposal.votesFor / proposal.totalVotes) * 100
                  
                  return (
                    <Card key={proposal.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <CardTitle className="text-lg">{proposal.title}</CardTitle>
                              <Badge className={getStatusColor(proposal.status)}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {proposal.status}
                              </Badge>
                              <Badge className={getTypeColor(proposal.type)} variant="outline">
                                {proposal.type}
                              </Badge>
                            </div>
                            <CardDescription className="mb-3">
                              {proposal.description}
                            </CardDescription>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>By {proposal.creator}</span>
                              <span>•</span>
                              <span>{proposal.category}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {calculateTimeRemaining(proposal.endTime)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Voting Progress */}
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Voting Progress</span>
                            <span className="font-medium">
                              {proposal.totalVotes.toLocaleString()} / {proposal.quorum.toLocaleString()} votes
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                quorumReached ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${Math.min(votingProgress, 100)}%` }}
                            />
                          </div>
                          {quorumReached && (
                            <p className="text-xs text-green-600 font-medium">✓ Quorum reached</p>
                          )}
                        </div>

                        {/* Vote Distribution */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-green-600">For</span>
                              <span className="text-sm">{supportPercentage.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${supportPercentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {proposal.votesFor.toLocaleString()} votes
                            </span>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-red-600">Against</span>
                              <span className="text-sm">{(100 - supportPercentage).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-red-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${100 - supportPercentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {proposal.votesAgainst.toLocaleString()} votes
                            </span>
                          </div>
                        </div>

                        {/* Voting Buttons */}
                        <div className="flex gap-3 pt-4 border-t">
                          {proposal.userVoted ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="h-4 w-4" />
                              You voted {proposal.userVoteSupport ? 'FOR' : 'AGAINST'} this proposal
                            </div>
                          ) : (
                            <>
                              <Button 
                                className="flex-1" 
                                onClick={() => handleVote(proposal.id, true)}
                                disabled={proposal.status !== 'active'}
                              >
                                <ArrowUp className="h-4 w-4 mr-2" />
                                Vote For
                              </Button>
                              <Button 
                                variant="outline" 
                                className="flex-1"
                                onClick={() => handleVote(proposal.id, false)}
                                disabled={proposal.status !== 'active'}
                              >
                                <ArrowDown className="h-4 w-4 mr-2" />
                                Vote Against
                              </Button>
                            </>
                          )}
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            {/* All Proposals */}
            <TabsContent value="all" className="space-y-4">
              <div className="space-y-4">
                {proposals.map((proposal) => {
                  const StatusIcon = getStatusIcon(proposal.status)
                  const supportPercentage = (proposal.votesFor / proposal.totalVotes) * 100
                  
                  return (
                    <Card key={proposal.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">{proposal.title}</h3>
                              <Badge className={getStatusColor(proposal.status)}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {proposal.status}
                              </Badge>
                              <Badge className={getTypeColor(proposal.type)} variant="outline">
                                {proposal.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {proposal.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>{proposal.totalVotes.toLocaleString()} votes</span>
                              <span>•</span>
                              <span>{supportPercentage.toFixed(1)}% support</span>
                              <span>•</span>
                              <span>{proposal.endTime.toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            {/* My Votes */}
            <TabsContent value="my-votes" className="space-y-4">
              <div className="space-y-4">
                {proposals.filter(p => p.userVoted).map((proposal) => (
                  <Card key={proposal.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{proposal.title}</h3>
                          <div className="flex items-center gap-2 text-sm">
                            <Badge className={proposal.userVoteSupport ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              Voted {proposal.userVoteSupport ? 'FOR' : 'AGAINST'}
                            </Badge>
                            <Badge className={getStatusColor(proposal.status)} variant="outline">
                              {proposal.status}
                            </Badge>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">{proposal.endTime.toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Create Proposal */}
            <TabsContent value="create" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Create New Proposal</CardTitle>
                  <CardDescription>
                    Submit a proposal for community voting. Requires minimum voting power of 100.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Proposal Title</label>
                    <input
                      type="text"
                      placeholder="Brief, descriptive title for your proposal"
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Proposal Type</label>
                    <select className="w-full px-3 py-2 border border-input rounded-md bg-background">
                      <option value="parameter">Parameter Change</option>
                      <option value="upgrade">Protocol Upgrade</option>
                      <option value="treasury">Treasury Allocation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      placeholder="Detailed explanation of your proposal, including rationale and expected impact..."
                      rows={6}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                    />
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex gap-2">
                      <Settings className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-900 mb-1">Proposal Requirements</p>
                        <ul className="text-xs text-amber-800 space-y-1">
                          <li>• Minimum 100 voting power required to submit</li>
                          <li>• 0.1 SOL deposit required (refunded if proposal passes)</li>
                          <li>• Voting period: 7 days</li>
                          <li>• Quorum requirement: varies by proposal type</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button className="flex-1" disabled={userStats.votingPower < 100}>
                      Submit Proposal
                    </Button>
                    <Button variant="outline">
                      Save Draft
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}