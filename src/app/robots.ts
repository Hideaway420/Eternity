import { MetadataRoute } from "next";

const BASE_URL = "https://www.eternityproducts.online";

// Legacy category aliases are deliberately NOT disallowed, for two reasons:
//
// 1. robots.txt Disallow is PREFIX matching, not exact matching. "Disallow: /c/hair-dryers" also
//    blocks /c/hair-dryers-curlers, and "Disallow: /c/manicure-pedicure" also blocks
//    /c/manicure-pedicure-spa-furniture. An earlier version of this file did exactly that and
//    blocked the two highest-value category pages on the site while the sitemap still submitted
//    them. Never add a Disallow entry that is a prefix of a canonical URL.
// 2. The aliases 301 to their canonical pillar (see CATEGORY_REDIRECTS in next.config.ts).
//    Blocking a redirect stops crawlers following it, which prevents link equity consolidating
//    on the canonical URL. Letting them crawl the redirect is the point.
const DISALLOW = [
  "/admin/",
  "/api/",
  "/salon/",
  "/order/", // personalised order tracking
  "/checkout", // was "/checkout?*", which only matched URLs that had a query string
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
