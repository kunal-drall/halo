'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletWrapper } from '@/components/WalletWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Users, 
  DollarSign, 
  Clock, 
  Shield,
  TrendingUp,
  Star,
  ArrowRight,
  Plus
} from 'lucide-react';
import { Circle, CircleFilters } from '@/types/circles';
import { circleService } from '@/services/circle-service';
import { CircleCard } from '@/components/circles/CircleCard';
import { TrustScoreWidget } from '@/components/trust/TrustScoreWidget';

export default function DiscoverPage() {
  const { connected, publicKey } = useWallet();
  const [circles, setCircles] = useState<Circle[]>([]);
  const [filteredCircles, setFilteredCircles] = useState<Circle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<CircleFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  // Load circles
  useEffect(() => {
    const loadCircles = async () => {
      try {
        setLoading(true);
        const allCircles = await circleService.getAllCircles();
        setCircles(allCircles);
        setFilteredCircles(allCircles);
      } catch (error) {
        console.error('Error loading circles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCircles();
  }, []);

  // Apply search and filters
  useEffect(() => {
    let filtered = circles;

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(circle => 
        circle.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.minContribution) {
      filtered = filtered.filter(circle => circle.contributionAmount >= filters.minContribution!);
    }
    if (filters.maxContribution) {
      filtered = filtered.filter(circle => circle.contributionAmount <= filters.maxContribution!);
    }
    if (filters.minTrustTier) {
      filtered = filtered.filter(circle => circle.minTrustTier >= filters.minTrustTier!);
    }
    if (filters.payoutMethod) {
      filtered = filtered.filter(circle => circle.payoutMethod === filters.payoutMethod);
    }
    if (filters.status) {
      filtered = filtered.filter(circle => circle.status === filters.status);
    }
    if (filters.isPublic !== undefined) {
      filtered = filtered.filter(circle => circle.isPublic === filters.isPublic);
    }

    setFilteredCircles(filtered);
  }, [circles, searchTerm, filters]);

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Search className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-gray-600 mb-6">
              Connect your Solana wallet to discover lending circles
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
            <div>
              <h1 className="text-xl font-bold text-gray-900">Discover Circles</h1>
              <p className="text-sm text-gray-500">
                {filteredCircles.length} circle{filteredCircles.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <TrustScoreWidget />
              <WalletWrapper />
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="max-w-md mx-auto p-4 space-y-4">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search circles..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Contribution Amount
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minContribution || ''}
                    onChange={(e) => setFilters({
                      ...filters,
                      minContribution: e.target.value ? Number(e.target.value) : undefined
                    })}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxContribution || ''}
                    onChange={(e) => setFilters({
                      ...filters,
                      maxContribution: e.target.value ? Number(e.target.value) : undefined
                    })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Minimum Trust Tier
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={filters.minTrustTier || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    minTrustTier: e.target.value ? Number(e.target.value) : undefined
                  })}
                >
                  <option value="">Any</option>
                  <option value="0">Newcomer</option>
                  <option value="1">Silver</option>
                  <option value="2">Gold</option>
                  <option value="3">Platinum</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Payout Method
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={filters.payoutMethod || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    payoutMethod: e.target.value as any || undefined
                  })}
                >
                  <option value="">Any</option>
                  <option value="FixedRotation">Fixed Order</option>
                  <option value="Auction">Auction</option>
                  <option value="Random">Random</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Status
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={filters.status || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    status: e.target.value as any || undefined
                  })}
                >
                  <option value="">Any</option>
                  <option value="Forming">Forming</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <Button 
                variant="outline" 
                onClick={() => setFilters({})}
                className="w-full"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Circles List */}
      <main className="max-w-md mx-auto p-4 space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCircles.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Circles Found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search terms or filters
              </p>
              <Button onClick={() => setFilters({})}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredCircles.map((circle) => (
              <CircleCard key={circle.id} circle={circle} />
            ))}
          </div>
        )}

        {/* Create Circle CTA */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-6 text-center">
            <Plus className="h-8 w-8 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Don't See What You're Looking For?</h3>
            <p className="text-blue-100 mb-4">
              Create your own lending circle with custom parameters
            </p>
            <Button variant="secondary" className="w-full">
              Create Circle
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
