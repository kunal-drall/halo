import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="glass-card p-8 max-w-md text-center">
        <h2 className="text-6xl font-bold text-white mb-4">404</h2>
        <p className="text-xl text-white mb-2">Page not found</p>
        <p className="text-neutral-400 mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}
