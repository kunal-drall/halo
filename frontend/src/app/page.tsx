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
  MessageSquare,
  CheckCircle,
  DollarSign,
  Calendar,
  BarChart3,
  Lock,
  Smartphone,
  Github,
  Twitter,
  FileText,
  ExternalLink,
  ArrowUp,
  Clock,
  Wallet,
  PiggyBank,
  Repeat,
  Award,
  Building,
  Layers
} from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import Lottie from 'lottie-react'

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

// Simple animated circle as placeholder for Lottie animation
const AnimatedCircleTokens = () => (
  <div className="relative w-64 h-64 mx-auto">
    <motion.div
      animate={{
        rotate: 360
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }}
      className="relative w-full h-full"
    >
      {/* Main circle */}
      <div className="absolute inset-0 rounded-full border-4 border-gradient-primary bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-sm" />
      
      {/* Rotating tokens */}
      {[0, 60, 120, 180, 240, 300].map((angle, index) => (
        <motion.div
          key={index}
          className="absolute w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg"
          style={{
            left: `${50 + 40 * Math.cos((angle * Math.PI) / 180)}%`,
            top: `${50 + 40 * Math.sin((angle * Math.PI) / 180)}%`,
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: -360
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: index * 0.5,
            ease: "easeInOut"
          }}
        >
          <DollarSign className="w-4 h-4 text-white" />
        </motion.div>
      ))}
      
      {/* Center logo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-2xl">
          <CircleDollarSign className="w-8 h-8 text-white" />
        </div>
      </div>
    </motion.div>
  </div>
)

export default function HomePage() {
  const { authenticated } = useAuth()

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

  const scrollVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-primary">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
              <CircleDollarSign className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-white">
              Halo Protocol
            </span>
            <Badge variant="outline" className="text-xs border-secondary/30 text-secondary bg-secondary/10">
              {process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet-beta' ? 'Mainnet' : 'Devnet'}
            </Badge>
          </motion.div>
          
          <div className="flex items-center gap-4">
            <NetworkSwitch />
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="relative">
        {/* 1. Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 to-primary/20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.3),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(244,114,182,0.2),transparent_50%)]" />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div 
              className="text-center max-w-6xl mx-auto"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Animated Token Circle */}
              <motion.div variants={itemVariants} className="mb-8">
                <AnimatedCircleTokens />
              </motion.div>

              <motion.div variants={itemVariants} className="mb-6">
                <Badge className="mb-6 bg-gradient-to-r from-primary/20 to-secondary/20 text-white border-secondary/30 text-lg px-4 py-2">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Finance Powered by Community & Solana
                </Badge>
              </motion.div>
              
              <motion.h1 
                variants={itemVariants}
                className="text-5xl md:text-8xl font-display font-bold mb-8 text-white leading-tight"
              >
                Halo digitizes traditional savings circles
                <br />
                <span className="bg-gradient-to-r from-secondary via-accent to-primary bg-clip-text text-transparent">
                  with trust scoring, instant payouts, and DeFi yields
                </span>
              </motion.h1>
              
              <motion.p 
                variants={itemVariants}
                className="text-xl md:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed"
              >
                Save • Borrow • Grow Together
              </motion.p>
              
              {/* CTAs */}
              <motion.div 
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-6 justify-center"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="bg-gradient-to-r from-primary to-secondary text-white px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all" asChild>
                    <Link href={authenticated ? "/dashboard" : "#"} onClick={!authenticated ? () => useAuth().login() : undefined}>
                      <Zap className="h-6 w-6 mr-3" />
                      Launch App
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="outline" className="px-12 py-6 text-xl font-bold rounded-2xl border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                    Learn More
                    <ArrowRight className="h-6 w-6 ml-3" />
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* 2. Problem & Solution Section */}
        <section className="py-20 bg-slate-800/50 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <motion.div 
              className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={containerVariants}
            >
              {/* Problem Card */}
              <motion.div variants={scrollVariants}>
                <Card className="border-red-500/20 bg-red-500/5 backdrop-blur-sm h-full">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                      <PiggyBank className="w-8 h-8 text-red-400" />
                    </div>
                    <CardTitle className="text-2xl text-white">Traditional ROSCAs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 text-red-300">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <span>Manual tracking and management</span>
                    </div>
                    <div className="flex items-center gap-3 text-red-300">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <span>Risk of defaults and fraud</span>
                    </div>
                    <div className="flex items-center gap-3 text-red-300">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <span>Limited to local communities</span>
                    </div>
                    <div className="flex items-center gap-3 text-red-300">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <span>No yield on pooled funds</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Solution Card */}
              <motion.div variants={scrollVariants}>
                <Card className="border-green-500/20 bg-green-500/5 backdrop-blur-sm h-full">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Layers className="w-8 h-8 text-green-400" />
                    </div>
                    <CardTitle className="text-2xl text-white">Halo Protocol</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 text-green-300">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>Global, automated, trustless</span>
                    </div>
                    <div className="flex items-center gap-3 text-green-300">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>On-chain trust scoring system</span>
                    </div>
                    <div className="flex items-center gap-3 text-green-300">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>Accessible to anyone globally</span>
                    </div>
                    <div className="flex items-center gap-3 text-green-300">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span>Yield-bearing through DeFi integration</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* 3. How It Works Section */}
        <section id="how-it-works" className="py-20 bg-gradient-to-r from-slate-900 to-slate-800">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={containerVariants}
              className="max-w-6xl mx-auto"
            >
              <motion.div variants={itemVariants} className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-white">
                  How It Works
                </h2>
                <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                  Three simple steps to start saving and earning with your community
                </p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    step: "01",
                    title: "Create a Circle",
                    description: "Set contribution amount, duration, and invite trusted members to join your savings circle.",
                    icon: Users,
                    color: "from-primary to-primary/80"
                  },
                  {
                    step: "02", 
                    title: "Contribute & Earn",
                    description: "Make monthly deposits while your pooled funds automatically earn yield through DeFi protocols.",
                    icon: Coins,
                    color: "from-secondary to-secondary/80"
                  },
                  {
                    step: "03",
                    title: "Receive & Repay",
                    description: "Members receive payouts in rotation while trust scores update based on contribution history.",
                    icon: Award,
                    color: "from-accent to-accent/80"
                  }
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    variants={scrollVariants}
                    whileHover={{ y: -10, scale: 1.02 }}
                    className="relative"
                  >
                    <Card className="border-white/10 bg-white/5 backdrop-blur-sm h-full hover:bg-white/10 transition-all duration-300">
                      <CardHeader className="text-center relative">
                        {/* Step Number */}
                        <div className="absolute -top-4 left-4">
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                            {step.step}
                          </div>
                        </div>
                        
                        {/* Icon */}
                        <div className={`w-20 h-20 mx-auto mb-6 mt-4 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center shadow-xl`}>
                          <step.icon className="w-10 h-10 text-white" />
                        </div>
                        
                        <CardTitle className="text-2xl text-white mb-4">{step.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        <CardDescription className="text-slate-300 text-lg leading-relaxed">
                          {step.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* 4. Key Features */}
        <section className="py-20 bg-slate-800/30">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={containerVariants}
              className="max-w-7xl mx-auto"
            >
              <motion.div variants={itemVariants} className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-white">
                  Revolutionary Features
                </h2>
                <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                  Experience the next generation of community finance with cutting-edge blockchain technology
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    icon: Zap,
                    title: "Instant Payouts",
                    description: "Sub-second finality on Solana ensures immediate access to your funds when it's your turn.",
                    color: "text-yellow-400",
                    gradient: "from-yellow-500/20 to-yellow-500/5",
                    glow: "shadow-yellow-500/25"
                  },
                  {
                    icon: Shield,
                    title: "Trust Scoring",
                    description: "Build your on-chain reputation through verified social proofs and contribution history.",
                    color: "text-green-400", 
                    gradient: "from-green-500/20 to-green-500/5",
                    glow: "shadow-green-500/25"
                  },
                  {
                    icon: TrendingUp,
                    title: "DeFi Yields",
                    description: "Earn passive income on pooled funds through integrated Solend lending protocols.",
                    color: "text-blue-400",
                    gradient: "from-blue-500/20 to-blue-500/5", 
                    glow: "shadow-blue-500/25"
                  },
                  {
                    icon: Vote,
                    title: "Governance",
                    description: "Vote on interest rates, terms, and protocol improvements with your community.",
                    color: "text-purple-400",
                    gradient: "from-purple-500/20 to-purple-500/5",
                    glow: "shadow-purple-500/25"
                  },
                  {
                    icon: Globe,
                    title: "Global Access", 
                    description: "Anyone, anywhere can join using USDC stablecoin - no geographic restrictions.",
                    color: "text-cyan-400",
                    gradient: "from-cyan-500/20 to-cyan-500/5",
                    glow: "shadow-cyan-500/25"
                  },
                  {
                    icon: Smartphone,
                    title: "Mobile First",
                    description: "Beautiful, responsive design optimized for mobile devices and modern browsers.",
                    color: "text-pink-400",
                    gradient: "from-pink-500/20 to-pink-500/5",
                    glow: "shadow-pink-500/25"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    variants={scrollVariants}
                    whileHover={{ 
                      scale: 1.05,
                      y: -5
                    }}
                    className="group cursor-pointer"
                  >
                    <Card className={`border-white/10 bg-gradient-to-br ${feature.gradient} backdrop-blur-sm h-full hover:shadow-2xl ${feature.glow} transition-all duration-300 group-hover:border-white/30`}>
                      <CardHeader className="text-center pb-4">
                        <motion.div 
                          className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r ${feature.gradient} border border-white/10`}
                          whileHover={{ 
                            rotate: [0, -10, 10, 0],
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ duration: 0.5 }}
                        >
                          <feature.icon className={`h-8 w-8 ${feature.color}`} />
                        </motion.div>
                        <CardTitle className="text-xl font-semibold text-white group-hover:text-white transition-colors">
                          {feature.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0 text-center">
                        <CardDescription className="text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors">
                          {feature.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* 5. Social Proof / Market Fit */}
        <section className="py-20 bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={containerVariants}
              className="max-w-6xl mx-auto text-center"
            >
              <motion.div variants={itemVariants} className="mb-12">
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-white">
                  Massive Global Opportunity
                </h2>
                <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                  Joining the revolution to democratize access to community-driven financial services
                </p>
              </motion.div>

              {/* Stats Grid */}
              <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-8 mb-12">
                {[
                  {
                    value: "$300B+",
                    label: "Global ROSCA Market",
                    description: "Traditional rotating savings worldwide",
                    icon: DollarSign
                  },
                  {
                    value: "65,000+",
                    label: "TPS on Solana",
                    description: "Lightning-fast transaction processing",
                    icon: Zap
                  },
                  {
                    value: "1.4B",
                    label: "Underbanked People",
                    description: "Potential users worldwide seeking financial inclusion", 
                    icon: Users
                  }
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    variants={scrollVariants}
                    whileHover={{ scale: 1.05 }}
                    className="group"
                  >
                    <Card className="border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all duration-300 group-hover:border-white/40">
                      <CardContent className="p-8 text-center">
                        <motion.div
                          className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.8 }}
                        >
                          <stat.icon className="w-8 h-8 text-white" />
                        </motion.div>
                        <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                          {stat.value}
                        </div>
                        <div className="text-xl text-white font-semibold mb-2">{stat.label}</div>
                        <div className="text-slate-300 text-sm leading-relaxed">{stat.description}</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* Testimonial Placeholder */}
              <motion.div variants={itemVariants}>
                <Card className="border-white/20 bg-white/5 backdrop-blur-md max-w-2xl mx-auto">
                  <CardContent className="p-8 text-center">
                    <div className="flex justify-center mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="w-6 h-6 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-lg text-slate-200 italic mb-4 leading-relaxed">
                      "Halo Protocol has revolutionized how our community saves together. The trust scoring system and instant payouts make it feel completely safe and transparent."
                    </blockquote>
                    <div className="text-white font-semibold">Maria Chen</div>
                    <div className="text-slate-400 text-sm">Early Adopter - Tech Savers Circle</div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* 6. Roadmap Preview */}
        <section className="py-20 bg-slate-900/50">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={containerVariants}
              className="max-w-7xl mx-auto"
            >
              <motion.div variants={itemVariants} className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-display font-bold mb-6 text-white">
                  Development Roadmap
                </h2>
                <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                  Our journey to revolutionize community finance through blockchain innovation
                </p>
              </motion.div>

              {/* Horizontal Timeline */}
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute top-8 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-full" />
                
                <div className="grid md:grid-cols-4 gap-8 relative">
                  {[
                    {
                      phase: "Foundation",
                      title: "Core Infrastructure",
                      items: ["Smart Contracts", "Basic Circle Creation", "Contribution Tracking"],
                      status: "completed",
                      icon: Building
                    },
                    {
                      phase: "Core Features", 
                      title: "Advanced Functionality",
                      items: ["Trust Scoring", "DeFi Integration", "Governance System"],
                      status: "current",
                      icon: Layers
                    },
                    {
                      phase: "Advanced",
                      title: "Enhanced Experience", 
                      items: ["Mobile App", "Advanced Analytics", "Cross-chain Support"],
                      status: "upcoming",
                      icon: Smartphone
                    },
                    {
                      phase: "Ecosystem",
                      title: "Platform Growth",
                      items: ["Partner Integrations", "Institutional Tools", "Global Expansion"],
                      status: "future",
                      icon: Globe
                    }
                  ].map((milestone, index) => (
                    <motion.div
                      key={index}
                      variants={scrollVariants}
                      whileHover={{ y: -10 }}
                      className="relative"
                    >
                      {/* Timeline Dot */}
                      <motion.div 
                        className={`absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full z-10 ${
                          milestone.status === 'completed' ? 'bg-green-500' :
                          milestone.status === 'current' ? 'bg-secondary' :
                          milestone.status === 'upcoming' ? 'bg-yellow-500' :
                          'bg-slate-500'
                        } shadow-lg`}
                        whileHover={{ scale: 1.5 }}
                      >
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          animate={{
                            boxShadow: milestone.status === 'current' ? 
                              ['0 0 0 0 rgba(76, 201, 240, 0.7)', '0 0 0 10px rgba(76, 201, 240, 0)'] :
                              'none'
                          }}
                          transition={{
                            duration: 2,
                            repeat: milestone.status === 'current' ? Infinity : 0
                          }}
                        />
                      </motion.div>

                      <Card className={`mt-8 border-white/10 bg-white/5 backdrop-blur-sm h-full transition-all duration-300 hover:bg-white/10 ${
                        milestone.status === 'completed' ? 'border-green-500/30' :
                        milestone.status === 'current' ? 'border-secondary/50 shadow-lg shadow-secondary/25' :
                        'hover:border-white/30'
                      }`}>
                        <CardHeader className="text-center">
                          <motion.div 
                            className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                              milestone.status === 'completed' ? 'bg-green-500/20' :
                              milestone.status === 'current' ? 'bg-secondary/20' :
                              milestone.status === 'upcoming' ? 'bg-yellow-500/20' :
                              'bg-slate-500/20'
                            }`}
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.8 }}
                          >
                            <milestone.icon className={`w-8 h-8 ${
                              milestone.status === 'completed' ? 'text-green-400' :
                              milestone.status === 'current' ? 'text-secondary' :
                              milestone.status === 'upcoming' ? 'text-yellow-400' :
                              'text-slate-400'
                            }`} />
                          </motion.div>
                          <Badge variant="outline" className={`mb-2 text-xs ${
                            milestone.status === 'completed' ? 'text-green-400 border-green-400/30' :
                            milestone.status === 'current' ? 'text-secondary border-secondary/30' :
                            milestone.status === 'upcoming' ? 'text-yellow-400 border-yellow-400/30' :
                            'text-slate-400 border-slate-400/30'
                          }`}>
                            {milestone.phase}
                          </Badge>
                          <CardTitle className="text-lg text-white">{milestone.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {milestone.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="flex items-center gap-2 text-slate-300 text-sm">
                                {milestone.status === 'completed' ? 
                                  <CheckCircle className="w-4 h-4 text-green-400" /> :
                                  <div className="w-2 h-2 rounded-full bg-slate-400" />
                                }
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* 7. Call-to-Action Banner */}
        <section className="py-20 relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent" />
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 80% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)"
              ]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={containerVariants}
              className="text-center max-w-4xl mx-auto"
            >
              <motion.div
                variants={itemVariants}
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
                className="inline-block mb-8"
              >
                <div className="w-24 h-24 mx-auto rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                  <Target className="h-12 w-12 text-white" />
                </div>
              </motion.div>
              
              <motion.h2 variants={itemVariants} className="text-4xl md:text-6xl font-display font-bold mb-6 text-white">
                Join the Future of Community Finance
              </motion.h2>
              
              <motion.p variants={itemVariants} className="text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
                Start earning yield, building trust, and growing wealth together with thousands of users already transforming how communities save and invest.
              </motion.p>
              
              <motion.div variants={itemVariants}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" className="bg-white text-primary hover:bg-slate-100 px-12 py-6 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all" asChild>
                    <Link href={authenticated ? "/dashboard" : "#"} onClick={!authenticated ? () => useAuth().login() : undefined}>
                      <Sparkles className="h-6 w-6 mr-3" />
                      Get Started
                    </Link>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* 8. Footer */}
      <footer className="bg-slate-900 border-t border-white/10 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                  <CircleDollarSign className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-display font-bold text-white">Halo Protocol</span>
              </div>
              <p className="text-slate-300 mb-6 max-w-md leading-relaxed">
                Revolutionizing community finance through blockchain technology, trust scoring, and DeFi integration.
              </p>
              <div className="flex gap-4">
                <motion.a
                  href="#" 
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Twitter className="w-5 h-5 text-white" />
                </motion.a>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <Github className="w-5 h-5 text-white" />
                </motion.a>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <MessageSquare className="w-5 h-5 text-white" />
                </motion.a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-semibold text-white mb-4">Resources</h3>
              <ul className="space-y-2">
                {[
                  { name: "Documentation", icon: FileText },
                  { name: "GitHub", icon: Github },
                  { name: "Whitepaper", icon: FileText }
                ].map((link, index) => (
                  <li key={index}>
                    <motion.a
                      href="#"
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                    >
                      <link.icon className="w-4 h-4" />
                      {link.name}
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-semibold text-white mb-4">Contact</h3>
              <ul className="space-y-2">
                {[
                  { name: "Support", icon: Mail },
                  { name: "Community", icon: Users },
                  { name: "Partners", icon: Building }
                ].map((contact, index) => (
                  <li key={index}>
                    <motion.a
                      href="#"
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                    >
                      <contact.icon className="w-4 h-4" />
                      {contact.name}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-slate-400 text-sm mb-2">
              &copy; 2024 Halo Protocol. Building the future of community finance.
            </p>
            <p className="text-slate-500 text-xs">
              Halo Protocol is experimental software. Use at your own risk.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}