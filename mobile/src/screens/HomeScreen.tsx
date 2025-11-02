/**
 * Home Screen
 *
 * Main dashboard with portfolio overview, dual yields, and quick actions
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useWallet, useYield, useCircles, usePrivacy } from '../hooks';
import { colors, spacing, typography } from '../theme';
import { YieldDisplay } from '../components/YieldDisplay';
import { PrivacyBadge } from '../components/PrivacyBadge';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { address, balance, refreshBalance } = useWallet();
  const {
    positions,
    totalStaked,
    totalEarned,
    fetchPositions,
    yieldBreakdown,
    fetchYieldBreakdown,
  } = useYield();
  const { myCircles, refreshCircles } = useCircles();
  const { settings, encryptedTrustScore, fetchEncryptedTrustScore } = usePrivacy();

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate combined APY from all positions
  const averageAPY =
    positions.length > 0
      ? positions.reduce((sum, pos) => sum + pos.combinedAPY, 0) / positions.length
      : 0;

  // Calculate daily earnings estimate
  const dailyEarnings = totalStaked * (averageAPY / 100 / 365);

  // Fetch initial data
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchPositions(),
        refreshCircles(),
        fetchEncryptedTrustScore(),
        totalStaked > 0 && fetchYieldBreakdown(totalStaked),
      ]);
    };

    loadData();
  }, []);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refreshBalance(),
      fetchPositions(),
      refreshCircles(),
      fetchEncryptedTrustScore(),
    ]);
    setIsRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[colors.primary, colors.privacy.pink]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Halo Protocol</Text>
        <View style={styles.headerSubtitle}>
          <Text style={styles.walletAddress}>
            {address ? `${address.slice(0, 4)}...${address.slice(-4)}` : 'Not connected'}
          </Text>
          {settings.arciumEnabled && <PrivacyBadge type="encrypted" size="sm" />}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Portfolio Value Card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total Portfolio Value</Text>
          <Text style={styles.portfolioValue}>
            ${(totalStaked + totalEarned).toFixed(2)}
          </Text>
          <View style={styles.portfolioBreakdown}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Staked</Text>
              <Text style={styles.breakdownValue}>${totalStaked.toFixed(2)}</Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Earned</Text>
              <Text style={[styles.breakdownValue, styles.breakdownValueGreen]}>
                ${totalEarned.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Dual Yield Display */}
        {yieldBreakdown && (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('YieldDashboard' as never)}
          >
            <YieldDisplay
              reflectYield={yieldBreakdown.reflectYield}
              solendYield={yieldBreakdown.solendYield}
              totalAPY={yieldBreakdown.totalAPY}
              onPress={() => navigation.navigate('YieldDashboard' as never)}
            />
          </TouchableOpacity>
        )}

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>⭕</Text>
            <Text style={styles.statValue}>{myCircles.length}</Text>
            <Text style={styles.statLabel}>My Circles</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📈</Text>
            <Text style={styles.statValue}>{averageAPY.toFixed(1)}%</Text>
            <Text style={styles.statLabel}>Avg APY</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💸</Text>
            <Text style={styles.statValue}>${dailyEarnings.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Daily</Text>
          </View>
        </View>

        {/* Trust Score (if available and not fully encrypted) */}
        {encryptedTrustScore && !settings.encryptTrustScore && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Trust Score</Text>
              {settings.arciumEnabled && <PrivacyBadge type="private" size="sm" />}
            </View>
            <View style={styles.trustScoreContainer}>
              <Text style={styles.trustScoreValue}>750</Text>
              <Text style={styles.trustScoreMax}>/1000</Text>
            </View>
            <View style={styles.trustScoreBar}>
              <View style={[styles.trustScoreProgress, { width: '75%' }]} />
            </View>
            <Text style={styles.trustScoreLabel}>Excellent standing</Text>
          </View>
        )}

        {/* Recent Positions */}
        {positions.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Active Positions</Text>
            {positions.slice(0, 3).map((position) => (
              <View key={position.id} style={styles.positionItem}>
                <View style={styles.positionHeader}>
                  <Text style={styles.positionToken}>{position.tokenType}</Text>
                  <Text style={styles.positionAPY}>{position.combinedAPY.toFixed(1)}% APY</Text>
                </View>
                <View style={styles.positionDetails}>
                  <Text style={styles.positionAmount}>${position.amount.toFixed(2)}</Text>
                  <Text style={styles.positionEarned}>
                    +${position.totalEarned.toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
            {positions.length > 3 && (
              <TouchableOpacity
                style={styles.viewMoreButton}
                onPress={() => navigation.navigate('YieldDashboard' as never)}
              >
                <Text style={styles.viewMoreText}>View all positions →</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Recent Circles */}
        {myCircles.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>My Circles</Text>
            {myCircles.slice(0, 3).map((circle) => (
              <TouchableOpacity
                key={circle.id}
                style={styles.circleItem}
                onPress={() =>
                  navigation.navigate('CirclesTab' as never, {
                    screen: 'CircleDetails',
                    params: { circleId: circle.id },
                  } as never)
                }
              >
                <View style={styles.circleHeader}>
                  <Text style={styles.circleName}>{circle.name || 'Circle'}</Text>
                  <View
                    style={[
                      styles.circleStatus,
                      circle.status === 'active' && styles.circleStatusActive,
                    ]}
                  >
                    <Text style={styles.circleStatusText}>{circle.status}</Text>
                  </View>
                </View>
                <View style={styles.circleDetails}>
                  <Text style={styles.circleMembers}>
                    👥 {circle.currentMembers}/{circle.maxMembers}
                  </Text>
                  <Text style={styles.circleYield}>
                    💰 {circle.combinedAPY.toFixed(1)}% APY
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            {myCircles.length > 3 && (
              <TouchableOpacity
                style={styles.viewMoreButton}
                onPress={() => navigation.navigate('CirclesTab' as never)}
              >
                <Text style={styles.viewMoreText}>View all circles →</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('StakeTab' as never)}
          >
            <LinearGradient
              colors={[colors.yield.reflect, colors.yield.solend]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionButtonIcon}>💰</Text>
              <Text style={styles.actionButtonText}>Stake</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              navigation.navigate('CirclesTab' as never, {
                screen: 'CreateCircle',
              } as never)
            }
          >
            <LinearGradient
              colors={[colors.primary, colors.privacy.pink]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionButtonGradient}
            >
              <Text style={styles.actionButtonIcon}>⭕</Text>
              <Text style={styles.actionButtonText}>Create Circle</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  headerTitle: {
    ...typography.h2,
    color: '#fff',
    fontWeight: '700',
  },
  headerSubtitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  walletAddress: {
    ...typography.caption,
    color: '#fff',
    opacity: 0.9,
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  portfolioValue: {
    ...typography.h1,
    color: colors.text,
    fontSize: 40,
    marginBottom: spacing.md,
  },
  portfolioBreakdown: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownItem: {
    flex: 1,
  },
  breakdownLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs / 2,
  },
  breakdownValue: {
    ...typography.h4,
    color: colors.text,
  },
  breakdownValueGreen: {
    color: colors.success,
  },
  breakdownDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    marginHorizontal: spacing.xs / 2,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  trustScoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  trustScoreValue: {
    ...typography.h1,
    color: colors.primary,
    fontSize: 48,
  },
  trustScoreMax: {
    ...typography.h4,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  trustScoreBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  trustScoreProgress: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  trustScoreLabel: {
    ...typography.caption,
    color: colors.success,
  },
  positionItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  positionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  positionToken: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  positionAPY: {
    ...typography.caption,
    color: colors.yield.reflect,
    fontWeight: '600',
  },
  positionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  positionAmount: {
    ...typography.body,
    color: colors.textMuted,
  },
  positionEarned: {
    ...typography.body,
    color: colors.success,
  },
  circleItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  circleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  circleName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  circleStatus: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  circleStatusActive: {
    backgroundColor: colors.success + '20',
  },
  circleStatusText: {
    ...typography.caption,
    color: colors.text,
    fontSize: 10,
    textTransform: 'uppercase',
  },
  circleDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  circleMembers: {
    ...typography.caption,
    color: colors.textMuted,
  },
  circleYield: {
    ...typography.caption,
    color: colors.yield.reflect,
  },
  viewMoreButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  viewMoreText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  actionButtonGradient: {
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonIcon: {
    fontSize: 24,
    marginBottom: spacing.xs / 2,
  },
  actionButtonText: {
    ...typography.button,
    color: '#fff',
    fontSize: 14,
  },
});
