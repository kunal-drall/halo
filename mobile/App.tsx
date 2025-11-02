/**
 * Halo Protocol Mobile App
 *
 * Privacy-first decentralized lending circles on Solana
 * Powered by Arcium (privacy) and Reflect (dual yields)
 */

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { PrivyProvider } from '@privy-io/expo';
import Toast from 'react-native-toast-message';

import { AppNavigator } from './src/navigation/AppNavigator';
import { SolanaProvider } from './src/contexts/SolanaContext';
import { PrivacyProvider } from './src/contexts/PrivacyContext';
import { YieldProvider } from './src/contexts/YieldContext';
import { LoadingScreen } from './src/screens/LoadingScreen';
import { theme } from './src/theme';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Load any required resources
    const prepare = async () => {
      try {
        // Pre-load fonts, images, etc.
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    };

    prepare();
  }, []);

  if (!isReady) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <PrivyProvider
        appId={process.env.EXPO_PUBLIC_PRIVY_APP_ID || ''}
        clientId={process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID || ''}
      >
        <SolanaProvider>
          <PrivacyProvider>
            <YieldProvider>
              <NavigationContainer theme={theme}>
                <AppNavigator />
                <StatusBar style="light" />
                <Toast />
              </NavigationContainer>
            </YieldProvider>
          </PrivacyProvider>
        </SolanaProvider>
      </PrivyProvider>
    </SafeAreaProvider>
  );
}
