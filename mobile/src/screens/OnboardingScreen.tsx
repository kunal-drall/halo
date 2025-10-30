/**
 * Onboarding Screen
 *
 * First-time user experience with wallet connection and privacy setup
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWallet, usePrivacy, useYield, PrivacyMode } from '../hooks';
import { colors, spacing, typography } from '../theme';
import { PrivacyBadge } from '../components/PrivacyBadge';

const ONBOARDING_STEPS = [
  {
    title: 'Welcome to Halo',
    description: 'Community-based lending with privacy and dual yield generation',
    icon: '👋',
  },
  {
    title: 'Privacy First',
    description: 'Encrypted trust scores, private borrowing, and anonymous participation powered by Arcium',
    icon: '🔒',
  },
  {
    title: 'Dual Yield Generation',
    description: 'Earn from Reflect stablecoins (USDC+, USDJ) plus Solend lending for maximum returns',
    icon: '💰',
  },
  {
    title: 'Connect Your Wallet',
    description: 'Get started by connecting your Solana wallet',
    icon: '🌐',
  },
];

export const OnboardingScreen: React.FC = () => {
  const { connect, isLoading: walletLoading } = useWallet();
  const { updateSettings, initializeArcium } = usePrivacy();
  const { initializeReflect } = useYield();
  const [currentStep, setCurrentStep] = useState(0);
  const [privacyPreference, setPrivacyPreference] = useState<PrivacyMode>(PrivacyMode.Public);
  const [isInitializing, setIsInitializing] = useState(false);

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  // Handle next step
  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle back
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle wallet connection and initialization
  const handleConnect = async () => {
    setIsInitializing(true);

    try {
      // Connect wallet
      await connect();

      // Initialize privacy settings
      await updateSettings({
        defaultMode: privacyPreference,
        encryptTrustScore: privacyPreference !== PrivacyMode.Public,
        enableAnonymousMode: privacyPreference === PrivacyMode.Anonymous,
        arciumEnabled: privacyPreference !== PrivacyMode.Public,
      });

      // Initialize Arcium if privacy enabled
      if (privacyPreference !== PrivacyMode.Public) {
        await initializeArcium();
      }

      // Initialize Reflect for yield
      await initializeReflect();

      console.log('Onboarding complete!');
    } catch (error) {
      console.error('Onboarding failed:', error);
      alert('Failed to complete onboarding. Please try again.');
    } finally {
      setIsInitializing(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    // Step 4: Wallet connection with privacy setup
    if (currentStep === 3) {
      return (
        <View style={styles.stepContent}>
          <Text style={styles.stepIcon}>{currentStepData.icon}</Text>
          <Text style={styles.stepTitle}>{currentStepData.title}</Text>
          <Text style={styles.stepDescription}>{currentStepData.description}</Text>

          <View style={styles.privacySelection}>
            <Text style={styles.privacyTitle}>Choose Your Privacy Level:</Text>

            {/* Public Mode */}
            <TouchableOpacity
              style={[
                styles.privacyOption,
                privacyPreference === PrivacyMode.Public && styles.privacyOptionSelected,
              ]}
              onPress={() => setPrivacyPreference(PrivacyMode.Public)}
            >
              <View style={styles.privacyOptionHeader}>
                <PrivacyBadge type="public" size="sm" />
                <Text style={styles.privacyOptionTitle}>Public</Text>
              </View>
              <Text style={styles.privacyOptionDescription}>
                Standard mode with visible trust scores and activity
              </Text>
            </TouchableOpacity>

            {/* Anonymous Mode */}
            <TouchableOpacity
              style={[
                styles.privacyOption,
                privacyPreference === PrivacyMode.Anonymous && styles.privacyOptionSelected,
              ]}
              onPress={() => setPrivacyPreference(PrivacyMode.Anonymous)}
            >
              <View style={styles.privacyOptionHeader}>
                <PrivacyBadge type="anonymous" size="sm" />
                <Text style={styles.privacyOptionTitle}>Anonymous</Text>
              </View>
              <Text style={styles.privacyOptionDescription}>
                Participate in circles without revealing your identity
              </Text>
            </TouchableOpacity>

            {/* Fully Encrypted Mode */}
            <TouchableOpacity
              style={[
                styles.privacyOption,
                privacyPreference === PrivacyMode.FullyEncrypted && styles.privacyOptionSelected,
              ]}
              onPress={() => setPrivacyPreference(PrivacyMode.FullyEncrypted)}
            >
              <View style={styles.privacyOptionHeader}>
                <PrivacyBadge type="encrypted" size="sm" showArcium />
                <Text style={styles.privacyOptionTitle}>Fully Encrypted</Text>
              </View>
              <Text style={styles.privacyOptionDescription}>
                Maximum privacy with encrypted trust scores and private loans
              </Text>
            </TouchableOpacity>
          </View>

          {/* Connect Button */}
          <TouchableOpacity
            style={styles.connectButton}
            onPress={handleConnect}
            disabled={walletLoading || isInitializing}
          >
            <LinearGradient
              colors={[colors.primary, colors.privacy.pink]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.connectButtonGradient}
            >
              {walletLoading || isInitializing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.connectButtonText}>Connect Wallet</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      );
    }

    // Steps 1-3: Feature highlights
    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepIcon}>{currentStepData.icon}</Text>
        <Text style={styles.stepTitle}>{currentStepData.title}</Text>
        <Text style={styles.stepDescription}>{currentStepData.description}</Text>

        {/* Feature highlights based on step */}
        {currentStep === 1 && (
          <View style={styles.features}>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🔐</Text>
              <Text style={styles.featureText}>Encrypted Trust Scores</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🎭</Text>
              <Text style={styles.featureText}>Anonymous Participation</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🤫</Text>
              <Text style={styles.featureText}>Private Borrowing</Text>
            </View>
          </View>
        )}

        {currentStep === 2 && (
          <View style={styles.features}>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>📈</Text>
              <Text style={styles.featureText}>USDC+ 4.5% APY</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🚀</Text>
              <Text style={styles.featureText}>USDJ 6.8% APY</Text>
            </View>
            <View style={styles.feature}>
              <Text style={styles.featureIcon}>🔄</Text>
              <Text style={styles.featureText}>Combined Yields</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Indicators */}
        <View style={styles.progressContainer}>
          {ONBOARDING_STEPS.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                index === currentStep && styles.progressDotActive,
                index < currentStep && styles.progressDotCompleted,
              ]}
            />
          ))}
        </View>

        {/* Step Content */}
        {renderStepContent()}
      </ScrollView>

      {/* Navigation Buttons */}
      {!isLastStep && (
        <View style={styles.navigation}>
          {currentStep > 0 && (
            <TouchableOpacity style={styles.navButton} onPress={handleBack}>
              <Text style={styles.navButtonText}>Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.navButton, styles.navButtonPrimary]}
            onPress={handleNext}
          >
            <LinearGradient
              colors={[colors.primary, colors.privacy.pink]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.navButtonGradient}
            >
              <Text style={styles.navButtonTextPrimary}>Next</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl * 2,
    paddingBottom: spacing.xl,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl * 2,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs / 2,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
    width: 30,
  },
  progressDotCompleted: {
    backgroundColor: colors.success,
  },
  stepContent: {
    flex: 1,
    alignItems: 'center',
  },
  stepIcon: {
    fontSize: 80,
    marginBottom: spacing.xl,
  },
  stepTitle: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  stepDescription: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  features: {
    width: '100%',
    marginTop: spacing.xl,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  featureIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  featureText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  privacySelection: {
    width: '100%',
    marginTop: spacing.lg,
  },
  privacyTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  privacyOption: {
    backgroundColor: colors.backgroundCard,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  privacyOptionSelected: {
    borderColor: colors.primary,
  },
  privacyOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  privacyOptionTitle: {
    ...typography.h4,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  privacyOptionDescription: {
    ...typography.caption,
    color: colors.textMuted,
  },
  connectButton: {
    width: '100%',
    marginTop: spacing.xl,
  },
  connectButtonGradient: {
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  connectButtonText: {
    ...typography.button,
    color: '#fff',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  navButton: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
  navButtonPrimary: {
    flex: 2,
  },
  navButtonGradient: {
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonText: {
    ...typography.button,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  navButtonTextPrimary: {
    ...typography.button,
    color: '#fff',
  },
});
