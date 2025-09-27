'use client'

import { useAuth } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrustScoreCard } from '@/components/TrustScoreCard'
import { CirclesList } from '@/components/CirclesList'
import { LendingPositions } from '@/components/LendingPositions'
import { motion } from 'framer-motion'
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
  Wallet,
  User,
  LogOut
} from 'lucide-react'
import Link from 'next/link'

const AuthButton = () => {
  const { authenticated, login, logout } = useAuth()

  if (authenticated) {
    return (
      <Button 
        variant="outline" 
        onClick={logout}
        className="bg-white/10 border-white/20 hover:bg-white/20"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    )
  }

  return (
    <Button 
      onClick={login}
      className="bg-gradient-to-r from-primary to-secondary text-white border-0 hover:shadow-lg hover:scale-105 transition-all duration-200"
    >
      <User className="h-4 w-4 mr-2" />
      Sign In
    </Button>
  )
}

export default function DashboardPage() {
  const { authenticated } = useAuth()

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="w-full max-w-md border-primary/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-primary/10 to-secondary/10">
                <Wallet className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-gradient-primary">Connect Your Account</CardTitle>
              <CardDescription>
                You need to sign in to access the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <AuthButton />
            </CardContent>
          </Card>
        </motion.div>
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary/5">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <CircleDollarSign className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-gradient-primary">
                Halo Protocol
              </span>
            </Link>
            
            <div className="flex items-center gap-4">
              <AuthButton />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div 
          className="mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-display font-bold mb-2 text-gradient-primary">Welcome back! 👋</h1>
            <p className="text-muted-foreground">
              Manage your circles, track contributions, and monitor your DeFi positions.
            </p>
          </motion.div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Circles</p>
                    <p className="text-2xl font-bold text-gradient-primary">{userStats.activeCircles}</p>
                  </div>
                  <div className="p-2 rounded-full bg-gradient-to-r from-primary/10 to-primary/5">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-secondary/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Contributed</p>
                    <p className="text-2xl font-bold text-gradient-primary">${userStats.totalContributions.toLocaleString()}</p>
                  </div>
                  <div className="p-2 rounded-full bg-gradient-to-r from-secondary/10 to-secondary/5">
                    <Coins className="h-6 w-6 text-secondary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-accent/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Yield Earned</p>
                    <p className="text-2xl font-bold text-gradient-accent">${userStats.yieldEarned}</p>
                  </div>
                  <div className="p-2 rounded-full bg-gradient-to-r from-accent/10 to-accent/5">
                    <TrendingUp className="h-6 w-6 text-accent" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-purple-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Trust Score</p>
                    <p className="text-2xl font-bold text-purple-600">{userStats.trustScore}</p>
                  </div>
                  <div className="p-2 rounded-full bg-gradient-to-r from-purple-100 to-purple-50">
                    <Shield className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

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
                <motion.div 
                  className="flex justify-between items-center"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <h2 className="text-xl font-semibold">Your Circles</h2>
                  <Button asChild className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg">
                    <Link href="/circles/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Circle
                    </Link>
                  </Button>
                </motion.div>
                <CirclesList />
              </TabsContent>

              <TabsContent value="lending" className="space-y-4">
                <motion.div 
                  className="flex justify-between items-center"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <h2 className="text-xl font-semibold">Lending Positions</h2>
                  <Button variant="outline" asChild>
                    <Link href="/lending">
                      View All <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </motion.div>
                <LendingPositions />
              </TabsContent>

              <TabsContent value="governance" className="space-y-4">
                <motion.div 
                  className="flex justify-between items-center"
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <h2 className="text-xl font-semibold">Active Proposals</h2>
                  <Button variant="outline" asChild>
                    <Link href="/governance">
                      View All <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </motion.div>
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