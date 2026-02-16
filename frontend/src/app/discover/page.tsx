"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Compass,
  TrendingUp,
  Sparkles,
  Shield,
  Flame,
  Users,
  ArrowRight,
  Search,
} from "lucide-react";
import CircleCard from "@/components/circles/CircleCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCircleStore } from "@/stores/circleStore";
import { fetchAvailableCircles } from "@/services/circle-service";
import type { Circle } from "@/types";

type Category = "trending" | "new" | "high_yield" | "low_risk";

const CATEGORIES: { key: Category; label: string; icon: React.ElementType; description: string }[] = [
  {
    key: "trending",
    label: "Trending",
    icon: Flame,
    description: "Most popular circles right now",
  },
  {
    key: "new",
    label: "New",
    icon: Sparkles,
    description: "Recently created circles",
  },
  {
    key: "high_yield",
    label: "High Yield",
    icon: TrendingUp,
    description: "Circles with the best returns",
  },
  {
    key: "low_risk",
    label: "Low Risk",
    icon: Shield,
    description: "Circles with higher trust requirements",
  },
];

function sortCircles(circles: Circle[], category: Category): Circle[] {
  const sorted = [...circles];
  switch (category) {
    case "trending":
      return sorted.sort((a, b) => b.current_members - a.current_members);
    case "new":
      return sorted.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    case "high_yield":
      return sorted.sort((a, b) => b.total_yield_earned - a.total_yield_earned);
    case "low_risk":
      return sorted.sort((a, b) => {
        const tierOrder: Record<string, number> = {
          platinum: 4,
          gold: 3,
          silver: 2,
          newcomer: 1,
        };
        return (
          (tierOrder[b.min_trust_tier] || 0) -
          (tierOrder[a.min_trust_tier] || 0)
        );
      });
    default:
      return sorted;
  }
}

export default function DiscoverPage() {
  const {
    availableCircles,
    setAvailableCircles,
    isCacheStale,
    loading,
    setLoading,
    setError,
  } = useCircleStore();

  const [activeCategory, setActiveCategory] = useState<Category>("trending");
  const [searchQuery, setSearchQuery] = useState("");
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

  const featuredCircles = useMemo(() => {
    return [...availableCircles]
      .sort((a, b) => b.current_members - a.current_members)
      .slice(0, 3);
  }, [availableCircles]);

  const categorizedCircles = useMemo(() => {
    let circles = sortCircles(availableCircles, activeCategory);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      circles = circles.filter(
        (c) =>
          c.name?.toLowerCase().includes(query) ||
          c.description?.toLowerCase().includes(query)
      );
    }

    return circles;
  }, [availableCircles, activeCategory, searchQuery]);

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <Compass className="w-7 h-7 text-white/60" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Discover Circles
            </h1>
          </div>
          <p className="text-white/50 text-sm">
            Explore lending circles and find the perfect one for your savings
            goals.
          </p>
        </motion.div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            placeholder="Search circles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>

        {/* Featured Section */}
        {featuredCircles.length > 0 && !searchQuery && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                Featured Circles
              </h2>
              <Link href="/circles">
                <Button variant="ghost" size="sm" className="gap-1 text-white/50">
                  View All
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredCircles.map((circle, index) => (
                <motion.div
                  key={circle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                >
                  <div className="relative">
                    {index === 0 && (
                      <div className="absolute -top-2 -right-2 z-10">
                        <Badge variant="default" className="text-[10px] gap-1">
                          <Flame className="w-3 h-3" />
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    <CircleCard circle={circle} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Categories */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">
            Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              const isActive = activeCategory === category.key;
              return (
                <button
                  key={category.key}
                  onClick={() => setActiveCategory(category.key)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    isActive
                      ? "border-white/20 bg-white/10"
                      : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 mb-2 ${
                      isActive ? "text-white/70" : "text-white/40"
                    }`}
                  />
                  <p
                    className={`text-sm font-medium ${
                      isActive ? "text-white/60" : "text-white/70"
                    }`}
                  >
                    {category.label}
                  </p>
                  <p className="text-xs text-white/30 mt-0.5">
                    {category.description}
                  </p>
                </button>
              );
            })}
          </div>
        </motion.section>

        {/* Browse All */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">
              {CATEGORIES.find((c) => c.key === activeCategory)?.label || "All"}{" "}
              Circles
            </h2>
            <span className="text-sm text-white/40">
              {categorizedCircles.length} result
              {categorizedCircles.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading && initialLoad ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            </div>
          ) : categorizedCircles.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categorizedCircles.map((circle, index) => (
                <motion.div
                  key={circle.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                >
                  <CircleCard circle={circle} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white/60 mb-2">
                No circles found
              </h3>
              <p className="text-white/40 text-sm mb-6">
                {searchQuery
                  ? "Try a different search term."
                  : "No circles available in this category yet."}
              </p>
              <Link href="/circles/create">
                <Button>Create a Circle</Button>
              </Link>
            </div>
          )}
        </section>
    </main>
  );
}
