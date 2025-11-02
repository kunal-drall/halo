/**
 * App Navigator
 *
 * Root navigator that switches between auth and main app
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { usePrivy } from '@privy-io/expo';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { MainTabNavigator } from './MainTabNavigator';
import { AuthStack } from './AuthStack';
import { colors } from '../theme';

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { isReady, authenticated } = usePrivy();

  // Show loading spinner while Privy initializes
  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      {authenticated ? (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthStack} />
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
