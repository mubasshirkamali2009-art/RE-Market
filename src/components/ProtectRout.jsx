"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client"; // adjust path to wherever authClient is exported from

/**
 * Wrap any page's content with this to make it private.
 *
 * Usage:
 *   export default function SomePage() {
 *     return (
 *       <ProtectedRoute>
 *         <YourActualPageContent />
 *       </ProtectedRoute>
 *     );
 *   }
 */
export default function ProtectedRoute({ children, redirectTo = "/sign-in" }) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push(redirectTo);
    }
  }, [isPending, session, router, redirectTo]);

  // Session still loading — show a spinner instead of flashing protected content.
  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
      </div>
    );
  }

  // Not logged in — render nothing while the redirect above kicks in.
  if (!session) {
    return null;
  }

  return <>{children}</>;
}