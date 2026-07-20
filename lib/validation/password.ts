export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

export function validatePassword(
  password: unknown,
  options?: { requireComplexity?: boolean }
): { valid: boolean; error?: string } {
  if (!password || typeof password !== "string") {
    return { valid: false, error: "Password is required" };
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return { valid: false, error: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long` };
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return { valid: false, error: `Password must be no more than ${PASSWORD_MAX_LENGTH} characters` };
  }

  if (options?.requireComplexity) {
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\|,.<>\/?]/.test(password);

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      return {
        valid: false,
        error: "Password must contain uppercase, lowercase, number, and special character",
      };
    }
  }

  return { valid: true };
}
