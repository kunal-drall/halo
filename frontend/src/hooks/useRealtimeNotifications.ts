"use client";

import { useEffect, useCallback, useRef } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

type Notification = {
  id: string;
  type: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
  read: boolean;
  created_at: string;
};

type UseRealtimeNotificationsOptions = {
  onNotification?: (notification: Notification) => void;
  enabled?: boolean;
};

export function useRealtimeNotifications({
  onNotification,
  enabled = true,
}: UseRealtimeNotificationsOptions = {}) {
  const { publicKey } = useWallet();
  const channelRef = useRef<ReturnType<typeof createChannel> | null>(null);

  // Dynamic import for Supabase to keep lazy loading
  const createChannel = useCallback(async () => {
    if (!publicKey || !enabled) return null;

    try {
      const { getSupabase } = await import("@/lib/supabase");
      const supabase = getSupabase();
      const wallet = publicKey.toBase58();

      // First fetch user ID
      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("wallet_address", wallet)
        .single();

      if (!user) return null;

      const channel = supabase
        .channel(`notifications:${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const notification = payload.new as Notification;
            onNotification?.(notification);
          }
        )
        .subscribe();

      return channel;
    } catch {
      console.warn("Realtime notifications not available");
      return null;
    }
  }, [publicKey, enabled, onNotification]);

  useEffect(() => {
    let channel: Awaited<ReturnType<typeof createChannel>> = null;

    createChannel().then((ch) => {
      channel = ch;
    });

    return () => {
      if (channel) {
        import("@/lib/supabase").then(({ getSupabase }) => {
          getSupabase().removeChannel(channel!);
        });
      }
    };
  }, [createChannel]);
}
