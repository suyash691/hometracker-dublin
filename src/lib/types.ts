export const HOUSE_STATUSES = [
  "wishlist", "viewing_scheduled", "viewed", "bidding",
  "sale_agreed", "conveyancing", "closing", "closed", "dropped",
] as const;

export const PROPERTY_TYPES = [
  "house", "apartment", "duplex", "bungalow", "terraced", "semi_detached", "detached",
] as const;

export const ACTION_CATEGORIES = [
  "viewing", "legal", "mortgage", "survey", "renovation", "insurance", "other",
] as const;

export const MORTGAGE_STATUSES = [
  "researching", "documents_gathering", "submitted",
  "approval_in_principle", "full_approval", "drawdown",
] as const;

export type HouseStatus = (typeof HOUSE_STATUSES)[number];
export type PropertyType = (typeof PROPERTY_TYPES)[number];
export type ActionCategory = (typeof ACTION_CATEGORIES)[number];

export interface ChecklistItem { name: string; checked: boolean; notes: string; }
