"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Users, X } from "lucide-react";
import CircleCard from "@/components/circles/CircleCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useCircleStore } from "@/stores/circleStore";
import { fetchAvailableCircles } from "@/services/circle-service";
import type { Circle, PayoutMethod, TrustTier } from "@/types";

export default function CirclesPage() {
  const { publicKey } = useWallet();
  const {
    availableCircles,
    setAvailableCircles,
    isCacheStale,
    loading,
    setLoading,
    setError,
  } = useCircleStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [payoutFilter, setPayoutFilter] = useState<string>("all");
  const [trustFilter, setTrustFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  const loadCircles = useCallback(
    async (force = false) => {
      if (!force && !isCacheStale("availableCircles")) {
        setInitialLoad(false);
        return;
      }

      try {
        setLoading(true);
        const circles = await fetchAvailableCircles();
        setAvailableCircles(circles);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load circles";
        setError(message);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    },
    [isCacheStale, setAvailableCircles, setLoading, setError]
  );

  useEffect(() => {
    loadCircles();
  }, [loadCircles]);

  const filteredCircles = useMemo(() => {
    let filtered = [...availableCircles];

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    // Payout method filter
    if (payoutFilter !== "all") {
      filtered = filtered.filter((c) => c.payout_method === payoutFilter);
    }

    // Trust tier filter
    if (trustFilter !== "all") {
      filtered = filtered.filter((c) => c.min_trust_tier === trustFilter);
    }

    // Search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name?.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [availableCircles, statusFilter, payoutFilter, trustFilter, searchQuery]);

  const activeFilterCount = [payoutFilter, trustFilter].filter(
    (f) => f !== "all"
  ).length;

  const clearFilters = () => {
    setPayoutFilter("all");
    setTrustFilter("all");
    setSearchQuery("");
  };

  return (
    <>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            Browse Circles
          </h1>
          <p className="text-white/50 text-sm">
            Find and join lending circles that match your goals.
          </p>
        </motion.div>

        {/* Search Bar */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder="Search circles by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="w-4 h-4" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white text-black text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Additional Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="flex flex-wrap gap-3 p-4 rounded-lg border border-white/10 bg-white/5">
                <div className="w-full sm:w-auto sm:min-w-[180px]">
                  <label className="text-xs text-white/40 mb-1 block">
                    Payout Method
                  </label>
                  <Select value={payoutFilter} onValueChange={setPayoutFilter}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="All methods" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="fixed_rotation">
                        Fixed Rotation
                      </SelectItem>
                      <SelectItem value="random">Random</SelectItem>
                      <SelectItem value="auction">Auction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full sm:w-auto sm:min-w-[180px]">
                  <label className="text-xs text-white/40 mb-1 block">
                    Min Trust Tier
                  </label>
                  <Select value={trustFilter} onValueChange={setTrustFilter}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="All tiers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tiers</SelectItem>
                      <SelectItem value="newcomer">Newcomer</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="platinum">Platinum</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {activeFilterCount > 0 && (
                  <div className="flex items-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-white/40"
                    >
                      Clear all
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Tabs */}
        <Tabs
          value={statusFilter}
          onValueChange={setStatusFilter}
          className="mb-6"
        >
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="all" className="flex-1 sm:flex-initial">
              All
            </TabsTrigger>
            <TabsTrigger value="forming" className="flex-1 sm:flex-initial">
              Forming
            </TabsTrigger>
            <TabsTrigger value="active" className="flex-1 sm:flex-initial">
              Active
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Results count */}
        <p className="text-white/40 text-sm mb-4">
          {filteredCircles.length} circle{filteredCircles.length !== 1 ? "s" : ""}{" "}
          found
        </p>

        {/* Circle Grid */}
        <AnimatePresence mode="wait">
          {loading && initialLoad ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-white/10 bg-white/5 p-6 animate-pulse h-48"
                >
                  <div className="h-4 bg-white/10 rounded w-3/4 mb-4" />
                  <div className="h-3 bg-white/10 rounded w-1/2 mb-2" />
                  <div className="h-3 bg-white/10 rounded w-2/3 mb-6" />
                  <div className="h-8 bg-white/10 rounded w-full" />
                </div>
              ))}
            </motion.div>
          ) : filteredCircles.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredCircles.map((circle, index) => (
                <motion.div
                  key={circle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <CircleCard circle={circle} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white/60 mb-2">
                No circles found
              </h3>
              <p className="text-white/40 text-sm mb-6 max-w-md mx-auto">
                {searchQuery || activeFilterCount > 0
                  ? "Try adjusting your search or filters to find more circles."
                  : "Be the first to create a circle and start saving together."}
              </p>
              {(searchQuery || activeFilterCount > 0) && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

    </>
  );
}
