"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, ShieldCheck, RefreshCw, KeyRound, CheckCircle2, Circle, Eye, EyeOff, Users, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Subscriber {
    id: string;
    chatId: string;
    label: string | null;
    active: boolean;
}

interface Status {
    activeSignalCount: number;
    lastUpdated: string | null;
    minutesSinceUpdate: number | null;
    marketHoursNow: boolean;
    stale: boolean;
    staleThresholdMinutes: number;
}

const CREDENTIAL_FIELDS: { key: string; label: string }[] = [
    { key: "telegramBotToken", label: "Telegram Bot Token" },
    { key: "telegramAdminId", label: "Telegram Admin Chat ID" },
    { key: "zerodhaApiKey", label: "Zerodha API Key" },
    { key: "zerodhaApiSecret", label: "Zerodha API Secret" },
    { key: "zerodhaClientId", label: "Zerodha Client ID" },
];

export default function MomentumRadarAdminPage() {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState<Status | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [fieldsSet, setFieldsSet] = useState<Record<string, boolean>>({});
    const [formValues, setFormValues] = useState<Record<string, string>>({});
    const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});
    const [saving, setSaving] = useState(false);
    const [saveResult, setSaveResult] = useState<string | null>(null);

    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [newChatId, setNewChatId] = useState("");
    const [newLabel, setNewLabel] = useState("");
    const [subBusy, setSubBusy] = useState(false);
    const [subError, setSubError] = useState<string | null>(null);

    const loadSubscribers = async () => {
        const res = await fetch("/api/admin/telegram-subscribers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password, action: "list" }),
        });
        if (res.ok) {
            const data = await res.json();
            setSubscribers(data.subscribers ?? []);
        }
    };

    const addSubscriber = async () => {
        const chatId = newChatId.trim();
        if (!chatId) return;
        setSubBusy(true);
        setSubError(null);
        try {
            const res = await fetch("/api/admin/telegram-subscribers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password, action: "add", chatId, label: newLabel.trim() || undefined }),
            });
            const data = await res.json();
            if (res.ok) {
                setSubscribers(data.subscribers ?? []);
                setNewChatId("");
                setNewLabel("");
            } else {
                setSubError("Could not add — check the password.");
            }
        } catch {
            setSubError("Network error.");
        } finally {
            setSubBusy(false);
        }
    };

    const removeSubscriber = async (id: string) => {
        setSubBusy(true);
        try {
            const res = await fetch("/api/admin/telegram-subscribers", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password, action: "remove", id }),
            });
            if (res.ok) {
                const data = await res.json();
                setSubscribers(data.subscribers ?? []);
            }
        } finally {
            setSubBusy(false);
        }
    };

    const loadConfigStatus = async () => {
        const res = await fetch("/api/admin/bot-config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
        });
        if (res.ok) {
            const data = await res.json();
            setFieldsSet(data.fieldsSet ?? {});
        }
    };

    const checkStatus = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/momentum-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            if (res.ok) {
                setStatus(data);
                await loadConfigStatus();
                await loadSubscribers();
            } else {
                setError(data.error === "INVALID_PASSWORD" ? "Wrong password." : "Status check failed.");
                setStatus(null);
            }
        } catch {
            setError("Network error.");
        } finally {
            setLoading(false);
        }
    };

    const saveCredentials = async () => {
        setSaving(true);
        setSaveResult(null);
        try {
            const res = await fetch("/api/admin/bot-config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password, ...formValues }),
            });
            const data = await res.json();
            if (res.ok) {
                setSaveResult(`Saved ${data.fieldsUpdated?.length ?? 0} field(s) and restarted the bot.`);
                setFormValues({});
                await loadConfigStatus();
            } else {
                setSaveResult("Save failed — check the password.");
            }
        } catch {
            setSaveResult("Network error saving credentials.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <main className="container max-w-2xl mx-auto px-4 sm:px-8 py-12 space-y-8">
                <div>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 mb-3">Bot Health</Badge>
                    <h1 className="text-3xl font-bold font-serif flex items-center gap-2">
                        <ShieldCheck className="h-7 w-7 text-purple-400" /> Momentum Radar — Admin
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Standalone health check for the MACD scanner bot feeding the Momentum Radar tab.
                    </p>
                </div>

                {!status && (
                    <Card className="bg-white/5 border-white/10">
                        <CardContent className="p-5 space-y-3">
                            <div className="flex items-center gap-2 mb-1">
                                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Enter password</span>
                            </div>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && checkStatus()}
                                        className="h-9 text-sm bg-white/5 border-white/10 pr-9"
                                    />
                                    <button
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                    </button>
                                </div>
                                <Button size="sm" onClick={checkStatus} disabled={loading || !password} className="h-9 px-4">
                                    {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : "View Status"}
                                </Button>
                            </div>
                            {error && <p className="text-xs text-red-400">{error}</p>}
                        </CardContent>
                    </Card>
                )}

                {status && (
                    <div className="space-y-4">
                        <Card className={cn("border", status.stale ? "bg-amber-500/5 border-amber-500/20" : "bg-emerald-500/5 border-emerald-500/20")}>
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Bot Status</p>
                                    <p className={cn("text-lg font-bold", status.stale ? "text-amber-400" : "text-emerald-400")}>
                                        {status.stale ? "Stale — check the bot" : "Healthy"}
                                    </p>
                                </div>
                                <Button size="sm" variant="outline" onClick={checkStatus} disabled={loading} className="gap-1.5">
                                    <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} /> Refresh
                                </Button>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-white/5 border-white/10">
                                <CardContent className="p-4">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Active Signals</p>
                                    <p className="text-2xl font-bold font-mono text-white">{status.activeSignalCount}</p>
                                </CardContent>
                            </Card>
                            <Card className="bg-white/5 border-white/10">
                                <CardContent className="p-4">
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Last Push</p>
                                    <p className="text-2xl font-bold font-mono text-white">
                                        {status.minutesSinceUpdate === null ? "Never" : `${status.minutesSinceUpdate}m ago`}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="bg-white/5 border-white/10">
                            <CardContent className="p-4 space-y-2 text-xs text-muted-foreground">
                                <p><strong>Last scan ran:</strong> {status.lastUpdated ? new Date(status.lastUpdated).toLocaleString("en-IN") : "Never"}</p>
                                <p>NSE market hours right now: {status.marketHoursNow ? "Yes" : "No"}</p>
                                <p>Flagged stale if no push for &gt;{status.staleThresholdMinutes} min during market hours.</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/5 border-white/10">
                            <CardContent className="p-5 space-y-4">
                                <div className="flex items-center gap-2">
                                    <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bot Credentials</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Saving restarts the bot on the VPS immediately. Fields left blank keep their current value — nothing already saved is ever shown back here.
                                </p>
                                <div className="space-y-3">
                                    {CREDENTIAL_FIELDS.map((f) => (
                                        <div key={f.key} className="flex items-center gap-3">
                                            <div className="w-5 shrink-0">
                                                {fieldsSet[f.key]
                                                    ? <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                                    : <Circle className="h-4 w-4 text-muted-foreground" />}
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <label className="text-xs text-muted-foreground">{f.label}</label>
                                                <div className="relative">
                                                    <Input
                                                        type={showCredentials[f.key] ? "text" : "password"}
                                                        placeholder={fieldsSet[f.key] ? "Already set — leave blank to keep" : "Not set"}
                                                        value={formValues[f.key] ?? ""}
                                                        onChange={(e) => setFormValues((v) => ({ ...v, [f.key]: e.target.value }))}
                                                        className="h-8 text-sm bg-white/5 border-white/10 pr-8"
                                                    />
                                                    <button
                                                        onClick={() => setShowCredentials((v) => ({ ...v, [f.key]: !v[f.key] }))}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        {showCredentials[f.key] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    size="sm"
                                    onClick={saveCredentials}
                                    disabled={saving || Object.values(formValues).every((v) => !v?.trim())}
                                    className="w-full"
                                >
                                    {saving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : "Save & Restart Bot"}
                                </Button>
                                {saveResult && <p className="text-xs text-muted-foreground">{saveResult}</p>}
                            </CardContent>
                        </Card>

                        <Card className="bg-white/5 border-white/10">
                            <CardContent className="p-5 space-y-4">
                                <div className="flex items-center gap-2">
                                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Telegram Alert Recipients</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    The admin chat ID above always gets alerts. Add more people here — each gets their own DM, no group chat needed. Takes effect on the bot&apos;s next 5-minute scan cycle, no restart required.
                                </p>

                                {subscribers.length > 0 && (
                                    <div className="space-y-2">
                                        {subscribers.map((s) => (
                                            <div key={s.id} className="flex items-center justify-between gap-2 bg-white/5 rounded-lg px-3 py-2">
                                                <div className="min-w-0">
                                                    <p className="text-sm text-white truncate">{s.label || "Unnamed"}</p>
                                                    <p className="text-xs text-muted-foreground font-mono">{s.chatId}</p>
                                                </div>
                                                <button
                                                    onClick={() => removeSubscriber(s.id)}
                                                    disabled={subBusy}
                                                    className="text-muted-foreground hover:text-red-400 transition-colors shrink-0"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Chat ID (e.g. 123456789)"
                                        value={newChatId}
                                        onChange={(e) => setNewChatId(e.target.value)}
                                        className="h-9 text-sm bg-white/5 border-white/10 flex-1"
                                    />
                                    <Input
                                        placeholder="Label (optional)"
                                        value={newLabel}
                                        onChange={(e) => setNewLabel(e.target.value)}
                                        className="h-9 text-sm bg-white/5 border-white/10 flex-1"
                                    />
                                    <Button size="sm" onClick={addSubscriber} disabled={subBusy || !newChatId.trim()} className="h-9 gap-1.5 shrink-0">
                                        <Plus className="h-3.5 w-3.5" /> Add
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    To find someone&apos;s chat ID: they message the bot on Telegram first, then visit <code className="text-[11px]">https://api.telegram.org/bot&lt;TOKEN&gt;/getUpdates</code> and read the <code className="text-[11px]">chat.id</code> field.
                                </p>
                                {subError && <p className="text-xs text-red-400">{subError}</p>}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </main>
        </div>
    );
}
