
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateThesis } from "@/app/actions";
// Removed sonner import as it's not installed

export function ThesisEditor({ thesis, onSave }: { thesis: any, onSave: () => void }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        oneLiner: thesis.oneLiner,
        investmentLogic: thesis.investmentLogic,
        risks: thesis.risks,
        financialStrengthScore: thesis.financialStrengthScore,
        moatSource: thesis.moatSource || "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateThesis(thesis.id, formData);
            onSave();
            // toast.success("Thesis updated successfully");
        } catch (error) {
            console.error(error);
            // toast.error("Failed to update thesis");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium">One Liner</label>
                <Input
                    value={formData.oneLiner}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, oneLiner: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Investment Logic</label>
                <Textarea
                    value={formData.investmentLogic}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, investmentLogic: e.target.value })}
                    rows={4}
                />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium">Risks</label>
                <Textarea
                    value={formData.risks}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, risks: e.target.value })}
                    rows={3}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Moat Source</label>
                    <Input
                        value={formData.moatSource}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, moatSource: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Strength Score (1-10)</label>
                    <Input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.financialStrengthScore}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, financialStrengthScore: parseInt(e.target.value) })}
                    />
                </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Saving..." : "Update Thesis"}
            </Button>
        </form>
    );
}
