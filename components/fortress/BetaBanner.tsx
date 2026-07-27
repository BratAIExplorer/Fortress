"use client";

import { useState, useEffect } from "react";
import { X, MessageSquarePlus } from "lucide-react";
import { FeedbackModal } from "./FeedbackModal";

const DISMISS_KEY = "fortress-beta-banner-dismissed";

export function BetaBanner() {
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(true); // default hidden until we know
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");

    fetch("/api/auth/session", { credentials: "include" })
      .then((res) => setIsLoggedIn(res.ok))
      .catch(() => setIsLoggedIn(false));
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  if (!mounted || dismissed) return null;

  return (
    <>
      <div className="w-full bg-primary/10 border-b border-primary/20 text-sm">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-primary">🚧 Public Beta</span>
            <span className="text-muted-foreground">
              Fortress is under active development — some features are still rough around the edges.
            </span>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
            >
              <MessageSquarePlus className="h-3.5 w-3.5" />
              Report a bug or suggest something
            </button>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="text-muted-foreground hover:text-foreground shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {modalOpen && (
        <FeedbackModal isLoggedIn={isLoggedIn} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
