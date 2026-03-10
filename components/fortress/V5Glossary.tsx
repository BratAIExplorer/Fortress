
"use client";

import { Glossary } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tag, ShieldAlert, Layers, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface V5GlossaryProps {
    data: Glossary;
}

export function V5Glossary({ data }: V5GlossaryProps) {
    return (
        <div className="space-y-8 pb-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Fortress Tags */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Tag className="h-5 w-5 text-amber-500" />
                        <h2 className="text-xl font-bold text-white uppercase tracking-tight">Investment Tags</h2>
                    </div>
                    <div className="space-y-3">
                        {data.tags.map((tag) => (
                            <Card key={tag.name} className="bg-white/5 border-white/10 hover:border-white/20 transition-all">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xl">{tag.emoji}</span>
                                        <span className="font-bold text-sm tracking-wide" style={{ color: tag.color }}>{tag.name}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">&ldquo;{tag.plain}&rdquo;</p>
                                    <div className="bg-white/5 p-2 rounded text-[10px] border border-white/5">
                                        <span className="text-muted-foreground mr-1 uppercase font-bold">Action:</span>
                                        <span className="text-white font-medium">{tag.action}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Risk Levels & 5 Layers */}
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <ShieldAlert className="h-5 w-5 text-rose-500" />
                            <h2 className="text-xl font-bold text-white uppercase tracking-tight">Risk Levels</h2>
                        </div>
                        <div className="grid gap-3">
                            {data.riskLevels.map((risk) => (
                                <div key={risk.level} className="flex gap-4 p-3 rounded-lg bg-white/5 border border-white/10">
                                    <div className="text-2xl pt-1">{risk.emoji}</div>
                                    <div>
                                        <div className="font-bold text-xs mb-1" style={{ color: risk.color }}>{risk.level}</div>
                                        <p className="text-[11px] text-slate-300 leading-tight mb-1">{risk.plain}</p>
                                        <p className="text-[10px] text-muted-foreground italic">e.g. {risk.examples}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Layers className="h-5 w-5 text-cyan-500" />
                            <h2 className="text-xl font-bold text-white uppercase tracking-tight">The 5 Fortress Layers</h2>
                        </div>
                        <div className="space-y-3">
                            {data.fortressLayers.map((layer) => (
                                <div key={layer.layer} className="p-3 rounded-lg bg-white/5 border border-white/10">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-lg">{layer.icon}</span>
                                        <span className="font-bold text-xs" style={{ color: layer.color }}>{layer.layer}</span>
                                    </div>
                                    <p className="text-[11px] font-medium text-slate-100 mb-1">{layer.plain}</p>
                                    <p className="text-[10px] text-muted-foreground italic">Simple view: {layer.simple}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Platform Updates */}
            <div className="pt-8 border-t border-white/10">
                <div className="flex items-center gap-2 mb-6">
                    <RefreshCcw className="h-5 w-5 text-emerald-500" />
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">System Update Schedule</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {data.updates.map((upd) => (
                        <Card key={upd.freq} className="bg-white/5 border-white/10 overflow-hidden border-t-2" style={{ borderTopColor: upd.color }}>
                            <CardHeader className="p-4 pb-2 text-center">
                                <CardTitle className="text-sm font-bold tracking-widest text-white uppercase">{upd.freq}</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-2">
                                <ul className="space-y-1.5 mb-4 text-center">
                                    {upd.items.map(item => (
                                        <li key={item} className="text-[11px] text-slate-300">• {item}</li>
                                    ))}
                                </ul>
                                <div className="text-center pt-3 border-t border-white/5">
                                    <div className="text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5">Next Refresh</div>
                                    <div className="text-xs font-mono font-bold text-emerald-400">{upd.next}</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
