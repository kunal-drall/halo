'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Minus, 
  Clock, 
  TrendingUp,
  Lock,
  Unlock,
  Coins,
  ArrowUpRight
} from 'lucide-react';
import { PublicKey } from '@solana/web3.js';
import { StakingPosition, StakingToken } from '@/types/staking';
import { TokenSelector } from './TokenSelector';
import { StakeForm } from './StakeForm';
import { PositionCard } from './PositionCard';
import { stakingService } from '@/services/staking-service';
import { useWallet } from '@solana/wallet-adapter-react';
import { useToast } from '@/components/ui/toast';

interface StakingInterfaceProps {
  positions: StakingPosition[];
  onPositionUpdate: (positions: StakingPosition[]) => void;
}

const mockTokens: StakingToken[] = [
  {
    mint: new PublicKey('So11111111111111111111111111111111111111112'),
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    apy: 7.5,
    totalStaked: 1000000,
    stakerCount: 1500,
    isActive: true,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
  },
  {
    mint: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    apy: 5.2,
    totalStaked: 2000000,
    stakerCount: 2500,
    isActive: true,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
  },
  {
    mint: new PublicKey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'),
    symbol: 'BONK',
    name: 'Bonk',
    decimals: 5,
    apy: 12.8,
    totalStaked: 500000,
    stakerCount: 800,
    isActive: true,
    logoURI: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I'
  }
];

export function StakingInterface({ positions, onPositionUpdate }: StakingInterfaceProps) {
  const { publicKey } = useWallet();
  const { addToast } = useToast();
  const [selectedToken, setSelectedToken] = useState<StakingToken | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [lockPeriod, setLockPeriod] = useState<number | null>(null);
  const [isStaking, setIsStaking] = useState(false);
  const [availableTokens, setAvailableTokens] = useState<StakingToken[]>([]);

  // Load available tokens on component mount
  useEffect(() => {
    const loadTokens = async () => {
      try {
        const tokens = await stakingService.getAvailableTokens();
        setAvailableTokens(tokens);
      } catch (error) {
        console.error('Error loading tokens:', error);
        setAvailableTokens(mockTokens); // Fallback to mock data
      }
    };
    loadTokens();
  }, []);

  const handleStake = async () => {
    if (!selectedToken || !stakeAmount || !publicKey) return;
    
    setIsStaking(true);
    
    try {
      // Create stake using the staking service
      const signature = await stakingService.createStake(
        publicKey,
        selectedToken.mint,
        parseFloat(stakeAmount),
        lockPeriod ?? undefined
      );
      
      console.log('Stake created with signature:', signature);
      
      // Show success toast
      addToast({
        type: 'success',
        title: 'Stake Created Successfully',
        description: `Staked ${stakeAmount} ${selectedToken.symbol} with ${lockPeriod ? `${lockPeriod} day lock` : 'flexible staking'}`,
        duration: 5000
      });
      
      // Create new position object
      const newPosition: StakingPosition = {
        id: Date.now().toString(),
        token: selectedToken,
        amount: parseFloat(stakeAmount),
        stakedAt: new Date(),
        lockPeriod: lockPeriod ?? undefined,
        rewards: 0,
        apy: selectedToken.apy,
        status: 'active'
      };
      
      onPositionUpdate([...positions, newPosition]);
      setStakeAmount('');
      setSelectedToken(null);
    } catch (error) {
      console.error('Error creating stake:', error);
      addToast({
        type: 'error',
        title: 'Staking Failed',
        description: error instanceof Error ? error.message : 'An error occurred while staking',
        duration: 7000
      });
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async (positionId: string) => {
    // Simulate unstaking
    const updatedPositions = positions.map(pos => 
      pos.id === positionId 
        ? { ...pos, status: 'unlocking' as const }
        : pos
    );
    onPositionUpdate(updatedPositions);
  };

  const totalValueLocked = positions.reduce((sum, pos) => sum + pos.amount, 0);
  const totalRewards = positions.reduce((sum, pos) => sum + pos.rewards, 0);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Staked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalValueLocked.toFixed(2)} SOL</div>
            <p className="text-xs text-muted-foreground">Across {positions.length} positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRewards.toFixed(4)} SOL</div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average APY</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {positions.length > 0 
                ? (positions.reduce((sum, pos) => sum + pos.apy, 0) / positions.length).toFixed(1)
                : '0.0'
              }%
            </div>
            <p className="text-xs text-muted-foreground">Current rate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="stake" className="space-y-6">
        <TabsList>
          <TabsTrigger value="stake">Stake Tokens</TabsTrigger>
          <TabsTrigger value="positions">My Positions</TabsTrigger>
          <TabsTrigger value="tokens">Available Tokens</TabsTrigger>
        </TabsList>

        <TabsContent value="stake" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stake Form */}
            <Card>
              <CardHeader>
                <CardTitle>Stake Tokens</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <TokenSelector
                  tokens={availableTokens}
                  selectedToken={selectedToken}
                  onTokenSelect={setSelectedToken}
                />

                <StakeForm
                  selectedToken={selectedToken}
                  amount={stakeAmount}
                  onAmountChange={setStakeAmount}
                  lockPeriod={lockPeriod}
                  onLockPeriodChange={setLockPeriod}
                />

                <Button 
                  onClick={handleStake}
                  disabled={!selectedToken || !stakeAmount || isStaking}
                  className="w-full"
                >
                  {isStaking ? 'Staking...' : 'Stake Tokens'}
                </Button>
              </CardContent>
            </Card>

            {/* APY Calculator */}
            <Card>
              <CardHeader>
                <CardTitle>APY Calculator</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedToken ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {selectedToken.apy}%
                      </div>
                      <p className="text-sm text-gray-500">Annual Percentage Yield</p>
                    </div>
                    
                    {stakeAmount && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Daily Rewards:</span>
                          <span className="font-medium">
                            {((parseFloat(stakeAmount) * selectedToken.apy / 100) / 365).toFixed(6)} {selectedToken.symbol}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Monthly Rewards:</span>
                          <span className="font-medium">
                            {((parseFloat(stakeAmount) * selectedToken.apy / 100) / 12).toFixed(4)} {selectedToken.symbol}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Yearly Rewards:</span>
                          <span className="font-medium">
                            {(parseFloat(stakeAmount) * selectedToken.apy / 100).toFixed(4)} {selectedToken.symbol}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Select a token to see APY details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="positions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Staking Positions</CardTitle>
            </CardHeader>
            <CardContent>
              {positions.length === 0 ? (
                <div className="text-center py-8">
                  <Lock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Positions</h3>
                  <p className="text-gray-500 mb-4">Start staking to see your positions here</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Start Staking
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {positions.map((position) => (
                    <PositionCard
                      key={position.id}
                      position={position}
                      onUnstake={handleUnstake}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tokens" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockTokens.map((token) => (
                  <Card key={token.symbol} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {token.symbol}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{token.name}</h4>
                          <p className="text-sm text-gray-500">{token.symbol}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">APY</span>
                          <span className="font-medium text-green-600">{token.apy}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Total Staked</span>
                          <span className="font-medium">{token.totalStaked.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Stakers</span>
                          <span className="font-medium">{token.stakerCount}</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-3" 
                        variant="outline"
                        onClick={() => setSelectedToken(token)}
                      >
                        Stake {token.symbol}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
