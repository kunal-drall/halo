/**
 * Notifications Service
 *
 * Handles push notifications and in-app notifications
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { apiService } from './api';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export enum NotificationType {
  CircleCreated = 'circle_created',
  CircleJoined = 'circle_joined',
  CircleCompleted = 'circle_completed',
  LoanRequest = 'loan_request',
  LoanApproved = 'loan_approved',
  LoanRepaid = 'loan_repaid',
  YieldAlert = 'yield_alert',
  TrustScoreUpdated = 'trust_score_updated',
  PayoutReceived = 'payout_received',
}

interface NotificationData {
  type: NotificationType;
  title: string;
  body: string;
  data?: any;
}

class NotificationsService {
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  // Initialize notifications
  async initialize(walletAddress: string): Promise<void> {
    try {
      // Check if running on physical device
      if (!Device.isDevice) {
        console.warn('Push notifications only work on physical devices');
        return;
      }

      // Request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Failed to get push notification permissions');
        return;
      }

      // Get Expo push token
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_PROJECT_ID || 'your-project-id',
      });

      this.expoPushToken = token.data;
      console.log('Expo push token:', this.expoPushToken);

      // Register token with backend
      await apiService.registerPushToken(this.expoPushToken, walletAddress);

      // Set up notification listeners
      this.setupListeners();

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#a855f7',
        });
      }
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  // Set up notification listeners
  private setupListeners() {
    // Listen for notifications while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received:', notification);
        this.handleNotificationReceived(notification);
      }
    );

    // Listen for user interactions with notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notification response:', response);
        this.handleNotificationResponse(response);
      }
    );
  }

  // Handle notification received while app is open
  private handleNotificationReceived(notification: Notifications.Notification) {
    const { type, data } = notification.request.content.data as any;

    switch (type) {
      case NotificationType.LoanRequest:
        console.log('New loan request:', data);
        break;
      case NotificationType.YieldAlert:
        console.log('Yield alert:', data);
        break;
      case NotificationType.TrustScoreUpdated:
        console.log('Trust score updated:', data);
        break;
      default:
        console.log('Unknown notification type:', type);
    }
  }

  // Handle user tapping on notification
  private handleNotificationResponse(response: Notifications.NotificationResponse) {
    const { type, data } = response.notification.request.content.data as any;

    // Navigation implementation - see GitHub issue #16 for details
    switch (type) {
      case NotificationType.CircleJoined:
      case NotificationType.CircleCompleted:
        console.log('Navigate to circle:', data.circleId);
        break;
      case NotificationType.LoanRequest:
      case NotificationType.LoanApproved:
        console.log('Navigate to loan:', data.loanId);
        break;
      case NotificationType.YieldAlert:
        console.log('Navigate to yield dashboard');
        break;
      default:
        console.log('Navigate to home');
    }
  }

  // Schedule local notification
  async scheduleNotification(notification: NotificationData, delaySeconds: number = 0) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: {
            type: notification.type,
            ...notification.data,
          },
          sound: true,
        },
        trigger: delaySeconds > 0 ? { seconds: delaySeconds } : null,
      });
    } catch (error) {
      console.error('Failed to schedule notification:', error);
    }
  }

  // Send immediate local notification
  async sendLocalNotification(notification: NotificationData) {
    await this.scheduleNotification(notification, 0);
  }

  // Cancel all scheduled notifications
  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Get badge count
  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  // Set badge count
  async setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
  }

  // Clear badge
  async clearBadge() {
    await Notifications.setBadgeCountAsync(0);
  }

  // Clean up listeners
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // Predefined notification templates
  templates = {
    circleCreated: (circleName: string, amount: number): NotificationData => ({
      type: NotificationType.CircleCreated,
      title: 'Circle Created',
      body: `Your circle "${circleName}" has been created with $${amount}!`,
    }),

    circleJoined: (circleName: string, memberName: string): NotificationData => ({
      type: NotificationType.CircleJoined,
      title: 'New Member',
      body: `${memberName} joined your circle "${circleName}"`,
    }),

    loanRequest: (amount: number, circleName: string): NotificationData => ({
      type: NotificationType.LoanRequest,
      title: 'Loan Request',
      body: `New loan request for $${amount} in "${circleName}"`,
    }),

    loanApproved: (amount: number): NotificationData => ({
      type: NotificationType.LoanApproved,
      title: 'Loan Approved',
      body: `Your loan request for $${amount} has been approved!`,
    }),

    yieldAlert: (amount: number, apy: number): NotificationData => ({
      type: NotificationType.YieldAlert,
      title: 'Yield Milestone',
      body: `You've earned $${amount.toFixed(2)} at ${apy}% APY!`,
    }),

    trustScoreUpdated: (newScore: number, change: number): NotificationData => ({
      type: NotificationType.TrustScoreUpdated,
      title: 'Trust Score Updated',
      body: `Your trust score is now ${newScore} (${change > 0 ? '+' : ''}${change})`,
    }),

    payoutReceived: (amount: number, circleName: string): NotificationData => ({
      type: NotificationType.PayoutReceived,
      title: 'Payout Received',
      body: `You received $${amount} from circle "${circleName}"`,
    }),
  };
}

export const notificationsService = new NotificationsService();
export type { NotificationData };
