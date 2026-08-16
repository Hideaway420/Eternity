// Dictionary for Dual Language (English / Nepali)
import { useState } from "react";

export type Language = "en" | "np";

export function useLanguage() {
  const [lang, setLang] = useState<Language>("en");
  const toggleLanguage = () => setLang((prev) => (prev === "en" ? "np" : "en"));
  return { lang, isNp: lang === "np", toggleLanguage, t: translations[lang] };
}

export const translations = {
  en: {
    // Navigation
    official_brand: "Official Ikonic Nepal",
    delivery_announcement: "🚚 Open-Box Cash on Delivery Across Kathmandu & Major Nepal Cities",
    home: "Home",
    straighteners: "Straighteners",
    dryers: "Dryers & Curlers",
    salon_furniture: "Salon Furniture",
    b2b_bulk: "B2B Bulk",
    authenticity: "Authenticity",
    salon_account: "Salon Account",
    search_placeholder: "Search straightener, dryer, barber chair...",

    // Hero Section
    authorized_distributor: "Nepal's Authorized Ikonic Importer & Distributor",
    hero_title: "Serene Opulence in Hair Styling & Salon Excellence",
    hero_subtitle:
      "Elevate your personal styling routine or beauty parlour floor with Ikonic titanium straighteners, high-velocity blow dryers, and customizable hydraulic barber chairs.",
    shop_tools: "Shop Styling Tools",
    b2b_wholesale: "B2B Salon Wholesale",
    genuine_seal: "100% Genuine Seal",
    open_box_cod: "Open-Box COD",
    one_year_warranty: "1-Yr Warranty",

    // Color Customizer Section
    custom_themes: "Custom Salon Styling Themes",
    custom_title: "Customize Your Salon Furniture Color Scheme",
    custom_desc:
      "Top salon chains in Kathmandu match their equipment leather with interior lighting. Choose between 4 signature upholstery themes for your barber chairs and spa beds.",
    emerald_green: "Emerald Green",
    obsidian_black: "Obsidian Black",
    espresso_brown: "Espresso Brown",
    burgundy_red: "Burgundy Red",

    // Categories
    catalogue: "Catalogue",
    explore_category: "Explore By Category",
    view_all_cat: "View All Categories",

    // Best Sellers
    best_sellers: "Consumer Best Sellers",
    styling_tools_title: "Professional Hair Styling Tools",
    view_tool: "View Tool",

    // B2B Section
    high_margin_title: "High-Margin Salon Fit-Outs",
    chairs_basins_title: "Professional Barber Chairs & Shampoo Basins",
    payback_estimate: "Payback Investment Estimate",
    select_color_quote: "Select Color & Request Quote",

    // Authenticity Guarantee
    authenticity_promise: "असली उत्पादन Promise (Authenticity Guarantee)",
    verify_serial_title: "Open The Box & Verify Serial Before Paying",
    verify_serial_desc:
      "We believe trust is built on transparency. Our riders will allow you to open the outer box and verify your Ikonic product, serial hologram, and Eternity warranty card before handing over cash on delivery.",
    verify_button: "Verify Serial Number",

    // PDP Labels
    choose_leather_theme: "1. Choose Leather / Finish Theme:",
    buy_now_cod: "Buy Now — Open-Box Cash on Delivery",
    request_b2b_quote: "Request Custom B2B Quote",
    nationwide_delivery: "Nepal Nationwide Delivery",
    kathmandu_valley: "Kathmandu Valley",
    outside_valley: "Outside Valley",

    // Checkout
    express_checkout: "1-Page Express Checkout",
    order_summary: "Order Summary",
    place_order_cod: "Confirm Order — Cash on Delivery",
  },
  np: {
    // Navigation
    official_brand: "आधिकारिक आइकोनिक नेपाल",
    delivery_announcement: "🚚 काठमाडौँ र प्रमुख सहरहरूमा ओपन-बक्स क्यास अन डेलिभरी",
    home: "गृहपृष्ठ",
    straighteners: "स्ट्रेटरहरू",
    dryers: "ड्रायर र कर्लर",
    salon_furniture: "सलोन फर्निचर",
    b2b_bulk: "थोक B2B",
    authenticity: "असली उत्पादन",
    salon_account: "सलोन खाता",
    search_placeholder: "स्ट्रेटर, ड्रायर, कुर्सी खोज्नुहोस्...",

    // Hero Section
    authorized_distributor: "नेपालको आधिकारिक आइकोनिक आयातकर्ता र वितरक",
    hero_title: "केश शैली र सलोन उत्कृष्टतामा नयाँ चमक",
    hero_subtitle:
      "आइकोनिक टाइटेनियम स्ट्रेटर, तीव्र गतिको ड्रायर, र अनुकूलन योग्य हाइड्रोलिक कुर्सीहरूद्वारा आफ्नो सलोन वा व्यक्तिगत सुन्दरता बढाउनुहोस्।",
    shop_tools: "केश शैली औजारहरू किन्नुहोस्",
    b2b_wholesale: "सलोन थोक व्यापार",
    genuine_seal: "१००% असली छाप",
    open_box_cod: "ओपन-बक्स क्यास अन डेलिभरी",
    one_year_warranty: "१-वर्षे वारेन्टी",

    // Color Customizer Section
    custom_themes: "सलोन स्टाइल रङ विषयवस्तुहरू",
    custom_title: "आफ्नो सलोन फर्निचरको रङ छान्नुहोस्",
    custom_desc:
      "काठमाडौँका उत्कृष्ट सलोनहरूले आफ्नो भित्री प्रकाशसँग कुर्सीको छालाको रङ मिलाउँछन्। चार मुख्य रङ विषयवस्तुहरू मध्येबाट छान्नुहोस्।",
    emerald_green: "एमराल्ड हरियो",
    obsidian_black: "अब्सीडियन कालो",
    espresso_brown: "इस्प्रेसो खैरो",
    burgundy_red: "बर्गेन्डी रातो",

    // Categories
    catalogue: "सामग्री सूची",
    explore_category: "वर्ग अनुसार हेर्नुहोस्",
    view_all_cat: "सबै वर्गहरू हेर्नुहोस्",

    // Best Sellers
    best_sellers: "लोकप्रिय उत्पादनहरू",
    styling_tools_title: "व्यावसायिक केश शैली औजारहरू",
    view_tool: "हेर्नुहोस्",

    // B2B Section
    high_margin_title: "उच्च नाफा दिने सलोन सामानहरू",
    chairs_basins_title: "व्यावसायिक नाइ कुर्सी र स्याम्पु बेसिन",
    payback_estimate: "लगानी फिर्ता अनुमान",
    select_color_quote: "रङ छान्नुहोस् र कोटेशन माग्नुहोस्",

    // Authenticity Guarantee
    authenticity_promise: "असली उत्पादन प्रतिज्ञा (Authenticity Guarantee)",
    verify_serial_title: "पैसा तिर्नु अघि बाकस खोलेर सिरियल नम्बर जाँच्नुहोस्",
    verify_serial_desc:
      "हामी विश्वास र पारदर्शितामा भरोसा गर्छौं। हाम्रा डेलिभरी राइडरले क्यास अन डेलिभरी भुक्तानी अघि बाकस खोलेर इटरनिटी वारेन्टी कार्ड र सिरियल होलोग्राम जाँच्ने अनुमति दिन्छन्।",
    verify_button: "सिरियल नम्बर जाँच्नुहोस्",

    // PDP Labels
    choose_leather_theme: "१. छाला वा रङ विषयवस्तु छान्नुहोस्:",
    buy_now_cod: "अहिले किन्नुहोस् — ओपन-बक्स क्यास अन डेलिभरी",
    request_b2b_quote: "थोक B2B कोटेशन माग्नुहोस्",
    nationwide_delivery: "नेपालभरि डेलिभरी सेवा",
    kathmandu_valley: "काठमाडौँ उपत्यका",
    outside_valley: "उपत्यका बाहिर",

    // Checkout
    express_checkout: "१-पृष्ठ एक्सप्रेस चेकाउट",
    order_summary: "अर्डर विवरण",
    place_order_cod: "अर्डर पक्का गर्नुहोस् — क्यास अन डेलिभरी",
  },
};
