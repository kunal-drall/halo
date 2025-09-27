'use client'

import { usePrivy } from '@privy-io/react-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  Shield, 
  LogOut,
  Mail,
  Chrome,
  Apple,
  MessageSquare
} from 'lucide-react'
import { motion } from 'framer-motion'

export const AuthConnection = () => {
  const { user, authenticated, login, logout } = usePrivy()

  const getLoginIcon = (type: string) => {
    switch (type) {
      case 'google': return <Chrome className="h-4 w-4" />
      case 'apple': return <Apple className="h-4 w-4" />
      case 'telegram': return <MessageSquare className="h-4 w-4" />
      case 'email': return <Mail className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  if (authenticated && user) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full max-w-md glass-effect border-primary/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-gradient-primary">Connected via Privy</CardTitle>
            <CardDescription>
              Secured with embedded wallet technology
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 p-3 border border-primary/20">
              <div className="flex items-center gap-3 mb-2">
                {user.google && (
                  <>
                    <Chrome className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">{user.google.email}</span>
                  </>
                )}
                {user.email && !user.google && (
                  <>
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium">{user.email.address}</span>
                  </>
                )}
                {user.apple && (
                  <>
                    <Apple className="h-4 w-4 text-gray-900" />
                    <span className="text-sm font-medium">{user.apple.email || 'Apple ID'}</span>
                  </>
                )}
                {user.telegram && (
                  <>
                    <MessageSquare className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium">@{user.telegram.username}</span>
                  </>
                )}
              </div>
              {user.wallet && (
                <div className="text-xs text-muted-foreground font-mono">
                  Wallet: {user.wallet.address.slice(0, 8)}...{user.wallet.address.slice(-6)}
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => {
                  // Export wallet functionality would go here
                  alert('Export wallet feature coming soon!')
                }}
              >
                Export Wallet
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={logout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
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
              onClick={() => login()}
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

export const AuthButton = () => {
  const { authenticated, login, logout } = usePrivy()

  if (authenticated) {
    return (
      <Button 
        variant="outline" 
        onClick={logout}
        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
      >
        <LogOut className="h-4 w-4 mr-2" />
        Logout
      </Button>
    )
  }

  return (
    <Button 
      onClick={() => login()}
      className="bg-gradient-to-r from-primary to-secondary text-white border-0 hover:shadow-lg hover:scale-105 transition-all duration-200"
    >
      <User className="h-4 w-4 mr-2" />
      Sign In
    </Button>
  )
}