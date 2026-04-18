"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Zap, Shield, TrendingUp } from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => Promise<void>;
}

export default function OnboardingModal({ isOpen, onClose, onComplete }: OnboardingModalProps) {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const steps = [
    {
      icon: Shield,
      title: "Welcome to Fortress Intelligence",
      description: "Your AI-powered investment command center for the NRI diaspora market.",
    },
    {
      icon: Zap,
      title: "Investment Genie",
      description: "Get personalized portfolio allocations based on your risk profile, market conditions, and macro environment.",
    },
    {
      icon: TrendingUp,
      title: "Real-Time Market Data",
      description: "Live market intelligence, macro snapshots, and scan results to guide your investment decisions.",
    },
    {
      icon: CheckCircle,
      title: "You're All Set!",
      description: "Start exploring your dashboard and generate your first allocation.",
    },
  ];

  const handleNext = async () => {
    if (currentStep === steps.length - 1) {
      // Final step - mark onboarding as complete
      setLoading(true);
      try {
        await onComplete();
        onClose();
      } finally {
        setLoading(false);
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await onComplete();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const Step = steps[currentStep];
  const IconComponent = Step.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full border-primary/20 bg-card backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-2xl border border-primary/20">
              <IconComponent className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-serif font-bold">{Step.title}</CardTitle>
          <CardDescription className="text-base mt-2">{Step.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress indicator */}
          <div className="flex gap-2 justify-center">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index <= currentStep ? "bg-primary w-6" : "bg-muted w-2"
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={loading}
                className="flex-1"
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Saving..." : currentStep === steps.length - 1 ? "Get Started" : "Next"}
            </Button>
          </div>

          {currentStep < steps.length - 1 && (
            <Button
              variant="ghost"
              onClick={handleSkip}
              disabled={loading}
              className="w-full text-muted-foreground"
            >
              Skip Tour
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
