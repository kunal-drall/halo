/**
 * Profile Screen - Placeholder
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

export const ProfileScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile Screen - Coming Soon</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  text: { ...typography.h3, color: colors.textMuted },
});
