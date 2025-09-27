'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NetworkSwitch } from '@/components/NetworkSwitch'
import { motion } from 'framer-motion'
import { 
  Users, 
  Coins, 
  TrendingUp, 
  Vote, 
  Shield, 
  CircleDollarSign,
  ArrowRight,
  Star,
  Activity,
  Sparkles,
  Heart,
  Zap,
  Target,
  Globe,
  Plus,
  User,
  Mail,
  Chrome,
  Apple,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'

// Temporary placeholder for Privy auth - will be replaced when Privy is properly configured
const useAuth = () => ({
  authenticated: false,
  login: () => alert('Privy login will be configured'),
  logout: () => {},
  user: null
})

const AuthConnection = () => {
  const { authenticated, login } = useAuth()

  if (authenticated) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full max-w-md glass-effect border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-gradient-primary">Connected</CardTitle>
          </CardHeader>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-full max-w-md border-primary/20 hover:border-primary/40 transition-colors">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-primary/10 to-secondary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-gradient-primary">Join Halo Protocol</CardTitle>
          <CardDescription>
            Sign up instantly with your preferred method - we'll create your wallet automatically
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={login}
              className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white font-medium py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <User className="h-4 w-4 mr-2" />
              Get Started Now
            </Button>
          </motion.div>
          
          <div className="text-center text-xs text-muted-foreground space-y-2">
            <p>✨ No wallet installation required</p>
            <div className="flex justify-center gap-4">
              <Badge variant="outline" className="text-xs">
                <Chrome className="h-3 w-3 mr-1" />
                Google
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Mail className="h-3 w-3 mr-1" />
                Email
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Apple className="h-3 w-3 mr-1" />
                Apple
              </Badge>
              <Badge variant="outline" className="text-xs">
                <MessageSquare className="h-3 w-3 mr-1" />
                Telegram
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const AuthButton = () => {
  const { authenticated, login, logout } = useAuth()

  if (authenticated) {
    return (
      <Button 
        variant="outline" 
        onClick={logout}
        className="bg-white/10 border-white/20 text-primary hover:bg-white/20"
      >
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

export default function HomePage() {
  const { authenticated } = useAuth()

  const features = [
    {
      icon: Users,
      title: 'Community Circles',
      description: 'Join rotating savings circles with trusted members and shared goals',
      color: 'text-primary',
      gradient: 'from-primary/10 to-primary/5'
    },
    {
      icon: TrendingUp,
      title: 'DeFi Yields',
      description: 'Earn passive income on pooled funds through integrated lending protocols',
      color: 'text-secondary',
      gradient: 'from-secondary/10 to-secondary/5'
    },
    {
      icon: Shield,
      title: 'Trust Scoring',
      description: 'Build your reputation and unlock better rates with social proofs',
      color: 'text-accent',
      gradient: 'from-accent/10 to-accent/5'
    },
    {
      icon: Vote,
      title: 'Governance Power',
      description: 'Shape the protocol through community voting and proposals',
      color: 'text-purple-600',
      gradient: 'from-purple-100 to-purple-50'
    }
  ]

  const stats = [
    { label: 'Active Circles', value: '1,247', icon: CircleDollarSign, change: '+18%' },
    { label: 'Total Value Locked', value: '$12.4M', icon: Coins, change: '+34%' },
    { label: 'Average APY', value: '8.2%', icon: TrendingUp, change: '+2.1%' },
    { label: 'Happy Members', value: '8,534', icon: Users, change: '+27%' }
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
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
              <CircleDollarSign className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-gradient-primary">
              Halo Protocol
            </span>
            <Badge variant="outline" className="text-xs border-primary/20">
              {process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet-beta' ? 'Mainnet' : 'Devnet'}
            </Badge>
          </motion.div>
          
          <div className="flex items-center gap-4">
            <NetworkSwitch />
            {authenticated && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" asChild>
                  <Link href="/dashboard">
                    Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            )}
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div 
          className="text-center max-w-6xl mx-auto mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <Badge className="mb-4 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-primary/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Finance Powered by Community & Solana
            </Badge>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-7xl font-display font-bold mb-6 text-gradient-primary leading-tight"
          >
            Save Together,
            <br />
            <span className="text-gradient-accent">Grow Together</span>
          </motion.h1>
          
          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
          >
            Join trusted savings circles, earn yield on your contributions, and build your financial reputation in the most innovative DeFi ecosystem.
          </motion.p>
          
          {!authenticated ? (
            <motion.div 
              variants={itemVariants}
              className="flex justify-center mb-8"
            >
              <AuthConnection />
            </motion.div>
          ) : (
            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" className="bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl" asChild>
                  <Link href="/circles/create">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Circle
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline" className="px-8 py-4 text-lg font-semibold rounded-xl border-2 border-primary/20 hover:border-primary/40" asChild>
                  <Link href="/circles">
                    <Users className="h-5 w-5 mr-2" />
                    Browse Circles
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div key={index} variants={itemVariants}>
                <Card className="text-center hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-3">
                      <div className="p-3 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold mb-1 text-gradient-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground mb-1">{stat.label}</div>
                    <Badge variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {stat.change}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Features Section */}
        <motion.div 
          className="mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-gradient-primary">
              Why Choose Halo Protocol?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the future of community-driven finance with built-in yield generation and trust-based lending.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div key={index} variants={itemVariants}>
                  <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full bg-gradient-to-br from-white to-gray-50/50 hover:scale-105 hover:-translate-y-1">
                    <CardHeader className="text-center pb-4">
                      <div className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${feature.gradient}`}>
                        <Icon className={`h-8 w-8 ${feature.color}`} />
                      </div>
                      <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 text-center">
                      <CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Social Proof Section */}
        <motion.div 
          className="mb-16 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="flex justify-center items-center gap-8 flex-wrap">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Heart className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium">Trusted by 8,500+ users</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">$12M+ secured</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">Zero defaults</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium">Global community</span>
            </div>
          </motion.div>
        </motion.div>

        {/* CTA Section */}
        {authenticated && (
          <motion.div 
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            className="gradient-bg rounded-3xl p-8 md:p-12 text-white text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
            <div className="relative z-10">
              <motion.div
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
                className="inline-block mb-4"
              >
                <Target className="h-16 w-16 mx-auto text-white" />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Ready to Start Saving?</h2>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto text-lg">
                Join thousands of users already earning yield and building financial reputation through our trusted savings circles.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100 px-8 py-4 font-semibold rounded-xl" asChild>
                    <Link href="/dashboard">
                      Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 px-8 py-4 font-semibold rounded-xl" asChild>
                    <Link href="/circles">
                      <Sparkles className="h-5 w-5 mr-2" />
                      Explore Circles
                    </Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 bg-white">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 Halo Protocol. Building the future of community finance.</p>
        </div>
      </footer>
    </div>
  )
}