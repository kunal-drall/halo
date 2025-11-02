/**
 * API Service
 *
 * Handles communication with backend API
 */

import { PublicKey } from '@solana/web3.js';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface Circle {
  id: string;
  creator: string;
  name: string;
  totalAmount: number;
  duration: number;
  maxMembers: number;
  currentMembers: number;
  privacyMode?: string;
  reflectYield: number;
  solendYield: number;
  combinedAPY: number;
  status: 'active' | 'completed' | 'defaulted';
  createdAt: number;
}

interface Member {
  wallet: string;
  trustScore: number;
  joinedAt: number;
  contribution: number;
  isAnonymous: boolean;
}

interface LoanRequest {
  id: string;
  circleId: string;
  borrower: string;
  amount: number;
  interestRate: number;
  duration: number;
  status: 'pending' | 'approved' | 'rejected' | 'repaid';
  privacyEnabled: boolean;
  createdAt: number;
}

interface NotificationPreferences {
  circleUpdates: boolean;
  yieldAlerts: boolean;
  loanRequests: boolean;
  trustScoreChanges: boolean;
  pushEnabled: boolean;
}

class ApiService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private async fetch<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
        ...options.headers,
      };

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error: error || 'Request failed' };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Circles
  async getCircles(filter?: {
    status?: string;
    privacyMode?: string;
  }): Promise<ApiResponse<Circle[]>> {
    const params = new URLSearchParams(filter as any);
    return this.fetch<Circle[]>(`/circles?${params}`);
  }

  async getCircle(circleId: string): Promise<ApiResponse<Circle>> {
    return this.fetch<Circle>(`/circles/${circleId}`);
  }

  async createCircle(params: {
    amount: number;
    duration: number;
    members: number;
    name?: string;
    privacyMode?: string;
  }): Promise<ApiResponse<{ circleId: string; txId: string }>> {
    return this.fetch('/circles', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async joinCircle(circleId: string, params: {
    wallet: string;
    anonymous?: boolean;
  }): Promise<ApiResponse<{ txId: string }>> {
    return this.fetch(`/circles/${circleId}/join`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  // Circle Members
  async getCircleMembers(circleId: string): Promise<ApiResponse<Member[]>> {
    return this.fetch<Member[]>(`/circles/${circleId}/members`);
  }

  // Loans
  async getLoanRequests(circleId: string): Promise<ApiResponse<LoanRequest[]>> {
    return this.fetch<LoanRequest[]>(`/circles/${circleId}/loans`);
  }

  async createLoanRequest(params: {
    circleId: string;
    amount: number;
    duration: number;
    privacyEnabled?: boolean;
  }): Promise<ApiResponse<{ loanId: string; txId: string }>> {
    return this.fetch('/loans', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async approveLoan(loanId: string): Promise<ApiResponse<{ txId: string }>> {
    return this.fetch(`/loans/${loanId}/approve`, {
      method: 'POST',
    });
  }

  async repayLoan(loanId: string, amount: number): Promise<ApiResponse<{ txId: string }>> {
    return this.fetch(`/loans/${loanId}/repay`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  // Trust Scores
  async getTrustScore(wallet: string): Promise<ApiResponse<{
    score: number;
    encrypted: boolean;
    lastUpdated: number;
  }>> {
    return this.fetch(`/trust-score/${wallet}`);
  }

  async updateTrustScore(wallet: string, score: number): Promise<ApiResponse<{ txId: string }>> {
    return this.fetch(`/trust-score/${wallet}`, {
      method: 'PUT',
      body: JSON.stringify({ score }),
    });
  }

  // Yield Analytics
  async getYieldAnalytics(wallet: string): Promise<ApiResponse<{
    totalStaked: number;
    totalEarned: number;
    reflectYield: number;
    solendYield: number;
    positions: any[];
  }>> {
    return this.fetch(`/yield/${wallet}`);
  }

  async getYieldHistory(wallet: string, period: '7d' | '30d' | '90d' | '1y'): Promise<ApiResponse<{
    timestamps: number[];
    values: number[];
    reflectValues: number[];
    solendValues: number[];
  }>> {
    return this.fetch(`/yield/${wallet}/history?period=${period}`);
  }

  // Notifications
  async registerPushToken(token: string, wallet: string): Promise<ApiResponse<void>> {
    return this.fetch('/notifications/register', {
      method: 'POST',
      body: JSON.stringify({ token, wallet }),
    });
  }

  async getNotificationPreferences(wallet: string): Promise<ApiResponse<NotificationPreferences>> {
    return this.fetch(`/notifications/preferences/${wallet}`);
  }

  async updateNotificationPreferences(
    wallet: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<ApiResponse<void>> {
    return this.fetch(`/notifications/preferences/${wallet}`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // Privacy
  async getPrivacySettings(wallet: string): Promise<ApiResponse<{
    defaultMode: string;
    encryptTrustScore: boolean;
    enableAnonymousMode: boolean;
    allowPublicStats: boolean;
  }>> {
    return this.fetch(`/privacy/${wallet}`);
  }

  async updatePrivacySettings(wallet: string, settings: any): Promise<ApiResponse<void>> {
    return this.fetch(`/privacy/${wallet}`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: number }>> {
    return this.fetch('/health');
  }
}

export const apiService = new ApiService();
export type { Circle, Member, LoanRequest, NotificationPreferences };
