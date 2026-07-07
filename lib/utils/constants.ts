export const STORAGE_KEYS = {
  THEME: "nagrik_theme",
  LOCALE: "nagrik_locale",
  SUBMISSIONS: "nagrik_submissions",
} as const;

export const FORM_LIMITS = {
  MIN_DESCRIPTION: 10,
  MAX_DESCRIPTION: 500,
} as const;

export interface CategoryConfig {
  key: string;
  prefix: string;
  labelKey: string;
  descKey: string;
  icon: string;
}

export const CATEGORIES: Record<string, CategoryConfig> = {
  roads: {
    key: "roads",
    prefix: "RD",
    labelKey: "category.roads",
    descKey: "category.roadsDesc",
    icon: "Road",
  },
  garbage: {
    key: "garbage",
    prefix: "GB",
    labelKey: "category.garbage",
    descKey: "category.garbageDesc",
    icon: "Trash2",
  },
  water: {
    key: "water",
    prefix: "WS",
    labelKey: "category.water",
    descKey: "category.waterDesc",
    icon: "Droplet",
  },
  streetlights: {
    key: "streetlights",
    prefix: "SL",
    labelKey: "category.streetlights",
    descKey: "category.streetlightsDesc",
    icon: "Lightbulb",
  },
  safety: {
    key: "safety",
    prefix: "PS",
    labelKey: "category.safety",
    descKey: "category.safetyDesc",
    icon: "ShieldAlert",
  },
  other: {
    key: "other",
    prefix: "OT",
    labelKey: "category.other",
    descKey: "category.otherDesc",
    icon: "HelpCircle",
  },
} as const;

export const CATEGORY_LIST = Object.values(CATEGORIES);
