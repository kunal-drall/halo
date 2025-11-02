/**
 * Create Circle Flow
 *
 * Multi-step flow to create a new circle with privacy options
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useCircles, usePrivacy, PrivacyMode } from '../hooks';
import { colors, spacing, typography } from '../theme';
import { PrivacyBadge } from '../components/PrivacyBadge';

export const CreateCircleFlow: React.FC = () => {
  const navigation = useNavigation();
  const { createCircle, isCreating } = useCircles();
  const { settings } = usePrivacy();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('30');
  const [members, setMembers] = useState('10');
  const [privacyMode, setPrivacyMode] = useState<PrivacyMode>(settings.defaultMode);

  const handleCreate = async () => {
    try {
      const circleId = await createCircle({
        name,
        amount: parseFloat(amount),
        duration: parseInt(duration),
        members: parseInt(members),
        privacyMode,
      });

      alert('Circle created successfully!');
      navigation.goBack();
    } catch (error) {
      alert('Failed to create circle');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create New Circle</Text>

      <View style={styles.field}>
        <Text style={styles.label}>Circle Name (Optional)</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="My Circle"
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Total Amount ($)</Text>
        <TextInput
          style={styles.input}
          value={amount}
          onChangeText={setAmount}
          placeholder="1000"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Duration (days)</Text>
        <TextInput
          style={styles.input}
          value={duration}
          onChangeText={setDuration}
          placeholder="30"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Max Members</Text>
        <TextInput
          style={styles.input}
          value={members}
          onChangeText={setMembers}
          placeholder="10"
          placeholderTextColor={colors.textMuted}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Privacy Mode</Text>
        <TouchableOpacity
          style={[styles.privacyOption, privacyMode === PrivacyMode.Public && styles.privacyOptionSelected]}
          onPress={() => setPrivacyMode(PrivacyMode.Public)}
        >
          <PrivacyBadge type="public" size="sm" />
          <Text style={styles.privacyOptionText}>Public</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.privacyOption, privacyMode === PrivacyMode.Anonymous && styles.privacyOptionSelected]}
          onPress={() => setPrivacyMode(PrivacyMode.Anonymous)}
        >
          <PrivacyBadge type="anonymous" size="sm" />
          <Text style={styles.privacyOptionText}>Anonymous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.privacyOption, privacyMode === PrivacyMode.FullyEncrypted && styles.privacyOptionSelected]}
          onPress={() => setPrivacyMode(PrivacyMode.FullyEncrypted)}
        >
          <PrivacyBadge type="encrypted" size="sm" showArcium />
          <Text style={styles.privacyOptionText}>Fully Encrypted</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreate}
        disabled={isCreating || !amount || !duration || !members}
      >
        <LinearGradient
          colors={[colors.primary, colors.privacy.pink]}
          style={styles.createButtonGradient}
        >
          {isCreating ? <ActivityIndicator color="#fff" /> : <Text style={styles.createButtonText}>Create Circle</Text>}
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.xl },
  field: { marginBottom: spacing.lg },
  label: { ...typography.body, color: colors.text, marginBottom: spacing.sm, fontWeight: '600' },
  input: {
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
  },
  privacyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  privacyOptionSelected: { borderColor: colors.primary },
  privacyOptionText: { ...typography.body, color: colors.text, marginLeft: spacing.sm },
  createButton: { marginTop: spacing.xl },
  createButtonGradient: {
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
  },
  createButtonText: { ...typography.button, color: '#fff' },
});
