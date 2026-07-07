import { CATEGORIES } from "./constants";

/**
 * Generates a unique, professional report reference ID.
 * Format: [Category Prefix]-[5 Uppercase Alphanumeric Characters]
 * Example: RD-B8D2K
 */
export function generateReferenceId(categoryKey: string): string {
  const config = CATEGORIES[categoryKey];
  const prefix = config ? config.prefix : "OT";

  // Use uppercase alphanumeric alphabet excluding visually ambiguous characters like O, 0, I, 1 for premium legibility
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  
  let suffix = "";
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    suffix += alphabet.charAt(randomIndex);
  }

  return `${prefix}-${suffix}`;
}

export default generateReferenceId;
