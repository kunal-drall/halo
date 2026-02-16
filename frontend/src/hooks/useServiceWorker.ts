"use client";

import { useEffect, useState } from "react";

export function useServiceWorker() {
  const [isInstalled, setIsInstalled] = useState(false);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        setRegistration(reg);
        setIsInstalled(true);
      })
      .catch((err) => {
        console.warn("SW registration failed:", err);
      });
  }, []);

  return { isInstalled, registration };
}
