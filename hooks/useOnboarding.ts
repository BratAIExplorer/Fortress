import { useState, useCallback } from "react";

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(false);

  const completeOnboarding = useCallback(async () => {
    setShowOnboarding(false);
  }, []);

  return {
    showOnboarding,
    loading,
    completeOnboarding,
  };
}
