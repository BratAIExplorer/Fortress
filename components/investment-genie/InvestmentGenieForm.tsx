"use client";

import React, { useState } from "react";
import { UserProfile } from "../../lib/investment-genie/contracts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function InvestmentGenieForm({ onSubmit }: { onSubmit?: (profile: UserProfile) => void }) {
  const [age, setAge] = useState<number>(30);
  const [amount, setAmount] = useState<number>(1000);
  const [horizon, setHorizon] = useState<UserProfile["horizon"]>("5yr");
  const [experience, setExperience] = useState<UserProfile["experience"]>("intermediate");
  const [countries, setCountries] = useState<UserProfile["countries"]>([]);
  const [riskAppetite, setRiskAppetite] = useState<number>(50);
  const [incomeStability, setIncomeStability] = useState<UserProfile["incomeStability"]>("stable");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleCountry = (country: UserProfile["countries"][number]) => {
    if (countries.includes(country)) {
      setCountries(countries.filter(c => c !== country));
    } else {
      setCountries([...countries, country]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (age < 18 || age > 70) newErrors.age = "Age must be between 18 and 70";
    if (amount < 100) newErrors.amount = "Minimum investment is $100";
    if (countries.length === 0) newErrors.countries = "Select at least one geographic focus";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const profile: UserProfile = {
      age,
      amount,
      horizon,
      experience,
      countries,
      riskAppetite,
      incomeStability,
    };
    
    if (onSubmit) {
      onSubmit(profile);
    }
  };

  const Label = ({ children, htmlFor, className }: { children: React.ReactNode; htmlFor?: string; className?: string }) => (
    <label htmlFor={htmlFor} className={cn("block text-sm font-medium text-white/70 mb-2", className)}>
      {children}
    </label>
  );

  return (
    <form aria-label="Investment Genie Form" onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Age */}
          <div>
            <Label htmlFor="age">Age: <span className="text-primary font-bold">{age}</span></Label>
            <input 
              id="age"
              type="range" 
              min={18} 
              max={70} 
              value={age} 
              aria-label="Age"
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
            />
            {errors.age && <p className="text-destructive text-xs mt-2 font-medium">{errors.age}</p>}
          </div>

          {/* Amount */}
          <div>
            <Label htmlFor="amount">Investment Amount (USD)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">$</span>
              <Input 
                id="amount"
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(Number(e.target.value))}
                className="bg-white/5 border-white/10 text-white pl-7 h-11 focus:ring-primary/50"
              />
            </div>
            {errors.amount && <p className="text-destructive text-xs mt-2 font-medium">{errors.amount}</p>}
          </div>

          {/* Horizon */}
          <div>
            <Label htmlFor="horizon">Time Horizon</Label>
            <select 
              id="horizon"
              value={horizon} 
              onChange={(e) => setHorizon(e.target.value as any)}
              className="w-full h-11 bg-white/5 border border-white/10 rounded-md px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-sans"
            >
              <option value="1yr" className="bg-slate-900">1 Year</option>
              <option value="5yr" className="bg-slate-900">5 Years</option>
              <option value="10yr" className="bg-slate-900">10 Years</option>
              <option value="20yr" className="bg-slate-900">20 Years</option>
              <option value="retirement" className="bg-slate-900">Retirement</option>
            </select>
          </div>

          {/* Experience */}
          <div className="space-y-3">
            <Label>Investment Experience</Label>
            <div className="flex flex-wrap gap-2">
              {(["beginner", "intermediate", "experienced"] as const).map(level => (
                <label
                  key={level}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer",
                    experience === level 
                      ? "bg-primary text-primary-foreground border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]" 
                      : "bg-white/5 text-white/60 border-white/10 hover:border-white/20 hover:text-white"
                  )}
                >
                  <input 
                    type="radio" 
                    name="experience" 
                    className="hidden" 
                    checked={experience === level} 
                    onChange={() => setExperience(level)} 
                  />
                  {level.toUpperCase()}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Geographic Focus */}
          <div className="space-y-3">
            <Label>Geographic Focus</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["India", "United States", "Malaysia", "Singapore", "ETFs"] as const).map(country => (
                <label
                  key={country}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs border transition-all cursor-pointer",
                    countries.includes(country)
                      ? "bg-primary/20 text-primary border-primary/50"
                      : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10"
                  )}
                >
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={countries.includes(country)} 
                    onChange={() => toggleCountry(country)} 
                  />
                  <span className="font-bold">{country}</span>
                  {countries.includes(country) && <span className="ml-2">✓</span>}
                </label>
              ))}
            </div>
            {errors.countries && <p className="text-destructive text-xs mt-2 font-medium">{errors.countries}</p>}
          </div>

          {/* Risk Appetite */}
          <div>
            <Label htmlFor="riskAppetite">Risk Appetite: <span className="text-primary font-bold">{riskAppetite}</span></Label>
            <input 
              id="riskAppetite"
              type="range" 
              min={0} 
              max={100} 
              value={riskAppetite} 
              aria-label="Risk Appetite"
              onChange={(e) => setRiskAppetite(Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          {/* Income Stability */}
          <div className="space-y-3">
            <Label>Income Stability</Label>
            <div className="space-y-2">
              {(["stable", "variable", "business"] as const).map(stability => (
                <label
                  key={stability}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm transition-all cursor-pointer",
                    incomeStability === stability
                      ? "bg-white/10 text-white border-white/20 shadow-inner"
                      : "bg-transparent text-white/40 border-white/5 hover:border-white/10 hover:text-white/60"
                  )}
                >
                  <input 
                    type="radio" 
                    name="incomeStability" 
                    className="hidden" 
                    checked={incomeStability === stability} 
                    onChange={() => setIncomeStability(stability)} 
                  />
                  <div className={cn(
                    "w-3 h-3 rounded-full border-2",
                    incomeStability === stability ? "bg-primary border-primary" : "border-white/20"
                  )} />
                  <span className="capitalize font-medium">{stability}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <Button 
          type="submit" 
          size="lg" 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-14 rounded-2xl shadow-[0_10px_30px_rgba(var(--primary),0.2)] transition-all transform active:scale-[0.98] text-lg font-serif"
        >
          Generate Portfolio
        </Button>
      </div>
    </form>
  );
}
