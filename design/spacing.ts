export const spacing = {
  space1: "4px",   // Micro alignments, label-to-input gap
  space2: "8px",   // Form input margins, list item spacing
  space3: "12px",  // Inside padding for small buttons
  space4: "16px",  // Main body margins, standard card padding
  space6: "24px",  // Gutter between grid categories, space between fields
  space8: "32px",  // Margins between sections, title-to-description gaps
  space12: "48px", // Header to main layout separation
  space16: "64px", // Top/bottom page margins, signature checkmark clearance
} as const;

export type SpacingToken = keyof typeof spacing;
