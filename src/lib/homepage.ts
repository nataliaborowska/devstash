import { Code, File, Folder, Search, Sparkles, Terminal, type LucideIcon } from "lucide-react";

// Same colors as the seeded system item types, so the homepage matches the app.
export const TYPE_COLORS = {
  snippet: "#3b82f6",
  prompt: "#8b5cf6",
  command: "#f97316",
  note: "#fde047",
  file: "#6b7280",
  image: "#ec4899",
  link: "#10b981",
} as const;

export type HomepageTypeKey = keyof typeof TYPE_COLORS;

export const SECTION_IDS = { features: "features", pricing: "pricing" } as const;

export interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

export const FEATURES: Feature[] = [
  {
    title: "Code Snippets",
    description: "Save reusable code in any language with syntax highlighting and a real code editor.",
    icon: Code,
    color: TYPE_COLORS.snippet,
  },
  {
    title: "AI Prompts",
    description: "Keep your best system messages and prompts versioned, tagged, and ready to paste.",
    icon: Sparkles,
    color: TYPE_COLORS.prompt,
  },
  {
    title: "Instant Search",
    description: "Hit ⌘K and find anything across titles, content, tags, and types in milliseconds.",
    icon: Search,
    color: TYPE_COLORS.link,
  },
  {
    title: "Commands",
    description: "Stop digging through bash history. Store the terminal commands you always forget.",
    icon: Terminal,
    color: TYPE_COLORS.command,
  },
  {
    title: "Files & Docs",
    description: "Upload templates, PDFs, and context files so they live next to the code that uses them.",
    icon: File,
    color: TYPE_COLORS.file,
  },
  {
    title: "Collections",
    description: "Group items of any type into collections like React Patterns or Interview Prep.",
    icon: Folder,
    color: TYPE_COLORS.note,
  },
];

export const CHAOS_ICON_IDS = [
  "notion",
  "github",
  "slack",
  "vscode",
  "browser",
  "terminal",
  "text-file",
  "bookmark",
] as const;

export type ChaosIconId = (typeof CHAOS_ICON_IDS)[number];

export interface MockNavItem {
  label: string;
  color: string;
}

export const MOCK_NAV: MockNavItem[] = [
  { label: "Snippets", color: TYPE_COLORS.snippet },
  { label: "Prompts", color: TYPE_COLORS.prompt },
  { label: "Commands", color: TYPE_COLORS.command },
  { label: "Notes", color: TYPE_COLORS.note },
  { label: "Links", color: TYPE_COLORS.link },
  { label: "Files", color: TYPE_COLORS.file },
];

export interface MockItem {
  title: string;
  color: string;
}

export const MOCK_ITEMS: MockItem[] = [
  { title: "useDebounce hook", color: TYPE_COLORS.snippet },
  { title: "Code review prompt", color: TYPE_COLORS.prompt },
  { title: "git undo commit", color: TYPE_COLORS.command },
  { title: "Deploy checklist", color: TYPE_COLORS.note },
  { title: "Tailwind v4 docs", color: TYPE_COLORS.link },
  { title: "Schema diagram", color: TYPE_COLORS.image },
];

export const AI_CAPABILITIES = [
  "Auto-tagging suggests tags from your content",
  "One-line AI summaries for every item",
  "Plain-English explanations of any code",
  "Prompt optimizer rewrites prompts for better results",
];

export const AI_TAGS = ["react", "hooks", "typescript", "debounce", "performance"];

export type BillingPeriod = "monthly" | "yearly";

export interface PlanPrice {
  amount: string;
  period: string;
  note: string;
}

export interface PricingPlan {
  id: "free" | "pro";
  name: string;
  featured: boolean;
  prices: Record<BillingPeriod, PlanPrice>;
  features: string[];
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    featured: false,
    prices: {
      monthly: { amount: "$0", period: "/forever", note: "For trying DevStash out." },
      yearly: { amount: "$0", period: "/forever", note: "For trying DevStash out." },
    },
    features: ["50 items", "3 collections", "Instant search", "Image uploads"],
  },
  {
    id: "pro",
    name: "Pro",
    featured: true,
    prices: {
      monthly: { amount: "$8", period: "/month", note: "Billed monthly. Cancel anytime." },
      yearly: { amount: "$72", period: "/year", note: "Just $6/month, billed yearly." },
    },
    features: [
      "Unlimited items",
      "Unlimited collections",
      "AI features",
      "All file uploads",
      "Custom item types",
      "Export to JSON / ZIP",
    ],
  },
];

export interface HomepageLink {
  label: string;
  href: string;
}

export interface HomepageLinks {
  heroPrimary: HomepageLink;
  ctaPrimary: HomepageLink;
  plans: Record<PricingPlan["id"], HomepageLink>;
  footer: { title: string; links: HomepageLink[] }[];
}

const FEATURES_LINK: HomepageLink = { label: "Features", href: `#${SECTION_IDS.features}` };
const PRICING_LINK: HomepageLink = { label: "Pricing", href: `#${SECTION_IDS.pricing}` };

export const NAV_LINKS: HomepageLink[] = [FEATURES_LINK, PRICING_LINK];

// Header buttons are the same for every visitor.
export const NAV_ACTIONS = {
  signIn: { label: "Sign In", href: "/sign-in" },
  getStarted: { label: "Get Started", href: "/register" },
} as const satisfies Record<string, HomepageLink>;

// Where each homepage CTA goes, depending on whether the visitor is signed in.
// Stripe isn't built yet, so "Upgrade to Pro" goes to registration or settings.
export function getHomepageLinks(isSignedIn: boolean): HomepageLinks {
  if (isSignedIn) {
    return {
      heroPrimary: { label: "Go to Dashboard", href: "/dashboard" },
      ctaPrimary: { label: "Go to Dashboard", href: "/dashboard" },
      plans: {
        free: { label: "Go to Dashboard", href: "/dashboard" },
        pro: { label: "Upgrade to Pro", href: "/settings" },
      },
      footer: [
        { title: "Product", links: [FEATURES_LINK, PRICING_LINK] },
        {
          title: "Account",
          links: [
            { label: "Dashboard", href: "/dashboard" },
            { label: "Settings", href: "/settings" },
          ],
        },
      ],
    };
  }

  return {
    heroPrimary: { label: "Get Started Free", href: "/register" },
    ctaPrimary: { label: "Get Started Free", href: "/register" },
    plans: {
      free: { label: "Get Started", href: "/register" },
      pro: { label: "Upgrade to Pro", href: "/register" },
    },
    footer: [
      { title: "Product", links: [FEATURES_LINK, PRICING_LINK] },
      {
        title: "Account",
        links: [
          { label: "Sign In", href: "/sign-in" },
          { label: "Register", href: "/register" },
        ],
      },
    ],
  };
}
