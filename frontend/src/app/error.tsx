"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="glass-card p-8 max-w-md text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
        <p className="text-neutral-400 mb-6">
          An unexpected error occurred. Please try again.
        </p>
        <Button onClick={() => reset()}>Try Again</Button>
      </div>
    </div>
  );
}
