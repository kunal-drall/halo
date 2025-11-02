/**
 * Main Tab Navigator
 *
 * Bottom tab navigation for authenticated users
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, View, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme';

// Import screens (will be implemented)
import { HomeScreen } from '../screens/HomeScreen';
import { StakeScreen } from '../screens/StakeScreen';
import { CirclesScreen } from '../screens/CirclesScreen';
import { CircleDetailsScreen } from '../screens/CircleDetailsScreen';
import { CreateCircleFlow } from '../screens/CreateCircleFlow';
import { BorrowScreen } from '../screens/BorrowScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { YieldDashboardScreen } from '../screens/YieldDashboardScreen';
import { PrivacySettingsScreen } from '../screens/PrivacySettingsScreen';

export type MainTabParamList = {
  HomeTab: undefined;
  CirclesTab: undefined;
  StakeTab: undefined;
  ProfileTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  YieldDashboard: undefined;
};

export type CirclesStackParamList = {
  CirclesList: undefined;
  CircleDetails: { circleId: string };
  CreateCircle: undefined;
  Borrow: { circleId: string };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  PrivacySettings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const CirclesStack = createStackNavigator<CirclesStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

// Tab Icons Component
const TabIcon: React.FC<{ icon: string; focused: boolean; label: string }> = ({
  icon,
  focused,
  label,
}) => {
  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{icon}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{label}</Text>
    </View>
  );
};

// Home Stack Navigator
const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { ...typography.h3 },
      }}
    >
      <HomeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="YieldDashboard"
        component={YieldDashboardScreen}
        options={{ title: 'Yield Analytics' }}
      />
    </HomeStack.Navigator>
  );
};

// Circles Stack Navigator
const CirclesStackNavigator = () => {
  return (
    <CirclesStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { ...typography.h3 },
      }}
    >
      <CirclesStack.Screen
        name="CirclesList"
        component={CirclesScreen}
        options={{ title: 'Circles' }}
      />
      <CirclesStack.Screen
        name="CircleDetails"
        component={CircleDetailsScreen}
        options={{ title: 'Circle Details' }}
      />
      <CirclesStack.Screen
        name="CreateCircle"
        component={CreateCircleFlow}
        options={{ title: 'Create Circle', presentation: 'modal' }}
      />
      <CirclesStack.Screen
        name="Borrow"
        component={BorrowScreen}
        options={{ title: 'Borrow' }}
      />
    </CirclesStack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { ...typography.h3 },
      }}
    >
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <ProfileStack.Screen
        name="PrivacySettings"
        component={PrivacySettingsScreen}
        options={{ title: 'Privacy Settings' }}
      />
    </ProfileStack.Navigator>
  );
};

// Main Tab Navigator
export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏠" focused={focused} label="Home" />
          ),
        }}
      />
      <Tab.Screen
        name="CirclesTab"
        component={CirclesStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="⭕" focused={focused} label="Circles" />
          ),
        }}
      />
      <Tab.Screen
        name="StakeTab"
        component={StakeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="💰" focused={focused} label="Stake" />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👤" focused={focused} label="Profile" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 80,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: spacing.xs / 2,
    opacity: 0.6,
  },
  tabIconFocused: {
    opacity: 1,
  },
  tabLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 11,
  },
  tabLabelFocused: {
    color: colors.primary,
    fontWeight: '600',
  },
});
