"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface FeedbackModalProps {
  isLoggedIn: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isLoggedIn, onClose }: FeedbackModalProps) {
  const [type, setType] = useState<"bug" | "suggestion">("suggestion");
  const [message, setMessage] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 5) {
      toast.error("Please add a few more details (at least 5 characters).");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          message: message.trim(),
          pageUrl: typeof window !== "undefined" ? window.location.pathname : undefined,
          guestEmail: isLoggedIn ? undefined : guestEmail.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit feedback");
      }

      toast.success("Thanks! We read every submission.");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg border border-primary/20 bg-card p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Report a bug or share an idea</h2>
          <button onClick={onClose} aria-label="Close" className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="feedback-type" className="text-sm font-medium">Type</label>
            <Select
              id="feedback-type"
              value={type}
              onChange={(e) => setType(e.target.value as "bug" | "suggestion")}
              disabled={submitting}
            >
              <option value="suggestion">Suggestion / idea</option>
              <option value="bug">Bug report</option>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="feedback-message" className="text-sm font-medium">
              {type === "bug" ? "What went wrong?" : "What would you like to see?"}
            </label>
            <Textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                type === "bug"
                  ? "e.g. Clicking Login didn't do anything on the /login page..."
                  : "e.g. It would help if I could filter Fortress 30 by sector..."
              }
              rows={4}
              required
              disabled={submitting}
            />
          </div>

          {!isLoggedIn && (
            <div className="space-y-2">
              <label htmlFor="guest-email" className="text-sm font-medium">
                Email <span className="text-muted-foreground font-normal">(optional, so we can follow up)</span>
              </label>
              <Input
                id="guest-email"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={submitting}
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Sending..." : "Send Feedback"}
          </Button>
        </form>
      </div>
    </div>
  );
}
