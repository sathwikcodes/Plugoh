// Utility to generate SVG data URIs for dock icons.
// Each lucide icon exports an __iconNode: [tag, attrs][] array.
// We reconstruct it as an inline SVG with a pink badge background.

type IconNode = [string, Record<string, string | number>][];

export function makeDockIcon(nodes: IconNode): string {
  const children = nodes
    .map(([tag, attrs]) => {
      const attrStr = Object.entries(attrs)
        .filter(([k]) => k !== "key") // strip lucide's internal key prop
        .map(([k, v]) => `${k}="${v}"`)
        .join(" ");
      return `<${tag} ${attrStr}/>`;
    })
    .join("");

  // Pink rounded-square background (#ec4899 = Tailwind pink-500) with white icon
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#ec4899"/><g transform="translate(12,12)" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none">${children}</g></svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
