"use client";

import { useState, useEffect } from "react";
import { X, Coins, TrendingUp, AlertTriangle, MessageSquarePlus, Rocket, Bug, Lightbulb, ShieldCheck } from "lucide-react";
import { FeedbackModal } from "./FeedbackModal";

const SEEN_KEY = "fortress-welcome-modal-seen";

// ponytail: shown to every signed-in user for the whole BETA phase, no expiry.
// Revisit once out of beta (e.g. gate by subscriptionStatus like Momentum Radar).
export function WelcomeBetaModal() {
  const [show, setShow] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(SEEN_KEY) === "1") return;

    fetch("/api/auth/session", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) setShow(true);
      })
      .catch(() => {});
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(SEEN_KEY, "1");
    setShow(false);
  };

  if (!show) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={dismiss}>
        <div
          className="relative w-full max-w-md rounded-2xl border border-amber-500/30 bg-card overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-4 -right-9 w-40 text-center rotate-45 bg-amber-500 text-black text-[11px] font-semibold tracking-wide py-1 z-10">
            PUBLIC BETA
          </div>

          <button
            onClick={dismiss}
            aria-label="Close"
            className="absolute top-3 left-3 z-10 text-muted-foreground hover:text-foreground bg-background/60 rounded-full p-1"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="bg-black/40 overflow-hidden whitespace-nowrap py-1.5 font-mono text-xs">
            <div className="inline-block animate-[marquee_14s_linear_infinite]">
              {Array.from({ length: 2 }).map((_, i) => (
                <span key={i}>
                  <span className="text-emerald-400 mx-3">▲ FRTX +4.2%</span>
                  <span className="text-muted-foreground mx-3">GEM 84/100</span>
                  <span className="text-red-400 mx-3">▼ RISK -1.1%</span>
                  <span className="text-emerald-400 mx-3">▲ NIFTY +0.8%</span>
                  <span className="text-muted-foreground mx-3">S&amp;P 500</span>
                </span>
              ))}
            </div>
          </div>

          <div className="relative p-6 pt-5">
            <Coins className="absolute top-3 left-14 h-5 w-5 text-amber-300 animate-bounce" />
            <TrendingUp className="absolute top-6 right-6 h-4 w-4 text-emerald-400" />

            <h2 className="text-xl font-bold font-serif mt-2 mb-1">
              You&apos;re early. <span className="text-amber-400">Welcome aboard.</span>
            </h2>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Fortress is a work in progress — features are rolling out gradually and still getting sharpened.
              Some tools may change, move, or take a break while we tune them.
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2.5 bg-white/5 rounded-lg px-3 py-2.5">
                <Bug className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-sm">Bugs and rough edges? Expected — tell us.</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/5 rounded-lg px-3 py-2.5">
                <Lightbulb className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-sm">Your feedback shapes what we build next.</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/5 rounded-lg px-3 py-2.5">
                <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
                <span className="text-sm">No real money ever moves through this app.</span>
              </div>
            </div>

            <div className="border border-dashed border-amber-500/40 bg-amber-500/10 rounded-lg px-3 py-3 mb-4">
              <p className="text-sm font-semibold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4" /> Not financial advice
              </p>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                Everything here is informational only. Do your own homework before acting on it — any investing
                decision, and its outcome, is on you.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFeedbackOpen(true)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium py-2.5 transition-colors"
              >
                <MessageSquarePlus className="h-4 w-4" /> Got feedback?
              </button>
              <button
                onClick={dismiss}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-semibold py-2.5 transition-colors"
              >
                Let&apos;s go <Rocket className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {feedbackOpen && <FeedbackModal isLoggedIn onClose={() => setFeedbackOpen(false)} />}

      <style jsx global>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </>
  );
}
