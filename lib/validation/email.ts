export function validateEmail(email: unknown): { valid: boolean; error?: string } {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Email is required" };
  }

  const trimmed = email.trim().toLowerCase();

  if (!trimmed.includes("@")) {
    return { valid: false, error: "Invalid email format" };
  }

  if (!trimmed.includes(".")) {
    return { valid: false, error: "Invalid email format" };
  }

  return { valid: true };
}

export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}
