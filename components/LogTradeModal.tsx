"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface LogTradeModalProps {
  symbol: string;
  timeframe: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LogTradeModal({ symbol, timeframe, open, onClose, onSuccess }: LogTradeModalProps) {
  const [action, setAction] = useState<"bought" | "skipped" | "sold">("bought");
  const [quantity, setQuantity] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/momentum/user-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          timeframe,
          action,
          quantity: quantity ? parseInt(quantity) : null,
          entryPrice: entryPrice ? parseFloat(entryPrice) : null,
          exitPrice: exitPrice ? parseFloat(exitPrice) : null,
          notes: notes || null,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to log trade");
      }

      onSuccess?.();
      onClose();
      setQuantity("");
      setEntryPrice("");
      setExitPrice("");
      setNotes("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error logging trade");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Log Trade: {symbol}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Action Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Action
            </label>
            <div className="flex gap-2">
              {(["bought", "skipped", "sold"] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAction(a)}
                  className={`px-3 py-2 rounded text-sm font-medium transition ${
                    action === a
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {a.charAt(0).toUpperCase() + a.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity (for bought/sold) */}
          {(action === "bought" || action === "sold") && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-500"
                placeholder="e.g. 100"
              />
            </div>
          )}

          {/* Entry Price (for bought) */}
          {action === "bought" && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Entry Price
              </label>
              <input
                type="number"
                step="0.01"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-500"
                placeholder="e.g. 1500.50"
              />
            </div>
          )}

          {/* Exit Price (for sold) */}
          {action === "sold" && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Exit Price
              </label>
              <input
                type="number"
                step="0.01"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-500"
                placeholder="e.g. 1650.00"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white placeholder-slate-500 resize-none"
              placeholder="e.g. Strong support at 1500"
            />
          </div>

          {error && <div className="text-sm text-red-400">{error}</div>}

          {/* Buttons */}
          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-800 text-slate-300 rounded font-medium hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Logging..." : "Log Trade"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
