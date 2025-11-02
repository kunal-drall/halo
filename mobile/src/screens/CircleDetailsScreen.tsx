/**
 * Circle Details Screen
 *
 * Detailed view of a single circle with member list
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCircles } from '../hooks';
import { colors, spacing, typography } from '../theme';
import { PrivacyBadge } from '../components/PrivacyBadge';
import { YieldDisplay } from '../components/YieldDisplay';
import type { Circle, Member } from '../services/api';

export const CircleDetailsScreen: React.FC = () => {
  const route = useRoute();
  const { circleId } = (route.params as any) || {};
  const { getCircle, getCircleMembers, joinCircle, isLoading } = useCircles();
  const [circle, setCircle] = useState<Circle | null>(null);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    loadCircleData();
  }, [circleId]);

  const loadCircleData = async () => {
    const circleData = await getCircle(circleId);
    const membersData = await getCircleMembers(circleId);
    setCircle(circleData);
    setMembers(membersData);
  };

  const handleJoin = async () => {
    try {
      await joinCircle(circleId);
      await loadCircleData();
    } catch (error) {
      alert('Failed to join circle');
    }
  };

  if (!circle) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{circle.name || 'Circle'}</Text>
        {circle.privacyMode && <PrivacyBadge type="encrypted" size="md" />}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Circle Stats</Text>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Amount</Text>
            <Text style={styles.statValue}>${circle.totalAmount}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Members</Text>
            <Text style={styles.statValue}>{circle.currentMembers}/{circle.maxMembers}</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <YieldDisplay
          reflectYield={{ name: 'Reflect', apy: circle.reflectYield, earned: 0, color: colors.yield.reflect }}
          solendYield={{ name: 'Solend', apy: circle.solendYield, earned: 0, color: colors.yield.solend }}
          totalAPY={circle.combinedAPY}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Members</Text>
        {members.map((member, index) => (
          <View key={index} style={styles.memberItem}>
            <Text style={styles.memberWallet}>
              {member.isAnonymous ? '🎭 Anonymous' : `${member.wallet.slice(0, 4)}...${member.wallet.slice(-4)}`}
            </Text>
            <Text style={styles.memberContribution}>${member.contribution}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.joinButton} onPress={handleJoin}>
        <LinearGradient
          colors={[colors.primary, colors.privacy.pink]}
          style={styles.joinButtonGradient}
        >
          <Text style={styles.joinButtonText}>Join Circle</Text>
        </LinearGradient>
      </TouchableOpacity>
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
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  stats: {
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.h3,
    color: colors.text,
  },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberWallet: {
    ...typography.body,
    color: colors.text,
  },
  memberContribution: {
    ...typography.body,
    color: colors.textMuted,
  },
  joinButton: {
    marginTop: spacing.lg,
  },
  joinButtonGradient: {
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  joinButtonText: {
    ...typography.button,
    color: '#fff',
  },
});
