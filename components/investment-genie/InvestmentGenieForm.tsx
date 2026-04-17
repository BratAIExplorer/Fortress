"use client";

import React, { useState } from "react";
import { UserProfile } from "../../lib/investment-genie/contracts";

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

  return (
    <form aria-label="Investment Genie Form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "400px", width: "100%", margin: "0 auto", padding: "16px", boxSizing: "border-box" }}>
      <div>
        <label htmlFor="age" style={{ display: "block", marginBottom: "8px" }}>Age (18-70): {age}</label>
        <input 
          id="age"
          type="range" 
          min={18} 
          max={70} 
          value={age} 
          onChange={(e) => setAge(Number(e.target.value))} 
          style={{ width: "100%" }}
        />
        {errors.age && <p style={{ color: "red", margin: "4px 0", fontSize: "14px" }}>{errors.age}</p>}
      </div>

      <div>
        <label htmlFor="amount" style={{ display: "block", marginBottom: "8px" }}>Investment Amount (USD)</label>
        <input 
          id="amount"
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(Number(e.target.value))}
          style={{ width: "100%", padding: "8px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        {errors.amount && <p style={{ color: "red", margin: "4px 0", fontSize: "14px" }}>{errors.amount}</p>}
      </div>

      <div>
        <label htmlFor="horizon" style={{ display: "block", marginBottom: "8px" }}>Time Horizon</label>
        <select 
          id="horizon"
          value={horizon} 
          onChange={(e) => setHorizon(e.target.value as UserProfile["horizon"])}
          style={{ width: "100%", padding: "8px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          <option value="1yr">1 Year</option>
          <option value="5yr">5 Years</option>
          <option value="10yr">10 Years</option>
          <option value="20yr">20 Years</option>
          <option value="retirement">Retirement</option>
        </select>
      </div>

      <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
        <legend style={{ marginBottom: "8px", fontWeight: "bold" }}>Investment Experience</legend>
        {(["beginner", "intermediate", "experienced"] as const).map(level => (
          <label key={level} style={{ display: "block", marginBottom: "4px", cursor: "pointer" }}>
            <input 
              type="radio" 
              name="experience" 
              value={level} 
              checked={experience === level} 
              onChange={() => setExperience(level)} 
              style={{ marginRight: "8px" }}
            />
            {level.charAt(0).toUpperCase() + level.slice(1)}
          </label>
        ))}
      </fieldset>

      <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
        <legend style={{ marginBottom: "8px", fontWeight: "bold" }}>Geographic Focus</legend>
        {(["India", "US", "Malaysia", "Singapore", "ETFs"] as const).map(country => (
          <label key={country} style={{ display: "block", marginBottom: "4px", cursor: "pointer" }}>
            <input 
              type="checkbox" 
              value={country} 
              checked={countries.includes(country)} 
              onChange={() => toggleCountry(country)} 
              style={{ marginRight: "8px" }}
            />
            {country}
          </label>
        ))}
        {errors.countries && <p style={{ color: "red", margin: "4px 0", fontSize: "14px" }}>{errors.countries}</p>}
      </fieldset>

      <div>
        <label htmlFor="riskAppetite" style={{ display: "block", marginBottom: "8px" }}>Risk Appetite (0-100): {riskAppetite}</label>
        <input 
          id="riskAppetite"
          type="range" 
          min={0} 
          max={100} 
          value={riskAppetite} 
          onChange={(e) => setRiskAppetite(Number(e.target.value))} 
          style={{ width: "100%" }}
        />
      </div>

      <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
        <legend style={{ marginBottom: "8px", fontWeight: "bold" }}>Income Stability</legend>
        {(["stable", "variable", "business"] as const).map(stability => (
          <label key={stability} style={{ display: "block", marginBottom: "4px", cursor: "pointer" }}>
            <input 
              type="radio" 
              name="incomeStability" 
              value={stability} 
              checked={incomeStability === stability} 
              onChange={() => setIncomeStability(stability)} 
              style={{ marginRight: "8px" }}
            />
            {stability.charAt(0).toUpperCase() + stability.slice(1)}
          </label>
        ))}
      </fieldset>

      <button type="submit" style={{ padding: "12px", background: "#0070f3", color: "white", border: "none", borderRadius: "4px", fontSize: "16px", cursor: "pointer", marginTop: "16px", transition: "background 0.2s" }}>
        Generate Portfolio
      </button>
    </form>
  );
}
