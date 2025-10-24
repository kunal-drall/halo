'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletWrapper } from '@/components/WalletWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ArrowRight, 
  Users, 
  DollarSign, 
  Clock, 
  Shield,
  Settings,
  Eye,
  EyeOff,
  Check,
  Plus
} from 'lucide-react';
import { CreateCircleParams } from '@/types/circles';
import { circleService } from '@/services/circle-service';
import { useToast } from '@/components/ui/toast';
import { ProgramStatusChecker } from '@/components/ProgramStatusChecker';

const STEPS = [
  { id: 'basic', title: 'Basic Info', icon: Settings },
  { id: 'payout', title: 'Payout Method', icon: Users },
  { id: 'requirements', title: 'Requirements', icon: Shield },
  { id: 'rules', title: 'Rules', icon: Clock },
  { id: 'visibility', title: 'Visibility', icon: Eye },
  { id: 'review', title: 'Review', icon: Check },
];

export default function CreateCirclePage() {
  const { connected, publicKey } = useWallet();
  const { addToast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateCircleParams>({
    contributionAmount: 0,
    durationMonths: 12,
    maxMembers: 10,
    payoutMethod: 'FixedRotation',
    minTrustTier: 0,
    penaltyRate: 5,
    isPublic: true,
    circleType: 'Standard',
  });

  const [inviteCode, setInviteCode] = useState('');
  const [showInviteCode, setShowInviteCode] = useState(false);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreateCircle = async () => {
    if (!publicKey) return;

    setIsCreating(true);
    try {
      const signature = await circleService.createCircle(formData, publicKey);
      
      addToast({
        type: 'success',
        title: 'Circle Created!',
        description: `Your lending circle has been created successfully.`,
        duration: 5000
      });

      // Redirect to the new circle or dashboard
      window.location.href = '/';
    } catch (error) {
      console.error('Error creating circle:', error);
      addToast({
        type: 'error',
        title: 'Creation Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        duration: 7000
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getTrustTierName = (tier: number) => {
    switch (tier) {
      case 3: return 'Platinum';
      case 2: return 'Gold';
      case 1: return 'Silver';
      default: return 'Newcomer';
    }
  };

  const getPayoutMethodName = (method: string) => {
    switch (method) {
      case 'FixedRotation': return 'Fixed Order';
      case 'Auction': return 'Auction';
      case 'Random': return 'Random';
      default: return 'Fixed Order';
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Plus className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              Connect your Solana wallet to create lending circles
            </p>
            <WalletWrapper />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Create Circle</h1>
                <p className="text-sm text-gray-500">
                  Step {currentStep + 1} of {STEPS.length}
                </p>
              </div>
            </div>
            <WalletWrapper />
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex items-center space-x-2">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${index <= currentStep 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
                }
              `}>
                {index + 1}
              </div>
              {index < STEPS.length - 1 && (
                <div className={`
                  w-8 h-0.5 mx-2
                  ${index < currentStep ? 'bg-blue-600' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Program Status Checker */}
      <div className="max-w-md mx-auto p-4">
        <ProgramStatusChecker />
      </div>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {React.createElement(STEPS[currentStep].icon, { className: "h-5 w-5" })}
              <span>{STEPS[currentStep].title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Info */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="contribution">Monthly Contribution (USDC)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="contribution"
                      type="number"
                      placeholder="200"
                      className="pl-10"
                      value={formData.contributionAmount || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        contributionAmount: Number(e.target.value)
                      })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="duration">Duration (months)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="12"
                    value={formData.durationMonths}
                    onChange={(e) => setFormData({
                      ...formData,
                      durationMonths: Number(e.target.value)
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="members">Maximum Members</Label>
                  <Input
                    id="members"
                    type="number"
                    placeholder="10"
                    value={formData.maxMembers}
                    onChange={(e) => setFormData({
                      ...formData,
                      maxMembers: Number(e.target.value)
                    })}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Payout Method */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid gap-3">
                  {[
                    { value: 'FixedRotation', label: 'Fixed Order', description: 'Predetermined payout order' },
                    { value: 'Auction', label: 'Auction', description: 'Members bid for early payout' },
                    { value: 'Random', label: 'Random', description: 'Random selection each round' },
                  ].map((method) => (
                    <button
                      key={method.value}
                      onClick={() => setFormData({ ...formData, payoutMethod: method.value as any })}
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        formData.payoutMethod === method.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{method.label}</div>
                      <div className="text-sm text-gray-500">{method.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Requirements */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="trustTier">Minimum Trust Tier</Label>
                  <select
                    id="trustTier"
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    value={formData.minTrustTier}
                    onChange={(e) => setFormData({
                      ...formData,
                      minTrustTier: Number(e.target.value)
                    })}
                  >
                    <option value={0}>Newcomer (0-249)</option>
                    <option value={1}>Silver (250-499)</option>
                    <option value={2}>Gold (500-749)</option>
                    <option value={3}>Platinum (750-1000)</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Only users with {getTrustTierName(formData.minTrustTier)} tier or higher can join
                  </p>
                </div>

                <div>
                  <Label htmlFor="penalty">Late Payment Penalty (%)</Label>
                  <Input
                    id="penalty"
                    type="number"
                    placeholder="5"
                    value={formData.penaltyRate}
                    onChange={(e) => setFormData({
                      ...formData,
                      penaltyRate: Number(e.target.value)
                    })}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Rules */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Circle Rules</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Members must contribute on time each month</li>
                    <li>• Late payments incur {formData.penaltyRate}% penalty</li>
                    <li>• Insurance stake required: 10-20% of contribution</li>
                    <li>• Defaulting members lose insurance stake</li>
                    <li>• Successful members get insurance back + bonus</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 5: Visibility */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div>
                  <Label>Circle Visibility</Label>
                  <div className="grid gap-3 mt-2">
                    <button
                      onClick={() => setFormData({ ...formData, isPublic: true })}
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        formData.isPublic
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Public Circle</div>
                          <div className="text-sm text-gray-500">Anyone can discover and join</div>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setFormData({ ...formData, isPublic: false })}
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        !formData.isPublic
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <EyeOff className="h-4 w-4" />
                        <div>
                          <div className="font-medium">Private Circle</div>
                          <div className="text-sm text-gray-500">Invite-only with invite code</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {!formData.isPublic && (
                  <div>
                    <Label htmlFor="inviteCode">Invite Code (Optional)</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="inviteCode"
                        type={showInviteCode ? 'text' : 'password'}
                        placeholder="Enter invite code"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowInviteCode(!showInviteCode)}
                      >
                        {showInviteCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 6: Review */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-3">Circle Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contribution:</span>
                      <span className="font-medium">${formData.contributionAmount} USDC/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{formData.durationMonths} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Members:</span>
                      <span className="font-medium">{formData.maxMembers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Payout Method:</span>
                      <span className="font-medium">{getPayoutMethodName(formData.payoutMethod)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Min Trust Tier:</span>
                      <span className="font-medium">{getTrustTierName(formData.minTrustTier)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Penalty Rate:</span>
                      <span className="font-medium">{formData.penaltyRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Visibility:</span>
                      <Badge variant={formData.isPublic ? 'default' : 'secondary'}>
                        {formData.isPublic ? 'Public' : 'Private'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">Estimated Costs</h4>
                  <div className="text-sm text-yellow-800">
                    <div>• Smart contract deployment: ~0.01 SOL</div>
                    <div>• Insurance stake: ${(formData.contributionAmount * 0.15).toFixed(2)} USDC</div>
                    <div>• Monthly contribution: ${formData.contributionAmount} USDC</div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex space-x-3 pt-4">
              {currentStep > 0 && (
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              )}
              
              {currentStep < STEPS.length - 1 ? (
                <Button onClick={handleNext} className="flex-1">
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleCreateCircle} 
                  disabled={isCreating}
                  className="flex-1"
                >
                  {isCreating ? 'Creating...' : 'Create Circle'}
                  <Plus className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
