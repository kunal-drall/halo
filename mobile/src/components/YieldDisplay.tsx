/**
 * Yield Display Component
 *
 * Shows dual yield from Reflect + Solend
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography, shadows } from '../theme';

interface YieldSource {
  name: string;
  apy: number;
  earned: number;
  color: string;
}

interface YieldDisplayProps {
  reflectYield: YieldSource;
  solendYield: YieldSource;
  totalAPY: number;
  onPress?: () => void;
  compact?: boolean;
}

export const YieldDisplay: React.FC<YieldDisplayProps> = ({
  reflectYield,
  solendYield,
  totalAPY,
  onPress,
  compact = false,
}) => {
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatAPY = (apy: number) => {
    return `${apy.toFixed(1)}%`;
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.compactContent}>
          <Text style={styles.compactLabel}>Total APY</Text>
          <Text style={styles.compactValue}>{formatAPY(totalAPY)}</Text>
        </View>
        <View style={styles.compactSources}>
          <View style={[styles.sourceIndicator, { backgroundColor: reflectYield.color }]} />
          <Text style={styles.compactSourceText}>Reflect {formatAPY(reflectYield.apy)}</Text>
          <View style={[styles.sourceIndicator, { backgroundColor: solendYield.color }]} />
          <Text style={styles.compactSourceText}>Solend {formatAPY(solendYield.apy)}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <LinearGradient
        colors={['rgba(168, 85, 247, 0.1)', 'rgba(6, 182, 212, 0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>DUAL YIELD BREAKDOWN</Text>
        </View>

        {/* Yield Sources */}
        <View style={styles.sources}>
          {/* Reflect */}
          <View style={styles.source}>
            <View style={styles.sourceHeader}>
              <View style={[styles.sourceDot, { backgroundColor: reflectYield.color }]} />
              <Text style={styles.sourceName}>{reflectYield.name}</Text>
            </View>
            <Text style={styles.sourceAPY}>{formatAPY(reflectYield.apy)} APY</Text>
            <Text style={styles.sourceEarned}>+{formatCurrency(reflectYield.earned)}</Text>
          </View>

          <View style={styles.divider} />

          {/* Solend */}
          <View style={styles.source}>
            <View style={styles.sourceHeader}>
              <View style={[styles.sourceDot, { backgroundColor: solendYield.color }]} />
              <Text style={styles.sourceName}>{solendYield.name}</Text>
            </View>
            <Text style={styles.sourceAPY}>{formatAPY(solendYield.apy)} APY</Text>
            <Text style={styles.sourceEarned}>+{formatCurrency(solendYield.earned)}</Text>
          </View>
        </View>

        {/* Total */}
        <View style={styles.totalContainer}>
          <View style={styles.totalDivider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Combined APY</Text>
            <Text style={styles.totalValue}>{formatAPY(totalAPY)} 📈</Text>
          </View>
          <View style={styles.earningsRow}>
            <Text style={styles.earningsLabel}>24h Earnings</Text>
            <Text style={styles.earningsValue}>
              +{formatCurrency(reflectYield.earned + solendYield.earned)}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
    ...shadows.md,
  },
  header: {
    marginBottom: spacing.md,
  },
  title: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 1,
  },
  sources: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  source: {
    flex: 1,
  },
  sourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.xs,
  },
  sourceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sourceName: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  sourceAPY: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  sourceEarned: {
    ...typography.bodySmall,
    color: colors.yield.green,
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  totalContainer: {
    marginTop: spacing.sm,
  },
  totalDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  totalLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  totalValue: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '700',
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  earningsLabel: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  earningsValue: {
    ...typography.body,
    color: colors.yield.green,
    fontWeight: '600',
  },
  // Compact styles
  compactContainer: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compactContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  compactLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  compactValue: {
    ...typography.h4,
    color: colors.text,
    fontWeight: '700',
  },
  compactSources: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sourceIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  compactSourceText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
