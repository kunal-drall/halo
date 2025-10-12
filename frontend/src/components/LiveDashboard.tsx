'use client'

import React, { useEffect, useState } from 'react'
import { usePrivy } from '@privy-io/react-auth'
import { Connection, PublicKey } from '@solana/web3.js'
import { motion } from 'framer-motion'

interface Member {
  name: string
  address: string
  trustScore: number
  tier: string
  contributions: number
  receivedPayout: boolean
}

interface CircleData {
  id: string
  currentMonth: number
  totalMembers: number
  contributionAmount: number
  escrowBalance: number
  status: string
  yieldEarned: number
}

interface GovernanceProposal {
  id: string
  title: string
  votesFor: number
  votesAgainst: number
  status: string
  endsAt: Date
}

export default function LiveDashboard() {
  const { ready, authenticated, login, user } = usePrivy()
  const [circleData, setCircleData] = useState<CircleData | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [proposals, setProposals] = useState<GovernanceProposal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (ready && authenticated) {
      loadDashboardData()
      const interval = setInterval(loadDashboardData, 10000) // Update every 10 seconds
      return () => clearInterval(interval)
    }
  }, [ready, authenticated])

  const loadDashboardData = async () => {
    try {
      // In production, fetch from Solana blockchain
      // For demo, use mock data
      setCircleData({
        id: 'Fg6PaFpo...FsLnS',
        currentMonth: 2,
        totalMembers: 5,
        contributionAmount: 10,
        escrowBalance: 150.43,
        status: 'Active',
        yieldEarned: 2.43,
      })

      setMembers([
        { name: 'Alice', address: '7xKX...9zWy', trustScore: 825, tier: 'Platinum', contributions: 20, receivedPayout: true },
        { name: 'Bob', address: '3mNP...4kLt', trustScore: 745, tier: 'Gold', contributions: 20, receivedPayout: true },
        { name: 'Charlie', address: '9pQR...2vMn', trustScore: 680, tier: 'Gold', contributions: 20, receivedPayout: false },
        { name: 'Diana', address: '5wTY...8xBn', trustScore: 590, tier: 'Silver', contributions: 20, receivedPayout: false },
        { name: 'Eve', address: '2kLM...6rPq', trustScore: 520, tier: 'Silver', contributions: 20, receivedPayout: false },
      ])

      setProposals([
        {
          id: '1',
          title: 'Reduce Penalty Rate to 5%',
          votesFor: 9000,
          votesAgainst: 2000,
          status: 'Passed',
          endsAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
        {
          id: '2',
          title: 'Extend Circle Duration by 2 Months',
          votesFor: 6000,
          votesAgainst: 5000,
          status: 'Active',
          endsAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
        },
      ])

      setLoading(false)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      setLoading(false)
    }
  }

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading Halo Protocol...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="text-center p-8">
          <h1 className="text-4xl font-bold text-white mb-4">🌟 Halo Protocol Dashboard</h1>
          <p className="text-gray-300 mb-8">Connect your wallet to view live circle data</p>
          <button
            onClick={login}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading circle data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Live Circle Dashboard</h1>
            <p className="text-gray-400">Tracking 5-member circle on Solana Devnet</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Connected as</div>
            <div className="text-white font-mono">{user?.wallet?.address?.slice(0, 8)}...</div>
          </div>
        </div>

        {/* Circle Overview */}
        {circleData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800 rounded-lg p-6 border border-purple-500/20"
            >
              <div className="text-gray-400 text-sm mb-2">Current Month</div>
              <div className="text-3xl font-bold text-white">{circleData.currentMonth}/5</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 rounded-lg p-6 border border-green-500/20"
            >
              <div className="text-gray-400 text-sm mb-2">Escrow Balance</div>
              <div className="text-3xl font-bold text-green-400">{circleData.escrowBalance} USDC</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800 rounded-lg p-6 border border-blue-500/20"
            >
              <div className="text-gray-400 text-sm mb-2">Solend Yield</div>
              <div className="text-3xl font-bold text-blue-400">+{circleData.yieldEarned} USDC</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800 rounded-lg p-6 border border-yellow-500/20"
            >
              <div className="text-gray-400 text-sm mb-2">Status</div>
              <div className="text-3xl font-bold text-yellow-400">{circleData.status}</div>
            </motion.div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trust Scores */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gray-800 rounded-lg p-6 border border-purple-500/20"
          >
            <h2 className="text-2xl font-bold text-white mb-4">🏆 Live Trust Scores</h2>
            <div className="space-y-3">
              {members.map((member, index) => (
                <div key={member.address} className="bg-gray-700/50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-white font-bold">{member.name}</div>
                      <div className="text-gray-400 text-sm font-mono">{member.address}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-400">{member.trustScore}</div>
                      <div className={`text-sm ${getTierColor(member.tier)}`}>{member.tier}</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(member.trustScore / 1000) * 100}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 flex justify-between text-sm">
                    <span className="text-gray-400">Contributions: {member.contributions} USDC</span>
                    <span className={member.receivedPayout ? 'text-green-400' : 'text-yellow-400'}>
                      {member.receivedPayout ? '✅ Received' : '⏳ Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Governance & Payouts */}
          <div className="space-y-6">
            {/* Governance Voting */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-800 rounded-lg p-6 border border-blue-500/20"
            >
              <h2 className="text-2xl font-bold text-white mb-4">🗳️ Governance Proposals</h2>
              <div className="space-y-3">
                {proposals.map((proposal) => (
                  <div key={proposal.id} className="bg-gray-700/50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="text-white font-bold mb-1">{proposal.title}</div>
                        <div className="text-gray-400 text-sm">
                          {proposal.status === 'Active' 
                            ? `Ends in ${Math.round((proposal.endsAt.getTime() - Date.now()) / (1000 * 60 * 60))}h`
                            : 'Voting ended'}
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                        proposal.status === 'Passed' ? 'bg-green-500/20 text-green-400' :
                        proposal.status === 'Active' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {proposal.status}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-400">For: {proposal.votesFor.toLocaleString()}</span>
                        <span className="text-red-400">Against: {proposal.votesAgainst.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                          style={{ width: `${(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Payout Progress */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800 rounded-lg p-6 border border-green-500/20"
            >
              <h2 className="text-2xl font-bold text-white mb-4">💸 Payout Progress</h2>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Month 2 Distribution</span>
                  <span>2/5 Members</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: '40%' }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">✅ Month 1: Alice</span>
                  <span className="text-green-400 font-mono">50 USDC</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">✅ Month 2: Bob</span>
                  <span className="text-green-400 font-mono">50.43 USDC</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">⏳ Month 3: Charlie</span>
                  <span className="text-gray-500 font-mono">Pending</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">⏳ Month 4: Diana</span>
                  <span className="text-gray-500 font-mono">Pending</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">⏳ Month 5: Eve</span>
                  <span className="text-gray-500 font-mono">Pending</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Next Payout (Switchboard)</span>
                  <span className="text-yellow-400 font-bold">In 18 days</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Solend Integration Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 bg-gray-800 rounded-lg p-6 border border-blue-500/20"
        >
          <h2 className="text-2xl font-bold text-white mb-4">💰 Solend Yield Generation</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <div className="text-gray-400 text-sm mb-1">Current APY</div>
              <div className="text-2xl font-bold text-blue-400">5.2%</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">Total Deposited</div>
              <div className="text-2xl font-bold text-green-400">148 USDC</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">Yield Earned</div>
              <div className="text-2xl font-bold text-purple-400">+2.43 USDC</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-1">Time in Pool</div>
              <div className="text-2xl font-bold text-yellow-400">45 days</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function getTierColor(tier: string): string {
  switch (tier) {
    case 'Platinum':
      return 'text-purple-400'
    case 'Gold':
      return 'text-yellow-400'
    case 'Silver':
      return 'text-gray-300'
    case 'Bronze':
      return 'text-orange-400'
    default:
      return 'text-gray-400'
  }
}
