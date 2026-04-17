import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InvestmentGenieForm } from "./InvestmentGenieForm";

afterEach(cleanup);

describe("InvestmentGenieForm", () => {
  it("renders all 7 fields", () => {
    render(<InvestmentGenieForm />);
    expect(screen.getByLabelText(/Age/i)).toBeTruthy();
    expect(screen.getByLabelText(/Investment Amount/i)).toBeTruthy();
    expect(screen.getByLabelText(/Time Horizon/i)).toBeTruthy();
    expect(screen.getByText(/Investment Experience/i)).toBeTruthy();
    expect(screen.getByText(/Geographic Focus/i)).toBeTruthy();
    expect(screen.getByLabelText(/Risk Appetite/i)).toBeTruthy();
    expect(screen.getByText(/Income Stability/i)).toBeTruthy();
  });

  it("validates required fields", async () => {
    const user = userEvent.setup();
    render(<InvestmentGenieForm />);

    const amountInput = screen.getByRole("spinbutton", { name: /Investment Amount/i });
    await user.clear(amountInput);
    await user.type(amountInput, "50"); // less than 100

    const submitBtn = screen.getByRole("button", { name: /generate portfolio/i });
    await user.click(submitBtn);

    expect(screen.getByText(/Minimum investment is \$100/i)).toBeTruthy();
    expect(screen.getByText(/Select at least one geographic focus/i)).toBeTruthy();
  });

  it("exports UserProfile with correct types on submit", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<InvestmentGenieForm onSubmit={onSubmit} />);

    // Select a country
    const indiaCheckbox = screen.getByRole("checkbox", { name: /India/i });
    await user.click(indiaCheckbox);

    // Submit
    const submitBtn = screen.getByRole("button", { name: /generate portfolio/i });
    await user.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const profile = onSubmit.mock.calls[0][0];
    
    expect(profile).toHaveProperty("age", 30);
    expect(profile).toHaveProperty("amount", 1000);
    expect(profile).toHaveProperty("horizon", "5yr");
    expect(profile).toHaveProperty("experience", "intermediate");
    expect(profile.countries).toContain("India");
    expect(profile).toHaveProperty("riskAppetite", 50);
    expect(profile).toHaveProperty("incomeStability", "stable");
  });
});
