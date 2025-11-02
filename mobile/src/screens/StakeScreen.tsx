/**
 * Stake Screen
 *
 * Staking interface with Reflect integration (USDC+, USDJ)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWallet, useYield, ReflectTokenType, YieldStrategy } from '../hooks';
import { colors, spacing, typography } from '../theme';
import { YieldDisplay } from '../components/YieldDisplay';

export const StakeScreen: React.FC = () => {
  const { balance, isConnected } = useWallet();
  const {
    stakeUSDCPlus,
    stakeUSDJ,
    yieldBreakdown,
    fetchYieldBreakdown,
    strategies,
    getRecommendedStrategy,
    isLoading,
  } = useYield();

  const [selectedToken, setSelectedToken] = useState<ReflectTokenType>(ReflectTokenType.USDCPlus);
  const [amount, setAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numericAmount = parseFloat(amount) || 0;
  const recommendedStrategy = getRecommendedStrategy(numericAmount);

  // Update yield breakdown when amount or token changes
  useEffect(() => {
    if (numericAmount > 0) {
      fetchYieldBreakdown(numericAmount, selectedToken);
    }
  }, [amount, selectedToken]);

  // Handle stake
  const handleStake = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (numericAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (balance && numericAmount > balance) {
      setError('Insufficient balance');
      return;
    }

    setIsStaking(true);
    setError(null);

    try {
      let txId;
      if (selectedToken === ReflectTokenType.USDCPlus) {
        txId = await stakeUSDCPlus(numericAmount);
      } else {
        txId = await stakeUSDJ(numericAmount);
      }

      console.log('Stake transaction:', txId);
      alert('Successfully staked! Transaction: ' + txId.slice(0, 8) + '...');

      // Reset form
      setAmount('');
    } catch (err) {
      console.error('Staking failed:', err);
      setError(err instanceof Error ? err.message : 'Staking failed');
    } finally {
      setIsStaking(false);
    }
  };

  // Handle max amount
  const handleMax = () => {
    if (balance) {
      setAmount(balance.toString());
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Text style={styles.title}>Stake & Earn</Text>
      <Text style={styles.subtitle}>
        Earn dual yields from Reflect stablecoins + Solend lending
      </Text>

      {/* Balance Display */}
      {isConnected && (
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceValue}>${balance?.toFixed(2) || '0.00'}</Text>
        </View>
      )}

      {/* Token Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Token</Text>
        <View style={styles.tokenSelector}>
          <TouchableOpacity
            style={[
              styles.tokenOption,
              selectedToken === ReflectTokenType.USDCPlus && styles.tokenOptionSelected,
            ]}
            onPress={() => setSelectedToken(ReflectTokenType.USDCPlus)}
          >
            <View style={styles.tokenOptionContent}>
              <Text style={styles.tokenName}>USDC+</Text>
              <Text style={styles.tokenAPY}>4.5% APY</Text>
            </View>
            <Text style={styles.tokenDescription}>
              Low-risk stablecoin with native price appreciation
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tokenOption,
              selectedToken === ReflectTokenType.USDJ && styles.tokenOptionSelected,
            ]}
            onPress={() => setSelectedToken(ReflectTokenType.USDJ)}
          >
            <View style={styles.tokenOptionContent}>
              <Text style={styles.tokenName}>USDJ</Text>
              <Text style={styles.tokenAPY}>6.8% APY</Text>
            </View>
            <Text style={styles.tokenDescription}>
              Delta-neutral strategy with funding rate capture
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Amount Input */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Amount</Text>
          {isConnected && (
            <TouchableOpacity onPress={handleMax}>
              <Text style={styles.maxButton}>MAX</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.inputPrefix}>$</Text>
          <TextInput
            style={styles.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={colors.textMuted}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Yield Breakdown */}
      {yieldBreakdown && numericAmount > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estimated Yields</Text>
          <View style={styles.card}>
            <YieldDisplay
              reflectYield={yieldBreakdown.reflectYield}
              solendYield={yieldBreakdown.solendYield}
              totalAPY={yieldBreakdown.totalAPY}
            />

            <View style={styles.projections}>
              <View style={styles.projectionItem}>
                <Text style={styles.projectionLabel}>Daily</Text>
                <Text style={styles.projectionValue}>
                  ${yieldBreakdown.dailyEarnings.toFixed(2)}
                </Text>
              </View>
              <View style={styles.projectionItem}>
                <Text style={styles.projectionLabel}>Monthly</Text>
                <Text style={styles.projectionValue}>
                  ${yieldBreakdown.projectedMonthly.toFixed(2)}
                </Text>
              </View>
              <View style={styles.projectionItem}>
                <Text style={styles.projectionLabel}>Yearly</Text>
                <Text style={styles.projectionValue}>
                  ${yieldBreakdown.projectedYearly.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Recommended Strategy */}
      {recommendedStrategy && (
        <View style={styles.strategyCard}>
          <View style={styles.strategyHeader}>
            <Text style={styles.strategyBadge}>RECOMMENDED</Text>
          </View>
          <Text style={styles.strategyName}>{recommendedStrategy.name}</Text>
          <Text style={styles.strategyDescription}>{recommendedStrategy.description}</Text>
          <View style={styles.strategyDetails}>
            <View style={styles.strategyDetailItem}>
              <Text style={styles.strategyDetailLabel}>Expected APY</Text>
              <Text style={styles.strategyDetailValue}>
                {recommendedStrategy.expectedAPY}%
              </Text>
            </View>
            <View style={styles.strategyDetailItem}>
              <Text style={styles.strategyDetailLabel}>Risk Level</Text>
              <Text
                style={[
                  styles.strategyDetailValue,
                  recommendedStrategy.riskLevel === 'low' && styles.riskLow,
                  recommendedStrategy.riskLevel === 'medium' && styles.riskMedium,
                ]}
              >
                {recommendedStrategy.riskLevel.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Stake Button */}
      <TouchableOpacity
        style={styles.stakeButton}
        onPress={handleStake}
        disabled={!isConnected || isStaking || numericAmount <= 0}
      >
        <LinearGradient
          colors={[colors.yield.reflect, colors.yield.solend]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.stakeButtonGradient}
        >
          {isStaking ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.stakeButtonText}>
              {!isConnected ? 'Connect Wallet' : 'Stake Now'}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>How it works</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>1️⃣</Text>
          <Text style={styles.infoText}>
            Choose between USDC+ (low-risk) or USDJ (higher yield)
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>2️⃣</Text>
          <Text style={styles.infoText}>
            Your funds are staked with Reflect for price appreciation
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>3️⃣</Text>
          <Text style={styles.infoText}>
            Simultaneously earn lending yields from Solend
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>4️⃣</Text>
          <Text style={styles.infoText}>
            Withdraw anytime with accumulated dual yields
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.xl,
  },
  balanceCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  balanceLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs / 2,
  },
  balanceValue: {
    ...typography.h2,
    color: colors.text,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  maxButton: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  tokenSelector: {
    flexDirection: 'row',
  },
  tokenOption: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    padding: spacing.md,
    marginHorizontal: spacing.xs / 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tokenOptionSelected: {
    borderColor: colors.primary,
  },
  tokenOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  tokenName: {
    ...typography.h4,
    color: colors.text,
  },
  tokenAPY: {
    ...typography.caption,
    color: colors.yield.reflect,
    fontWeight: '700',
  },
  tokenDescription: {
    ...typography.caption,
    color: colors.textMuted,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    padding: spacing.md,
  },
  inputPrefix: {
    ...typography.h2,
    color: colors.textMuted,
    marginRight: spacing.sm,
  },
  input: {
    ...typography.h2,
    color: colors.text,
    flex: 1,
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    padding: spacing.md,
  },
  projections: {
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  projectionItem: {
    flex: 1,
    alignItems: 'center',
  },
  projectionLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs / 2,
  },
  projectionValue: {
    ...typography.body,
    color: colors.success,
    fontWeight: '600',
  },
  strategyCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  strategyHeader: {
    marginBottom: spacing.sm,
  },
  strategyBadge: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
    fontSize: 10,
  },
  strategyName: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  strategyDescription: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  strategyDetails: {
    flexDirection: 'row',
  },
  strategyDetailItem: {
    flex: 1,
  },
  strategyDetailLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs / 2,
  },
  strategyDetailValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  riskLow: {
    color: colors.success,
  },
  riskMedium: {
    color: colors.warning,
  },
  errorContainer: {
    backgroundColor: colors.error + '20',
    borderRadius: 8,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    textAlign: 'center',
  },
  stakeButton: {
    marginBottom: spacing.xl,
  },
  stakeButtonGradient: {
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  stakeButtonText: {
    ...typography.button,
    color: '#fff',
  },
  infoSection: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    padding: spacing.md,
  },
  infoTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  infoText: {
    ...typography.body,
    color: colors.textMuted,
    flex: 1,
  },
});
