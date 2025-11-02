/**
 * Privacy Badge Component
 *
 * Shows privacy status with Arcium branding
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { colors, spacing, borderRadius, typography } from '../theme';

interface PrivacyBadgeProps {
  type: 'encrypted' | 'private' | 'anonymous' | 'public';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showArcium?: boolean;
}

export const PrivacyBadge: React.FC<PrivacyBadgeProps> = ({
  type,
  size = 'md',
  showLabel = true,
  showArcium = false,
}) => {
  const iconSize = size === 'sm' ? 16 : size === 'md' ? 20 : 24;
  const textSize = size === 'sm' ? 12 : size === 'md' ? 14 : 16;

  const config = {
    encrypted: {
      label: 'Encrypted',
      icon: '🔒',
      gradient: [colors.privacy.purple, colors.privacy.pink],
    },
    private: {
      label: 'Private',
      icon: '🔒',
      gradient: [colors.privacy.purple, colors.privacy.cyan],
    },
    anonymous: {
      label: 'Anonymous',
      icon: '👤',
      gradient: [colors.privacy.arcium, colors.privacy.purple],
    },
    public: {
      label: 'Public',
      icon: '👁️',
      gradient: [colors.surface, colors.surfaceLight],
    },
  };

  const current = config[type];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={current.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.badge,
          size === 'sm' && styles.badgeSm,
          size === 'lg' && styles.badgeLg,
        ]}
      >
        <Text style={[styles.icon, { fontSize: iconSize }]}>{current.icon}</Text>
        {showLabel && (
          <Text style={[styles.label, { fontSize: textSize }]}>
            {current.label}
          </Text>
        )}
      </LinearGradient>

      {showArcium && type !== 'public' && (
        <Text style={styles.arciumText}>Powered by Arcium</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  badgeSm: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  badgeLg: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  icon: {
    lineHeight: 20,
  },
  label: {
    color: colors.text,
    fontWeight: '600',
  },
  arciumText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs / 2,
    fontSize: 10,
  },
});
