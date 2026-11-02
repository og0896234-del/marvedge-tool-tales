import { COUNTRY_SHAPES } from "@/lib/country-shapes";

export type Preset = { title: string; w: number; h: number; kb?: number; mm?: string; note?: string };
export type PresetCategory = { name: string; items: Preset[] };
export type PresetGroup = {
  id: string;
  name: string;
  flag?: string;
  shape?: keyof typeof COUNTRY_SHAPES;
  icon?: "briefcase" | "phone" | "cart" | "file";
  blurb: string;
  categories: PresetCategory[];
};

export const PRESET_GROUPS: PresetGroup[] = [
  {
    id: "india",
    name: "India",
    flag: "🇮🇳",
    shape: "india",
    blurb: "Govt IDs, exams, banking",
    categories: [
      {
        name: "ID & govt",
        items: [
          { title: "Aadhaar photo", w: 413, h: 531, mm: "3.5×4.5 cm", note: "Captured at the enrolment centre" },
          { title: "PAN card photo", w: 295, h: 413, mm: "2.5×3.5 cm", note: "Form 49A" },
          { title: "Voter ID / Form 6", w: 413, h: 531, mm: "3.5×4.5 cm", note: "White background" },
          { title: "Overseas voter / Form 6A", w: 413, h: 413, mm: "3.5×3.5 cm" },
          { title: "Driving licence (Sarathi)", w: 420, h: 525, kb: 20, mm: "35×45 mm", note: "10–20 KB" },
          { title: "Indian passport-style", w: 413, h: 531, mm: "3.5×4.5 cm" },
          { title: "Indian visa photo", w: 600, h: 600, kb: 300, note: "350–1000 px square, 10–300 KB" },
          { title: "Indian e-Visa photo", w: 600, h: 600, kb: 1024, note: "Square, 10 KB–1 MB" },
        ],
      },
      {
        name: "Exams",
        items: [
          { title: "GATE photo", w: 413, h: 531, kb: 600, mm: "35×45 mm", note: "5–600 KB, JPG" },
          { title: "IBPS / banking photo", w: 200, h: 230, kb: 50, note: "20–50 KB" },
          { title: "SSC photograph", w: 200, h: 230, kb: 50, mm: "3.5×4.5 cm", note: "20–50 KB · new forms use live capture" },
          { title: "UPSC ORA photo", w: 110, h: 140, kb: 40 },
          { title: "NTA JEE / NEET photo", w: 413, h: 531, kb: 200, note: "10–200 KB" },
          { title: "NEET postcard photo", w: 1200, h: 1800, mm: "4×6 in" },
        ],
      },
      {
        name: "Signatures",
        items: [
          { title: "IBPS / banking signature", w: 140, h: 60, kb: 20, note: "10–20 KB" },
          { title: "Sarathi signature", w: 256, h: 64, kb: 20, note: "10–20 KB" },
          { title: "SSC signature", w: 709, h: 236, kb: 20, mm: "6×2 cm", note: "10–20 KB" },
          { title: "UPSC ORA signature", w: 140, h: 110, kb: 40 },
          { title: "GATE signature", w: 580, h: 180, kb: 300, note: "3–300 KB" },
          { title: "NTA JEE / NEET signature", w: 350, h: 150, kb: 100, note: "10–100 KB" },
          { title: "NTA small signature", w: 300, h: 100, kb: 30, note: "4–30 KB" },
          { title: "RRB signature", w: 140, h: 60, kb: 49, note: "30–49 KB" },
          { title: "General signature", w: 600, h: 200, kb: 100 },
        ],
      },
      {
        name: "Thumb & declaration",
        items: [
          { title: "IBPS left thumb", w: 240, h: 240, kb: 50, note: "20–50 KB" },
          { title: "Thumb impression 200", w: 200, h: 200 },
          { title: "Thumb impression 300", w: 300, h: 300 },
          { title: "Fingerprint square", w: 600, h: 600 },
          { title: "IBPS handwritten declaration", w: 800, h: 400, kb: 100, note: "50–100 KB" },
          { title: "Declaration 600×300", w: 600, h: 300 },
          { title: "Declaration 400×200", w: 400, h: 200 },
        ],
      },
      {
        name: "Generic photos",
        items: [
          { title: "Passport 35×45 mm", w: 413, h: 531, mm: "35×45 mm" },
          { title: "Passport 25×35 mm", w: 295, h: 413, mm: "25×35 mm" },
          { title: "Square 35×35 mm", w: 413, h: 413 },
          { title: "Photo 100×120", w: 100, h: 120 },
          { title: "Photo 150×200", w: 150, h: 200 },
          { title: "Square 200×200", w: 200, h: 200, kb: 50 },
          { title: "Square 300×300", w: 300, h: 300 },
          { title: "Square 350×350", w: 350, h: 350, kb: 300 },
          { title: "Square 2×2 inch", w: 600, h: 600, kb: 1024 },
        ],
      },
    ],
  },
  {
    id: "usa",
    name: "USA & Canada",
    flag: "🇺🇸",
    shape: "usa",
    blurb: "Passport, visa, Canada",
    categories: [
      {
        name: "Photos",
        items: [
          { title: "US passport", w: 602, h: 602, kb: 240, mm: "51×51 mm" },
          { title: "US visa", w: 600, h: 600, kb: 240, note: "Square" },
          { title: "Canada passport", w: 591, h: 827, mm: "50×70 mm" },
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
    blurb: "UK, Germany, France, Italy",
    categories: [
      {
        name: "Photos",
        items: [
          { title: "UK passport", w: 413, h: 531, mm: "35×45 mm" },
          { title: "UK visa", w: 413, h: 531, mm: "35×45 mm" },
          { title: "Germany biometric", w: 413, h: 531, mm: "35×45 mm" },
          { title: "France passport / ID", w: 413, h: 531, mm: "35×45 mm" },
          { title: "Italy passport / ID", w: 413, h: 531, mm: "35×45 mm" },
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
    blurb: "UAE, Saudi, Bahrain, Qatar",
    categories: [
      {
        name: "Photos",
        items: [
          { title: "Emirates ID", w: 413, h: 531, mm: "35×45 mm" },
          { title: "Saudi passport", w: 472, h: 709, mm: "40×60 mm" },
          { title: "Saudi visa", w: 602, h: 602, mm: "51×51 mm" },
          { title: "Bahrain CPR", w: 384, h: 508, mm: "32.5×43 mm" },
          { title: "Bahrain visa", w: 472, h: 709, mm: "40×60 mm" },
          { title: "Qatar national ID", w: 449, h: 567, mm: "38×48 mm" },
          { title: "Kuwait visa", w: 413, h: 531, mm: "35×45 mm" },
        ],
      },
      {
        name: "Signatures",
        items: [{ title: "Application signature", w: 400, h: 150, kb: 50 }],
      },
    ],
  },
  {
    id: "oceania",
    name: "Australia & NZ",
    flag: "🇦🇺",
    shape: "oceania",
    blurb: "Passport, citizenship",
    categories: [
      {
        name: "Photos",
        items: [
          { title: "Australian passport", w: 413, h: 531, mm: "35×45 mm" },
          { title: "Australian citizenship", w: 413, h: 531, mm: "35×45 mm" },
          { title: "New Zealand passport / visa", w: 413, h: 531, mm: "35×45 mm" },
        ],
      },
    ],
  },
  {
    id: "latam",
    name: "Latin America",
    flag: "🌎",
    shape: "latam",
    blurb: "Brazil, Mexico",
    categories: [
      {
        name: "Photos",
        items: [
          { title: "Brazil passport / visa", w: 413, h: 531, mm: "35×45 mm" },
          { title: "Mexico passport / visa", w: 413, h: 531, mm: "35×45 mm" },
        ],
      },
    ],
  },
  {
    id: "africa",
    name: "Africa",
    flag: "🌍",
    shape: "africa",
    blurb: "South Africa, Egypt",
    categories: [
      {
        name: "Photos",
        items: [
          { title: "South Africa passport / visa", w: 413, h: 531, mm: "35×45 mm" },
          { title: "Egypt passport / visa", w: 472, h: 709, mm: "40×60 mm" },
        ],
      },
    ],
  },
  {
    id: "docs",
    name: "Documents",
    icon: "file",
    blurb: "A4 scans, certificates",
    categories: [
      {
        name: "Sizes",
        items: [
          { title: "A4 scan (150 DPI)", w: 1240, h: 1754, mm: "210×297 mm" },
          { title: "A4 scan (200 DPI)", w: 1654, h: 2339, kb: 300, note: "PAN supporting docs ≤300 KB/page" },
          { title: "IBPS certificate", w: 1240, h: 1754, kb: 500 },
        ],
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
