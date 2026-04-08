export interface ShowcaseFallbackItem {
  type: string;
  caption: string;
  likes: string;
  comments: string;
  views: string | null;
}

export const SHOWCASE_FALLBACK: ShowcaseFallbackItem[] = [
  {
    type: "Reel",
    caption:
      "Tried this amazing biryani at the new outlet and honestly blown away by the flavors! Must visit if you're in Koramangala.",
    likes: "12.4K",
    comments: "342",
    views: "89K",
  },
  {
    type: "Post",
    caption:
      "Summer collection drop! Every piece is handcrafted with love. Swipe to see my favorites from the lookbook shoot.",
    likes: "8.2K",
    comments: "215",
    views: null,
  },
  {
    type: "Reel",
    caption:
      "Honest review of the new skincare range — no filter, no edits. Here's what actually worked for my skin.",
    likes: "15.1K",
    comments: "523",
    views: "112K",
  },
  {
    type: "Story",
    caption:
      "BTS from today's cafe shoot. The vibe, the coffee, the content — everything was perfect.",
    likes: "6.8K",
    comments: "128",
    views: "45K",
  },
];
