/**
 * Circles Screen
 *
 * List of all circles (my circles and available circles)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useCircles } from '../hooks';
import { colors, spacing, typography } from '../theme';
import { PrivacyBadge } from '../components/PrivacyBadge';

export const CirclesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { myCircles, availableCircles, refreshCircles, isLoading } = useCircles();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshCircles();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* My Circles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Circles ({myCircles.length})</Text>
          {myCircles.map((circle) => (
            <TouchableOpacity
              key={circle.id}
              style={styles.circleCard}
              onPress={() =>
                navigation.navigate('CircleDetails' as never, { circleId: circle.id } as never)
              }
            >
              <View style={styles.circleHeader}>
                <Text style={styles.circleName}>{circle.name || 'Circle'}</Text>
                {circle.privacyMode && <PrivacyBadge type="encrypted" size="sm" />}
              </View>
              <View style={styles.circleStats}>
                <Text style={styles.circleStat}>👥 {circle.currentMembers}/{circle.maxMembers}</Text>
                <Text style={styles.circleStat}>💰 ${circle.totalAmount}</Text>
                <Text style={styles.circleStat}>📈 {circle.combinedAPY.toFixed(1)}%</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Available Circles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available to Join ({availableCircles.length})</Text>
          {availableCircles.map((circle) => (
            <TouchableOpacity
              key={circle.id}
              style={styles.circleCard}
              onPress={() =>
                navigation.navigate('CircleDetails' as never, { circleId: circle.id } as never)
              }
            >
              <View style={styles.circleHeader}>
                <Text style={styles.circleName}>{circle.name || 'Circle'}</Text>
                {circle.privacyMode && <PrivacyBadge type="private" size="sm" />}
              </View>
              <View style={styles.circleStats}>
                <Text style={styles.circleStat}>👥 {circle.currentMembers}/{circle.maxMembers}</Text>
                <Text style={styles.circleStat}>💰 ${circle.totalAmount}</Text>
                <Text style={styles.circleStat}>📈 {circle.combinedAPY.toFixed(1)}%</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateCircle' as never)}
      >
        <LinearGradient
          colors={[colors.primary, colors.privacy.pink]}
          style={styles.fabGradient}
        >
          <Text style={styles.fabIcon}>+</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  circleCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  circleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  circleName: {
    ...typography.h4,
    color: colors.text,
  },
  circleStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  circleStat: {
    ...typography.caption,
    color: colors.textMuted,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: '300',
  },
});
