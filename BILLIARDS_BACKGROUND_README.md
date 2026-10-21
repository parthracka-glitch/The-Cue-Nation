# Billiards Website Background - Documentation

The website utilizes a high-resolution top-down billiards table background image (`/images/billiards-bg.jpg`) with dark vignette and atmospheric gradient overlays for optimal text legibility and rich visual aesthetics across all routes. The former heavy 3D Three.js WebGL physics animations have been removed in favor of instant page loads, zero GPU overhead, and seamless mobile responsiveness.

---

## 1. File Locations
- **Background Image**: `public/images/billiards-lounge-bg.jpg`
- **Background Component**: `components/billiards/BilliardsBackground.tsx`
- **Root Layout Mounting**: `app/layout.tsx`
- **Hero Section**: `components/billiards/BilliardsHero.tsx`
- **Global CSS & Body Stacking**: `app/globals.css`

---

## 2. Layering & Stacking Context Architecture
The background is mounted in the root layout (`app/layout.tsx`) to persist smoothly across route transitions:

- **Layer 0 (`z-0`)**: `<BilliardsBackground />` with `fixed inset-0 z-0 pointer-events-none overflow-hidden`.
- **Layer 10 (`relative z-10`)**: Root content wrapper `<div className="relative z-10 min-h-screen flex flex-col">{children}</div>`.
- **Layer 40 (`z-40`)**: Sticky navigation header (`sticky top-0 z-40 bg-ivory/90 backdrop-blur-md`).
- **Layer 50 (`z-50`)**: Dialogs, Modals, Sheets, and Dropdown Menus.
- **Layer 9999 (`z-[9999]`)**: Toast notifications (`<Toaster />`).

All pointer events pass cleanly through the background layer to foreground controls.

---

## 3. Visual Styling & Atmosphere
- **Photographic Background**: Top-down view featuring green cloth felt, cue stick, cue ball, and the 15-ball triangle rack.
- **Vignette & Contrast Overlays**: Dual-layer radial and linear gradients ensure crisp contrast for typography, buttons, and navigation elements while preserving the dark luxury cue-sports mood.
