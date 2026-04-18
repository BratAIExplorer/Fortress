import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export function useOnboarding() {
  const sessionData = useSession();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionData || !sessionData.data?.user) {
      setLoading(false);
      return;
    }

    const session = sessionData.data;
    // Check if user has completed onboarding
    const hasSeenOnboarding = (session.user as any).hasSeenOnboarding;

    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }

    setLoading(false);
  }, [sessionData]);

  const completeOnboarding = async () => {
    try {
      const response = await fetch("/api/auth/onboarding-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hasSeenOnboarding: true }),
      });

      if (!response.ok) {
        throw new Error("Failed to update onboarding status");
      }

      setShowOnboarding(false);
    } catch (error) {
      console.error("Error updating onboarding status:", error);
      // Still close the modal even if API fails
      setShowOnboarding(false);
    }
  };

  return {
    showOnboarding,
    loading,
    completeOnboarding,
  };
}
