// Best-effort admin alert for backend errors that would otherwise sit silent
// in pm2 logs until someone happens to SSH in and grep for them (exactly
// what happened with the macd_signals/scan_results schema-drift bugs).
// No-ops if TELEGRAM_BOT_TOKEN/TELEGRAM_ADMIN_ID aren't configured — never
// throws, never blocks the caller's own error handling.
export async function notifyAdminError(context: string, error: unknown): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_ID;
  if (!token || !chatId) return;

  const message = error instanceof Error ? error.message : String(error);
  const text = `🔴 *Fortress backend error*\n\n*Where*: ${context}\n*Error*: \`${message.slice(0, 500)}\``;

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    // Best-effort only — swallow. This is the alert path itself; it must
    // never throw and mask the original error.
  }
}
