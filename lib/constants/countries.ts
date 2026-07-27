// Deliberately short: covers Fortress's actual markets (US, India) plus common
// signup origins. Not ISO-3166 exhaustive — add more if users request them.
export const COUNTRIES: { code: string; name: string }[] = [
  { code: "US", name: "United States" },
  { code: "IN", name: "India" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "SG", name: "Singapore" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "DE", name: "Germany" },
  { code: "OTHER", name: "Other" },
];

export const SIGNUP_PURPOSES: { value: string; label: string }[] = [
  { value: "learning", label: "Learning / education" },
  { value: "active_trading", label: "Active trading" },
  { value: "portfolio_tracking", label: "Portfolio tracking" },
  { value: "research", label: "Research / analysis" },
  { value: "other", label: "Other" },
];

export const REFERRAL_SOURCES: { value: string; label: string }[] = [
  { value: "google", label: "Google search" },
  { value: "twitter_x", label: "Twitter / X" },
  { value: "reddit", label: "Reddit" },
  { value: "youtube", label: "YouTube" },
  { value: "friend_referral", label: "Friend or colleague" },
  { value: "other", label: "Other" },
];
