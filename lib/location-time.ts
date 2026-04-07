export function parseLocation(location?: string | null) {
  if (!location) return { city: "Bengaluru", country: "India" };

  const parts = location
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return { city: "Bengaluru", country: "India" };
  }

  if (parts.length === 1) {
    return { city: parts[0], country: "" };
  }

  return { city: parts[0], country: parts[parts.length - 1] };
}
