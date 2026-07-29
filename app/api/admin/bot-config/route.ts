import { NextRequest, NextResponse } from "next/server";
import { execFile } from "child_process";
import fs from "fs";
import { env } from "@/lib/env";

const BOT_ENV_PATH = "/opt/fortress/scripts/macd-bot/.env.local";
const BOT_DIR = "/opt/fortress/scripts/macd-bot";

// Maps the form field names to the exact env var names macd_excel_bot.py reads.
const FIELD_TO_ENV_KEY: Record<string, string> = {
  telegramBotToken: "TELEGRAM_BOT_TOKEN",
  telegramAdminId: "TELEGRAM_ADMIN_ID",
  zerodhaApiKey: "ZERODHA_API_KEY",
  zerodhaApiSecret: "ZERODHA_API_SECRET",
  zerodhaClientId: "ZERODHA_CLIENT_ID",
};

function readEnvFile(): Map<string, string> {
  const map = new Map<string, string>();
  if (!fs.existsSync(BOT_ENV_PATH)) return map;
  for (const line of fs.readFileSync(BOT_ENV_PATH, "utf-8").split("\n")) {
    const trimmed = line.trim();
    const eq = trimmed.indexOf("=");
    if (eq > 0 && !trimmed.startsWith("#")) {
      map.set(trimmed.slice(0, eq), trimmed.slice(eq + 1));
    }
  }
  return map;
}

function writeEnvFile(map: Map<string, string>) {
  const content = Array.from(map.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  fs.writeFileSync(BOT_ENV_PATH, content + "\n", "utf-8");
}

function restartBot(): Promise<string> {
  return new Promise((resolve) => {
    execFile(
      "bash",
      ["-c", `pm2 restart macd-bot || pm2 start macd_excel_bot.py --interpreter python3 --name macd-bot --cwd ${BOT_DIR}`],
      { cwd: BOT_DIR, timeout: 15000 },
      (err, stdout, stderr) => {
        resolve((stdout || "") + (stderr || "") + (err ? `\n${err.message}` : ""));
      }
    );
  });
}

export async function POST(request: NextRequest) {
  if (!env.ADMIN_PANEL_PASSWORD) {
    return NextResponse.json({ success: false, error: "ADMIN_PANEL_NOT_CONFIGURED" }, { status: 503 });
  }

  const body = await request.json();
  if (body.password !== env.ADMIN_PANEL_PASSWORD) {
    return NextResponse.json({ success: false, error: "INVALID_PASSWORD" }, { status: 401 });
  }

  const existing = readEnvFile();

  // Status-only check: no credential fields provided, just report what's set
  // (never the values themselves).
  const providedFields = Object.keys(FIELD_TO_ENV_KEY).filter((f) => body[f] && String(body[f]).trim());
  if (providedFields.length === 0) {
    const fieldsSet: Record<string, boolean> = {};
    for (const [field, envKey] of Object.entries(FIELD_TO_ENV_KEY)) {
      fieldsSet[field] = Boolean(existing.get(envKey));
    }
    return NextResponse.json({ success: true, mode: "status", fieldsSet });
  }

  for (const field of providedFields) {
    const envKey = FIELD_TO_ENV_KEY[field];
    // Strip newlines — this is a flat KEY=VALUE file, not a shell command,
    // but a stray newline would still corrupt the next line.
    const value = String(body[field]).replace(/[\r\n]/g, "").trim();
    existing.set(envKey, value);
  }
  writeEnvFile(existing);

  const restartOutput = await restartBot();

  return NextResponse.json({
    success: true,
    mode: "write",
    fieldsUpdated: providedFields.map((f) => FIELD_TO_ENV_KEY[f]),
    restartOutput: restartOutput.slice(0, 2000),
  });
}
