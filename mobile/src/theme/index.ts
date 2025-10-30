/**
 * Halo Protocol Theme
 *
 * Design system with privacy and yield-focused color scheme
 */

import { DefaultTheme } from '@react-navigation/native';

export const colors = {
  // Primary colors
  primary: '#a855f7', // Purple
  primaryDark: '#7c3aed',
  primaryLight: '#c084fc',

  // Privacy theme
  privacy: {
    purple: '#a855f7',
    pink: '#ec4899',
    cyan: '#06b6d4',
    arcium: '#8b5cf6',
  },

  // Yield theme
  yield: {
    green: '#10b981',
    reflect: '#22c55e',
    solend: '#3b82f6',
  },

  // Background
  background: '#0f172a', // Dark blue
  backgroundLight: '#1e293b',
  backgroundCard: '#1e293b',

  // Surface
  surface: '#334155',
  surfaceLight: '#475569',

  // Text
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',

  // Status
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Functional
  border: '#334155',
  divider: '#1e293b',

  // Overlay
  overlay: 'rgba(15, 23, 42, 0.8)',

  // Gradients
  gradients: {
    privacy: ['#a855f7', '#ec4899'],
    yield: ['#10b981', '#06b6d4'],
    primary: ['#7c3aed', '#a855f7'],
    dark: ['#0f172a', '#1e293b'],
  },
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

export const theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.backgroundCard,
    text: colors.text,
    border: colors.border,
    notification: colors.primary,
  },
};

export type Theme = typeof theme;
