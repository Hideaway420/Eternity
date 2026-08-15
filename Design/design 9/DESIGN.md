---
name: Serene Opulence
colors:
  surface: '#fbf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae8e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#454742'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0f0'
  outline: '#767872'
  outline-variant: '#c6c7c0'
  surface-tint: '#5e5e5c'
  primary: '#5e5e5c'
  on-primary: '#ffffff'
  primary-container: '#fdfbf7'
  on-primary-container: '#747471'
  inverse-primary: '#c8c6c3'
  secondary: '#566060'
  on-secondary: '#ffffff'
  secondary-container: '#d7e2e1'
  on-secondary-container: '#5a6564'
  tertiary: '#665c5c'
  on-tertiary: '#ffffff'
  tertiary-container: '#fffaf9'
  on-tertiary-container: '#7b7170'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e4e2de'
  primary-fixed-dim: '#c8c6c3'
  on-primary-fixed: '#1b1c1a'
  on-primary-fixed-variant: '#474744'
  secondary-fixed: '#dae5e4'
  secondary-fixed-dim: '#bec9c8'
  on-secondary-fixed: '#131d1d'
  on-secondary-fixed-variant: '#3e4948'
  tertiary-fixed: '#eddfde'
  tertiary-fixed-dim: '#d0c4c3'
  on-tertiary-fixed: '#211a1a'
  on-tertiary-fixed-variant: '#4d4544'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style
The design system is anchored in a **Luxury Minimalist** aesthetic, specifically tailored for the high-end B2B salon furniture market. The brand personality is tranquil, professional, and sophisticated, aiming to evoke the sensory experience of a high-end spa before a single product is even purchased.

The interface prioritizes breathing room (whitespace) and editorial-style layouts. It avoids the cluttered nature of traditional e-commerce in favor of a "digital showroom" experience. Visuals are treated with atmospheric softness, utilizing high-quality photography and subtle transitions to communicate quality and craftsmanship to salon owners and beauty professionals.

## Colors
This design system utilizes a palette of "atmospheric neutrals" to create a sense of calm. 

- **Soft Ivory (#FDFBF7):** The primary surface color. Use this for backgrounds to provide a warmer, more premium feel than pure white.
- **Spa Blue (#E3EEED) & Blush Pink (#F9EBEA):** Used for subtle section differentiation, category tags, or secondary backgrounds. These should never compete for attention but rather provide a soft wash of color.
- **Brushed Gold (#D4AF37):** Reserved exclusively for high-intent actions, primary buttons, and premium indicators. It signifies the "Luxe" element of the brand.
- **Charcoal (#333333):** Used for all primary text and iconography to ensure high legibility while maintaining a softer contrast than pure black.

## Typography
The typography strategy relies on the contrast between the authoritative, literary feel of **Playfair Display** and the functional, modern clarity of **Inter**.

- **Headlines:** Use Playfair Display for all headings (H1-H4). Larger display sizes should utilize a slight negative letter-spacing to enhance the premium editorial look.
- **Body:** Use Inter for all product descriptions, technical specifications, and general UI text. The line height is intentionally generous (1.6) to improve readability and maintain the "airy" feel of the brand.
- **Labels:** Small labels, category names, and navigation items should use Inter in uppercase with increased letter-spacing for a sophisticated, structured appearance.

## Layout & Spacing
The layout follows a **Fixed Grid** model on desktop to maintain an editorial feel, centered within a 1440px container. 

- **Desktop (1440px+):** 12-column grid with 24px gutters and wide 64px side margins.
- **Tablet (768px - 1439px):** 8-column grid with 24px gutters and 32px margins.
- **Mobile (< 767px):** 4-column grid with 16px gutters and 16px margins.

Spacing follows an 8px base unit. To maintain the luxury feel, utilize large vertical padding (80px - 120px) between major sections to prevent the UI from feeling cramped.

## Elevation & Depth
This design system avoids harsh shadows in favor of **Ambient Depth**. Hierarchy is established through:

1.  **Low-Contrast Shadows:** Shadows use the primary charcoal color at very low opacity (3-5%) with high blur radii (20px+) to create a soft, lifted effect for cards and modals.
2.  **Tonal Stacking:** Using the Blush Pink or Spa Blue as subtle "backplates" for specific content blocks to create depth without using shadows.
3.  **Glassmorphism:** For navigation bars and floating headers, use a high-density background blur (20px) combined with the Soft Ivory color at 80% opacity to maintain a sense of lightness and transparency.

## Shapes
The shape language is defined by **Rounded-XL (24px)** corners on all major container elements like product cards, hero images, and modal windows. 

- **Primary Containers:** 24px (rounded-xl) to evoke comfort and softness.
- **Buttons and Inputs:** 12px (rounded-lg) to balance the softness with a sense of professional precision.
- **Iconography:** Use a consistent 2px stroke weight with rounded caps and joins to match the soft UI edges.

## Components
- **Buttons:** Primary buttons use the Brushed Gold background with Charcoal text. The hover state should involve a subtle shift in brightness and a slight "lift" (y-axis translation of -2px). Secondary buttons use a Charcoal outline with a transparent background.
- **Input Fields:** Use a Soft Ivory background with a subtle 1px border in a darkened version of Spa Blue. On focus, the border transitions to Brushed Gold.
- **Product Cards:** These feature the 24px rounded corners and a very soft ambient shadow. Typography within the card should be minimalist, prioritizing the product name in Playfair Display.
- **Chips/Tags:** Use the Spa Blue or Blush Pink as background colors with Charcoal text, featuring fully rounded (pill) ends.
- **Interactivity:** All state changes (hover, focus, active) must use a smooth transition (duration: 300ms, easing: cubic-bezier(0.4, 0, 0.2, 1)). This ensures the "tranquil" feel is maintained during navigation.