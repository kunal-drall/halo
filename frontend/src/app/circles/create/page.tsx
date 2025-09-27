'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  ArrowLeft,
  Plus,
  Users, 
  Coins, 
  Calendar,
  Percent,
  Wallet,
  Info,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'

export default function CreateCirclePage() {
  const { authenticated } = useAuth()
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contributionAmount: '',
    maxMembers: '',
    durationMonths: '',
    penaltyRate: '',
    minTrustScore: '400',
    isPublic: true,
    tags: [] as string[]
  })
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

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
              You need to connect your wallet to create circles
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <AuthButton />
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      // Here would be the actual blockchain transaction
      console.log('Creating circle with data:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirect to success or circle page
      alert('Circle created successfully!')
      
    } catch (error) {
      console.error('Error creating circle:', error)
      alert('Failed to create circle. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const steps = [
    { number: 1, title: 'Basic Details', description: 'Name, description and visibility' },
    { number: 2, title: 'Circle Parameters', description: 'Amounts, duration and requirements' },
    { number: 3, title: 'Review & Create', description: 'Confirm details and create circle' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/circles">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Create Circle
                </span>
              </div>
            </div>
            
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex flex-col items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                      step.number <= currentStep 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {step.number < currentStep ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <div className="text-center mt-2">
                      <p className="text-sm font-medium">{step.title}</p>
                      <p className="text-xs text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-px flex-1 mx-4 ${
                      step.number < currentStep ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <Card>
            <CardHeader>
              <CardTitle>Step {currentStep}: {steps[currentStep - 1].title}</CardTitle>
              <CardDescription>{steps[currentStep - 1].description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Step 1: Basic Details */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Circle Name *</label>
                    <input
                      type="text"
                      placeholder="e.g., Tech Professionals Savings Circle"
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Description *</label>
                    <textarea
                      placeholder="Describe your circle's purpose and goals..."
                      rows={4}
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Circle Type</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="visibility"
                          checked={formData.isPublic}
                          onChange={() => handleInputChange('isPublic', true)}
                          className="mr-2"
                        />
                        Public - Anyone can join
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="visibility"
                          checked={!formData.isPublic}
                          onChange={() => handleInputChange('isPublic', false)}
                          className="mr-2"
                        />
                        Private - Invitation only
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tags (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g., Tech, Community, Professional (comma-separated)"
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      onChange={(e) => handleInputChange('tags', e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Circle Parameters */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <Coins className="inline h-4 w-4 mr-1" />
                        Monthly Contribution (USD) *
                      </label>
                      <input
                        type="number"
                        placeholder="500"
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        value={formData.contributionAmount}
                        onChange={(e) => handleInputChange('contributionAmount', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <Users className="inline h-4 w-4 mr-1" />
                        Maximum Members *
                      </label>
                      <input
                        type="number"
                        placeholder="10"
                        min="3"
                        max="50"
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        value={formData.maxMembers}
                        onChange={(e) => handleInputChange('maxMembers', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        Duration (Months) *
                      </label>
                      <input
                        type="number"
                        placeholder="12"
                        min="3"
                        max="24"
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        value={formData.durationMonths}
                        onChange={(e) => handleInputChange('durationMonths', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        <Percent className="inline h-4 w-4 mr-1" />
                        Penalty Rate (%) *
                      </label>
                      <input
                        type="number"
                        placeholder="10"
                        min="0"
                        max="50"
                        step="0.1"
                        className="w-full px-3 py-2 border border-input rounded-md bg-background"
                        value={formData.penaltyRate}
                        onChange={(e) => handleInputChange('penaltyRate', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Minimum Trust Score</label>
                    <select
                      className="w-full px-3 py-2 border border-input rounded-md bg-background"
                      value={formData.minTrustScore}
                      onChange={(e) => handleInputChange('minTrustScore', e.target.value)}
                    >
                      <option value="300">300 - Newcomer Friendly</option>
                      <option value="400">400 - Standard</option>
                      <option value="600">600 - Experienced Users</option>
                      <option value="800">800 - High Trust Only</option>
                    </select>
                  </div>

                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-900 mb-1">Parameter Guidelines</p>
                          <ul className="text-xs text-blue-800 space-y-1">
                            <li>• Higher contributions require more trust from members</li>
                            <li>• Penalty rates help ensure commitment (5-15% typical)</li>
                            <li>• Duration should match your community's savings goals</li>
                            <li>• All funds earn yield through Solend integration</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Step 3: Review & Create */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Circle Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span className="font-medium">{formData.name || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <Badge variant="secondary">
                            {formData.isPublic ? 'Public' : 'Private'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Max Members:</span>
                          <span className="font-medium">{formData.maxMembers || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-medium">{formData.durationMonths || 'Not set'} months</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Financial Terms</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Contribution:</span>
                          <span className="font-medium">${formData.contributionAmount || '0'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Penalty Rate:</span>
                          <span className="font-medium">{formData.penaltyRate || '0'}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Min Trust Score:</span>
                          <span className="font-medium">{formData.minTrustScore}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Pool:</span>
                          <span className="font-medium text-green-600">
                            ${(parseFloat(formData.contributionAmount || '0') * parseFloat(formData.maxMembers || '0')).toLocaleString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {formData.description && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Description</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{formData.description}</p>
                      </CardContent>
                    </Card>
                  )}

                  <Card className="bg-amber-50 border-amber-200">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-amber-900 mb-1">Before You Create</p>
                          <ul className="text-xs text-amber-800 space-y-1">
                            <li>• You'll need to deposit 2x the contribution amount as creator stake</li>
                            <li>• This transaction will cost ~0.01 SOL in network fees</li>
                            <li>• Your circle will be immediately visible to eligible members</li>
                            <li>• You can't modify parameters after creation</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6 border-t">
                <Button 
                  variant="outline" 
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                
                {currentStep < 3 ? (
                  <Button 
                    onClick={nextStep}
                    disabled={
                      (currentStep === 1 && (!formData.name || !formData.description)) ||
                      (currentStep === 2 && (!formData.contributionAmount || !formData.maxMembers || !formData.durationMonths || !formData.penaltyRate))
                    }
                  >
                    Next Step
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Circle'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}