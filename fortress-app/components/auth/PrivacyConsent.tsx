"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

interface PrivacyConsentProps {
  onConsent: (consents: ConsentState) => void;
  showTitle?: boolean;
  compact?: boolean;
}

export interface ConsentState {
  dataCollection: boolean;
  feedbackUsage: boolean;
  emailNotifications: boolean;
}

export function PrivacyConsent({
  onConsent,
  showTitle = true,
  compact = false,
}: PrivacyConsentProps) {
  const [consents, setConsents] = useState<ConsentState>({
    dataCollection: false,
    feedbackUsage: false,
    emailNotifications: false,
  });

  const handleChange = (key: keyof ConsentState) => {
    const updated = { ...consents, [key]: !consents[key] };
    setConsents(updated);
    onConsent(updated);
  };

  if (compact) {
    return (
      <div className="space-y-3 text-sm">
        <div className="flex items-start gap-3">
          <Checkbox
            id="data-collection"
            checked={consents.dataCollection}
            onChange={() => handleChange("dataCollection")}
          />
          <label
            htmlFor="data-collection"
            className="text-xs leading-relaxed text-muted-foreground cursor-pointer"
          >
            I agree that Fortress may collect my behavioral data (pages viewed, features used) to improve the platform
          </label>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="feedback-usage"
            checked={consents.feedbackUsage}
            onChange={() => handleChange("feedbackUsage")}
          />
          <label
            htmlFor="feedback-usage"
            className="text-xs leading-relaxed text-muted-foreground cursor-pointer"
          >
            I agree that my feedback will be stored and used to improve Fortress Intelligence
          </label>
        </div>

        <div className="text-xs text-muted-foreground/70">
          Read our{" "}
          <Link
            href="/privacy"
            target="_blank"
            className="text-primary hover:underline"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
      {showTitle && (
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-amber-100 mb-1">
              Your Privacy Matters
            </h3>
            <p className="text-sm text-amber-200/80">
              We collect minimal data to improve your experience. Below is exactly what we store and how we use it.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Checkbox
            id="data-collection-full"
            checked={consents.dataCollection}
            onChange={() => handleChange("dataCollection")}
          />
          <div className="flex-1">
            <label
              htmlFor="data-collection-full"
              className="text-sm font-medium cursor-pointer block"
            >
              Behavioral Data Collection
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              We track which stocks you research, which screeners you use, and how long you spend on each page. This helps us understand which features are valuable and where to focus development.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="feedback-usage-full"
            checked={consents.feedbackUsage}
            onChange={() => handleChange("feedbackUsage")}
          />
          <div className="flex-1">
            <label
              htmlFor="feedback-usage-full"
              className="text-sm font-medium cursor-pointer block"
            >
              Feedback Storage & Analysis
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              Your feedback, bug reports, and suggestions are stored in our database. We may email you to follow up, and we use this data to prioritize improvements.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Checkbox
            id="email-notifications"
            checked={consents.emailNotifications}
            onChange={() => handleChange("emailNotifications")}
          />
          <div className="flex-1">
            <label
              htmlFor="email-notifications"
              className="text-sm font-medium cursor-pointer block"
            >
              Product Updates & Alerts (Optional)
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              Receive emails when new features launch or when there are issues with the platform.
            </p>
          </div>
        </div>
      </div>

      <div className="text-xs text-muted-foreground border-t border-amber-500/10 pt-4">
        You can update these preferences anytime in your account settings. For details, see our{" "}
        <Link
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Terms of Service
        </Link>
        .
      </div>
    </div>
  );
}
