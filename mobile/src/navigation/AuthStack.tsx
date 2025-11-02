/**
 * Auth Stack
 *
 * Authentication flow for new users
 */

import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { colors, typography } from '../theme';

export type AuthStackParamList = {
  Onboarding: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { ...typography.h3 },
      }}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    </Stack.Navigator>
  );
};
