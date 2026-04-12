export type SortField = "followers" | "price" | "engagement";
export type SortDirection = "desc" | "asc";

export interface DiscoverFilters {
  place: string;
  category: string;
  priceRange: [number, number];
  sortField: SortField;
  sortDirection: SortDirection;
}

export type FilterStep =
  | "root"
  | "place"
  | "category"
  | "price"
  | "sort";

export interface FilterPanelProps {
  open: boolean;
  onClose: () => void;
  onApply: () => void;
  onClearAll: () => void;
  draftFilters: DiscoverFilters;
  setDraftFilters: (
    updater: (prev: DiscoverFilters) => DiscoverFilters,
  ) => void;
  placeOptions: string[];
  categoryOptions: string[];
  priceBounds: [number, number];
  resultCount: number;
  filterCount: number;
}

export const DESKTOP_SPRING = {
  type: "spring" as const,
  stiffness: 340,
  damping: 36,
};

export const MOBILE_SPRING = {
  type: "spring" as const,
  stiffness: 300,
  damping: 34,
};

export function formatPriceShort(value: number) {
  if (value >= 100000) return `₹${Math.round(value / 1000)}k`;
  if (value >= 1000) return `₹${Math.round(value / 1000)}k`;
  return `₹${value}`;
}

export function formatPriceFull(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function summarizePrice(
  [min, max]: [number, number],
  bounds: [number, number],
) {
  if (min === bounds[0] && max === bounds[1]) return "Any budget";
  return `${formatPriceShort(min)} - ${formatPriceShort(max)}`;
}
