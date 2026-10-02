/** Require explicit acceptTerms=1 (or "on"/"true") on submit APIs. */
export function hasAcceptedTerms(value: FormDataEntryValue | null | unknown): boolean {
  return value === "1" || value === "on" || value === "true";
}
