import { MetadataRoute } from "next";
import { PILLARS } from "@/lib/taxonomy";

const BASE_URL = "https://www.eternityproducts.online";

// Legacy category slugs now 301 to their canonical pillar (see next.config.ts). Keeping crawlers
// off them avoids burning crawl budget on redirect chains.
const LEGACY_CATEGORY_PATHS = PILLARS.flatMap((p) => p.aliases.map((alias) => `/c/${alias}`));

const DISALLOW = [
  "/admin/",
  "/api/",
  "/salon/",
  "/order/", // personalised order tracking
  "/checkout", // was "/checkout?*", which only matched URLs that had a query string
  ...LEGACY_CATEGORY_PATHS,
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },

      // AI assistants and answer engines. Allowed deliberately: being cited by ChatGPT,
      // Perplexity and Claude is worth more to this business than the crawl cost.
      // Note Google AI Overviews / AI Mode are governed by ordinary Googlebot rules and
      // snippet directives, not by anything here.
      { userAgent: "GPTBot", allow: "/", disallow: DISALLOW },
      { userAgent: "OAI-SearchBot", allow: "/", disallow: DISALLOW },
      { userAgent: "ChatGPT-User", allow: "/", disallow: DISALLOW },
      { userAgent: "ClaudeBot", allow: "/", disallow: DISALLOW },
      { userAgent: "Claude-Web", allow: "/", disallow: DISALLOW },
      { userAgent: "PerplexityBot", allow: "/", disallow: DISALLOW },
      { userAgent: "Applebot-Extended", allow: "/", disallow: DISALLOW },

      // Google-Extended controls Gemini training and Vertex grounding OUTSIDE Search.
      // It has no effect on AI Overviews or AI Mode eligibility.
      { userAgent: "Google-Extended", allow: "/", disallow: DISALLOW },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
