"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { updateV5Stock } from "@/app/actions";
import { toast } from "sonner";
import { V5Stock } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

export default function V5StockEditor({ stock }: { stock: V5Stock }) {
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState<Partial<V5Stock>>({
        current_price: stock.current_price,
        quality_score: stock.quality_score,
        tag: stock.tag,
        risk: stock.risk,
        drop52w: stock.drop52w,
        moat: stock.moat,
        ocf: stock.ocf,
        why_down: stock.why_down || "",
        why_buy: stock.why_buy || "",
        penny_why: stock.penny_why || "",
        multi_bagger_case: stock.multi_bagger_case || "",
        killer_risk: stock.killer_risk || "",
        fortress_note: stock.fortress_note || "",
        v5Category: stock.v5Category,
        industry: stock.industry || ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateV5Stock(stock.id, formData);
            toast.success(`${stock.symbol} updated successfully`);
            setIsOpen(false);
            window.location.reload(); // Simple way to refresh data for now
        } catch (error) {
            console.error(error);
            toast.error("Failed to update stock");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (name === 'current_price' || name === 'quality_score' || name === 'drop52w')
                ? Number(value)
                : value
        }));
    };

    return (
        <div className="flex flex-col gap-2">
            {/* Simple Modal Trigger since I don't see Dialog in ui directory */}
            <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
                Edit V5 Data
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-card border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl">
                        <div className="p-6 border-b border-border sticky top-0 bg-card z-10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="text-lg px-3 py-0.5">{stock.symbol}</Badge>
                                <h3 className="text-xl font-bold font-serif">Edit V5 Stock Entry</h3>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>×</Button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Current Price</label>
                                    <Input name="current_price" type="number" step="0.01" value={formData.current_price} onChange={handleChange} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Quality Score</label>
                                    <Input name="quality_score" type="number" value={formData.quality_score} onChange={handleChange} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">52W Drop %</label>
                                    <Input name="drop52w" type="number" step="0.1" value={formData.drop52w} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Tag (e.g. QUALITY ON SALE)</label>
                                    <Input name="tag" value={formData.tag} onChange={handleChange} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Risk Level</label>
                                    <Input name="risk" value={formData.risk} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">OCF (e.g. 5/5)</label>
                                    <Input name="ocf" value={formData.ocf} onChange={handleChange} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Moat / Niche</label>
                                    <Input name="moat" value={formData.moat} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="space-y-4 pt-2 border-t border-border/50">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-destructive tracking-wider">Why It Fell</label>
                                    <Textarea name="why_down" rows={2} value={formData.why_down} onChange={handleChange} placeholder="Reason for the 52W drop..." />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-primary tracking-wider">Fortress View (Why Buy?)</label>
                                    <Textarea name="why_buy" rows={3} value={formData.why_buy} onChange={handleChange} placeholder="The investment thesis summary..." />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-bold text-amber-500 tracking-wider">Multi-Bagger Case (Optional)</label>
                                    <Textarea name="multi_bagger_case" rows={2} value={formData.multi_bagger_case} onChange={handleChange} placeholder="The speculative upside..." />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-border sticky bottom-0 bg-card pb-2">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading} className="flex-1">
                                    {loading ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
