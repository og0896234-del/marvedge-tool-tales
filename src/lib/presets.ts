import { COUNTRY_SHAPES } from "@/lib/country-shapes";

export type Preset = { title: string; w: number; h: number; kb?: number; mm?: string };
export type PresetCategory = { name: string; items: Preset[] };
export type PresetGroup = {
  id: string;
  name: string;
  flag?: string;
  shape?: keyof typeof COUNTRY_SHAPES;
  icon?: "briefcase" | "phone" | "cart";
  blurb: string;
  categories: PresetCategory[];
};

export const PRESET_GROUPS: PresetGroup[] = [
  {
    id: "india",
    name: "India",
    flag: "🇮🇳",
    shape: "india",
    blurb: "Passport Seva, exams, PAN",
    categories: [
      {
        name: "Photos",
        items: [
          { title: "Passport / Passport Seva", w: 413, h: 531, kb: 100, mm: "35×45 mm" },
          { title: "SSC / Govt exam photo", w: 350, h: 450, kb: 50, mm: "3.5×4.5 cm" },
          { title: "UPSC photo", w: 350, h: 350, kb: 300 },
          { title: "PAN card photo", w: 213, h: 213, kb: 50 },
          { title: "Aadhaar / small form", w: 200, h: 230, kb: 50 },
          { title: "OCI / e-Visa photo", w: 600, h: 600, kb: 1000, mm: "2×2 in" },
        ],
      },
      {
        name: "Signatures",
        items: [
          { title: "SSC / Govt exam signature", w: 400, h: 200, kb: 20, mm: "4×2 cm" },
          { title: "UPSC signature", w: 350, h: 350, kb: 300 },
          { title: "PAN card signature", w: 213, h: 100, kb: 50, mm: "2×4.5 cm" },
          { title: "Bank / IBPS signature", w: 140, h: 60, kb: 20 },
        ],
      },
    ],
  },
  {
    id: "usa",
    name: "USA",
    flag: "🇺🇸",
    shape: "usa",
    blurb: "Passport, DV lottery, licence",
    categories: [
      {
        name: "Photos",
        items: [
          { title: "Passport / visa photo", w: 600, h: 600, kb: 240, mm: "2×2 in" },
          { title: "Green card (DV lottery)", w: 600, h: 600, kb: 240 },
          { title: "USCIS / driver's licence", w: 600, h: 600, mm: "2×2 in" },
        ],
      },
      {
        name: "Signatures",
        items: [{ title: "Application signature", w: 600, h: 200, kb: 100 }],
      },
    ],
  },
  {
    id: "europe",
    name: "Europe & UK",
    flag: "🇪🇺",
    shape: "europe",
    blurb: "UK passport, Schengen, Germany",
    categories: [
      {
        name: "Photos",
        items: [
          { title: "EU / Schengen passport", w: 413, h: 531, mm: "35×45 mm" },
          { title: "UK passport (online)", w: 600, h: 750, kb: 10000 },
          { title: "Germany biometric", w: 413, h: 531, mm: "35×45 mm" },
          { title: "Schengen visa", w: 413, h: 531, kb: 500, mm: "35×45 mm" },
        ],
      },
      {
        name: "Signatures",
        items: [{ title: "Schengen signature", w: 531, h: 177, mm: "45×15 mm" }],
      },
    ],
  },
  {
    id: "mideast",
    name: "Middle East",
    flag: "🌍",
    shape: "mideast",
    blurb: "UAE, Saudi, Qatar, Oman",
    categories: [
      {
        name: "Photos",
        items: [
          { title: "UAE visa / Emirates ID", w: 508, h: 650, mm: "43×55 mm" },
          { title: "Saudi visa", w: 472, h: 709, mm: "4×6 cm" },
          { title: "Qatar visa", w: 449, h: 567, mm: "38×48 mm" },
          { title: "Oman / Kuwait / Bahrain", w: 472, h: 709, mm: "40×60 mm" },
        ],
      },
      {
        name: "Signatures",
        items: [{ title: "Application signature", w: 400, h: 150, kb: 50 }],
      },
    ],
  },
  {
    id: "job",
    name: "Job & profile",
    icon: "briefcase",
    blurb: "Résumé, LinkedIn, email",
    categories: [
      {
        name: "Sizes",
        items: [
          { title: "Résumé photo", w: 300, h: 400 },
          { title: "LinkedIn profile", w: 400, h: 400 },
          { title: "LinkedIn banner", w: 1584, h: 396 },
          { title: "Email signature logo", w: 300, h: 100 },
        ],
      },
    ],
  },
  {
    id: "social",
    name: "Social media",
    icon: "phone",
    blurb: "Posts, stories, thumbnails",
    categories: [
      {
        name: "Sizes",
        items: [
          { title: "Instagram post", w: 1080, h: 1080 },
          { title: "Instagram / Reels story", w: 1080, h: 1920 },
          { title: "LinkedIn post", w: 1200, h: 627 },
          { title: "YouTube thumbnail", w: 1280, h: 720 },
          { title: "X / Twitter", w: 1600, h: 900 },
          { title: "Facebook cover", w: 1640, h: 624 },
        ],
      },
    ],
  },
  {
    id: "shop",
    name: "Ecommerce",
    icon: "cart",
    blurb: "Amazon, Shopify, Etsy",
    categories: [
      {
        name: "Sizes",
        items: [
          { title: "Amazon / Flipkart product", w: 2000, h: 2000 },
          { title: "Shopify product", w: 2048, h: 2048 },
          { title: "Etsy listing", w: 2000, h: 1600 },
        ],
      },
    ],
  },
];

export const allPresets = () => PRESET_GROUPS.flatMap((g) => g.categories.flatMap((c) => c.items));
