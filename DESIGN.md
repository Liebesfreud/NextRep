---
version: 3.0
name: NextRep Design System
description: >
  Dark-first fitness tracker with an energetic orange accent and restrained elegance.
  Built on Expo + NativeWind + rn-primitives (Shadcn/RNR pattern), the system
  leverages component-library pragmatism while injecting identity through signature
  color, tabular-numeral typography, athletic spring choreography, bespoke
  data-visualization components, and context-aware UI that responds to training intensity.

colors:
  # ── Surface ──
  background: "#0A0A0F"
  surface: "#141419"
  surface-elevated: "#1C1C24"
  surface-hover: "#222230"

  # ── Brand / Accent ──
  accent: "#FF6B2C"
  primary: "#FAFAFA"

  # ── Semantic ──
  success: "#30D158"
  warning: "#FFD60A"
  danger: "#FF453A"
  info: "#0A84FF"

  # ── Text ──
  text-primary: "#F5F5F7"
  text-secondary: "#8E8E93"
  text-tertiary: "#636366"

  # ── Structure ──
  border: "#FFFFFF12"
  border-strong: "#FFFFFF24"
  overlay: "#00000099"

  # ── Data Visualization ──
  viz-muscle-chest: "#0A84FF"
  viz-muscle-back: "#30D158"
  viz-muscle-shoulders: "#FF6B2C"
  viz-muscle-legs: "#FF9F0A"
  viz-muscle-arms: "#30D158"
  viz-muscle-core: "#FF453A"
  viz-muscle-cardio: "#5AC8FA"
  viz-zone-low: "#30D158"
  viz-zone-mid: "#FFD60A"
  viz-zone-high: "#FF6B2C"
  viz-zone-max: "#FF453A"

  # ── Light Mode ──
  light-background: "#FAFAFA"
  light-surface: "#FFFFFF"
  light-surface-elevated: "#F4F4F5"
  light-accent: "#E85D20"
  light-text-primary: "#18181B"
  light-text-secondary: "#71717A"
  light-text-tertiary: "#A1A1AA"
  light-border: "#18181B14"
  light-border-strong: "#18181B24"
  light-overlay: "#09090B5A"

typography:
  hero-stat:     { fontSize: 48px, fontWeight: 700, lineHeight: 1.0,  letterSpacing: "-0.03em", fontFeature: "'tnum'" }
  large-stat:    { fontSize: 32px, fontWeight: 700, lineHeight: 1.1,  letterSpacing: "-0.02em", fontFeature: "'tnum'" }
  title:         { fontSize: 28px, fontWeight: 600, lineHeight: 1.15, letterSpacing: "-0.02em" }
  heading:       { fontSize: 22px, fontWeight: 600, lineHeight: 1.2,  letterSpacing: "-0.01em" }
  subheading:    { fontSize: 17px, fontWeight: 600, lineHeight: 1.3 }
  body:          { fontSize: 15px, fontWeight: 400, lineHeight: 1.6 }
  body-semibold: { fontSize: 15px, fontWeight: 600, lineHeight: 1.6 }
  stat-value:    { fontSize: 20px, fontWeight: 700, lineHeight: 1.2,  fontFeature: "'tnum'" }
  caption:       { fontSize: 12px, fontWeight: 400, lineHeight: 1.4 }
  micro:         { fontSize: 10px, fontWeight: 500, lineHeight: 1.3 }

iconography:
  xs:  { size: 12px, strokeWidth: 2.0 }
  sm:  { size: 16px, strokeWidth: 2.0 }
  md:  { size: 20px, strokeWidth: 2.0 }
  lg:  { size: 24px, strokeWidth: 1.5 }
  xl:  { size: 32px, strokeWidth: 1.5 }

rounded:  { sm: 8px, md: 12px, lg: 16px, xl: 20px, pill: 9999px }
spacing:  { edge-x: 20px, section-gap: 24px, card-gap: 12px, card-padding: 16px, item-gap: 8px }
---

# NextRep Design System v3

> *Dark-first fitness tracker · Orange-accent identity · Elegant & restrained motion*
> *Reference companion: `AGENTS.md` for token rules and coding conventions*

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Token Integration Architecture](#2-token-integration-architecture)
3. [Colors](#3-colors)
4. [Typography](#4-typography)
5. [Iconography](#5-iconography)
6. [Layout & Spacing](#6-layout--spacing)
7. [Elevation & Depth](#7-elevation--depth)
8. [Shapes & Borders](#8-shapes--borders)
9. [Components](#9-components)
10. [Data Visualization](#10-data-visualization)
11. [Motion Design](#11-motion-design)
12. [State Design](#12-state-design)
13. [Contextual UI](#13-contextual-ui)
14. [Voice & Tone](#14-voice--tone)
15. [Accessibility](#15-accessibility)
16. [Light Mode](#16-light-mode)
17. [Migration Roadmap](#17-migration-roadmap)

---

## 1. Design Philosophy

### "克制的热忱" (Restrained Passion)

Fitness apps run hot — energy, motivation, competition. But visual noise kills usability. NextRep's identity lives in the *tension* between these two forces:

- **Restraint**: Monochromatic dark surfaces, minimal borders, generous whitespace, systematic spacing. 80% of the visual field is quiet.
- **Passion**: The orange accent fires only when it matters — the primary CTA, the active state, the personal record. It *earns* its attention.

### The Emotional Arc: Start Calm, Build Heat, Earn the Climax

Beyond the static 80/20 ratio, the design system follows a **time-based emotional curve** across every user session:

| Phase | User State | Visual Language | Duration |
|-------|-----------|----------------|----------|
| **Arrival** | Opening the app, scanning data | Dark void, quiet typography, muted stats — "the calm before" | Instant → 3s |
| **Decision** | Choosing what to do | Accent appears: orange CTA button, active tab indicator — "the spark" | 1–5s |
| **Engagement** | In-workout, logging sets | Darker backgrounds, focused SetCounter, minimal chrome — "the tunnel" | Minutes |
| **Feedback** | Set complete, exercise done | Micro → Meso celebration tiers, green flashes, haptics — "the rhythm" | 150–500ms per event |
| **Climax** | PR achieved, workout finished | Macro tier: gradient shimmer, confetti, heavy haptic — "the earned moment" | 3–8s |
| **Return** | Back to dashboard, reviewing | Stats settle, rings fill, data breathes — "the exhale" | 2–5s |

> **Key rule**: The emotional arc must build. Orange should appear *progressively*, not flood the screen on launch. If a user opens the app and sees 5 orange elements immediately, the accent has no power left.

### The 20/80 Identity Rule

Five decisions create 80% of visual identity. Everything else is infrastructure:

1. **Background color** — `#0A0A0F`, not generic `#111` — a cooler, deeper near-black with blue undertone
2. **Accent color** — `#FF6B2C`, warm orange — energy, action, used sparingly but decisively
3. **Hero number typography** — 48px Bold, tabular-nums, tracking-tight — numbers *are* the interface
4. **Spring personality** — Snappy-athletic (damping 20, stiffness 300) — moves like an athlete, not a robot
5. **Signature component** — The StatCard with animated counter + sparkline — what people screenshot

### What We Keep vs What We Transform

**Keep as-is (infrastructure UI):** Text inputs, separators, toggles, dropdowns, dialogs, skeleton loaders. Shadcn/RNR's accessibility patterns, focus management, and keyboard interactions are *non-differentiating*.

**Transform aggressively (identity surfaces):** Stat cards, workout rows, progress rings, exercise detail headers, celebration moments, page transitions, chart visualizations, empty/loading/error states. These are where NextRep's personality lives.

---

## 2. Token Integration Architecture

### 2.1 Token Architecture

```
DESIGN.md (spec)
    │
    ├── tailwind.theme.json (design tokens — NativeWind extension)
    │       └── loaded by tailwind.config.js
    │             └── becomes NativeWind utility classes at compile time
    │
    ├── global.css (CSS variables — source of truth for runtime theme)
    │       └── consumed by tailwind.config.js
    │             └── bg-background, text-foreground, border-border, etc.
    │
    └── constants/colors.ts (runtime bridge for dynamic values)
            └── consumed by useTheme() hook
                  └── SVG fills, Reanimated animations, dynamic chart colors
```

### 2.2 Dark-First Cascade

The CSS cascade is **dark-first**: `:root` defines dark mode values as the default. `.light` overrides them. This eliminates the flash-of-light-mode on app launch and aligns with the app's primary identity.

```
:root        → dark mode values (default)
.light       → light mode overrides (secondary)
```

This is critical because Expo's splash screen and initial render use `:root` values. See [Section 16](#16-light-mode) for the full dark-first implementation strategy.

### 2.3 CSS Variable → NativeWind Mapping

| CSS var | NativeWind Class | Value |
|---------|-----------------|-------|
| `--background` | `bg-background` | `#0A0A0F` |
| `--surface` | `bg-surface` | `#141419` |
| `--surface-elevated` | `bg-surface-elevated` | `#1C1C24` |
| `--surface-hover` | `bg-surface-hover` | `#222230` |
| `--accent` | `bg-accent`, `text-accent` | `#FF6B2C` |
| `--primary` | `bg-primary`, `text-primary` | `#FAFAFA` (foreground) |
| `--text-secondary` | `text-text-secondary` | `#8E8E93` |
| `--text-tertiary` | `text-text-tertiary` | `#636366` |
| `--success` | `bg-success`, `text-success` | `#30D158` |
| `--warning` | `bg-warning`, `text-warning` | `#FFD60A` |
| `--danger` | `bg-danger`, `text-danger` | `#FF453A` |
| `--info` | `bg-info`, `text-info` | `#0A84FF` |
| `--border` | `border-border` | `#FFFFFF12` |
| `--border-strong` | `border-border-strong` | `#FFFFFF24` |

### 2.4 Naming Convention Rules

| Category | Convention | Example |
|----------|-----------|---------|
| Surface colors | `bg-{name}` | `bg-surface`, `bg-surface-elevated` |
| Text colors | `text-{name}` | `text-primary`, `text-secondary` |
| Semantic colors | `{prefix}-{name}` | `bg-success`, `text-danger` |
| Viz colors | `{prefix}-viz-{category}-{name}` | `bg-viz-muscle-chest` |
| Typography | `text-{token}` | `text-hero-stat`, `text-stat-value` |
| Iconography | `icon-{size}` | `icon-md` (20px), `icon-xl` (32px) |
| Spacing | `{property}-{token}` | `p-card-padding`, `gap-section-gap` |
| Radius | `rounded-{token}` | `rounded-lg`, `rounded-pill` |

---

## 3. Colors

### 3.1 Surface Hierarchy

The background system creates depth through *increasing luminance*, not elevation shadows:

| Token | Hex | Role |
|-------|-----|------|
| `bg-background` | `#0A0A0F` | Root — the void |
| `bg-surface` | `#141419` | Cards, sheets — one step up from the void |
| `bg-surface-elevated` | `#1C1C24` | Hovered/pressed cards, input backgrounds, chart tooltips |
| `bg-surface-hover` | `#222230` | Active hover feedback (web), skeleton shimmer peak |

**Key decision**: `#0A0A0F` (not `#000` or `#111`). The cool blue undertone gives the dark surface a *quality* feel — like a premium matte phone case vs. flat black paint. Note: this is an OLED-first choice. On LCD Android devices it renders as a very dark cool gray — acceptable and still premium.

### 3.2 Accent: The Orange Thread

`#FF6B2C` is NextRep's signature. Usage rules:

- ✅ **Accent buttons** (Start Workout, Start Exercise — the "fire" CTA)
- ✅ **Active/focused states** (selected tab, active toggle, selected exercise)
- ✅ **PR/Achievement celebrations** (PR banner border, confetti trigger)
- ✅ **Single highlight per card** (one stat number, one progress indicator)
- ✅ **Progressive appearance** — start with 0–1 orange element on screen, build to 2–3 during engagement
- ❌ **Never** as a section background, card fill, or decorative gradient
- ❌ **Never** combined with another warm color in the same view
- ❌ **Never** more than one orange element on the launch/home screen

> **Why orange?** Strava (`#FC4C02`) proved that orange = energy + motivation without the danger signal of red. Our `#FF6B2C` is warmer, slightly more playful — gym energy, not race energy.

> **Button strategy**: **Primary buttons** use a white surface with orange text (WCAG-safe, high contrast). **Accent buttons** use the solid orange fill — reserved for the single most important action on screen (Start Workout). This creates a visual hierarchy: accent > primary > secondary > ghost.

### 3.3 Semantic Colors

- **Success** (`#30D158`): Set complete, workout done, PR achieved, recovered state
- **Warning** (`#FFD60A`): Near-failure set, approaching volume limit, moderate strain
- **Danger** (`#FF453A`): Missed rep, skipped workout, overtraining alert, destructive actions
- **Info** (`#0A84FF`): Secondary accent, contrast data (e.g., chart comparison color), tips

### 3.4 Data Visualization Palette

Muscle-group color mapping **must stay consistent** across every chart, heatmap, and card in the app:

| Muscle Group | Color | Hex | NativeWind Class |
|-------------|-------|-----|-----------------|
| Chest, Full Body | Blue | `#0A84FF` | `bg-viz-muscle-chest`, `text-viz-muscle-chest` |
| Back, Arms | Green | `#30D158` | `bg-viz-muscle-back`, `text-viz-muscle-back` |
| Shoulders | Orange | `#FF6B2C` | `bg-viz-muscle-shoulders`, `text-viz-muscle-shoulders` |
| Legs | Amber | `#FF9F0A` | `bg-viz-muscle-legs`, `text-viz-muscle-legs` |
| Core | Red | `#FF453A` | `bg-viz-muscle-core`, `text-viz-muscle-core` |
| Cardio | Cyan | `#5AC8FA` | `bg-viz-muscle-cardio`, `text-viz-muscle-cardio` |

Intensity zones (for heart rate / strain):

| Zone | Color | Meaning | NativeWind Class |
|------|-------|---------|-----------------|
| Low | `#30D158` | Recovery / warm-up | `bg-viz-zone-low` |
| Mid | `#FFD60A` | Moderate effort | `bg-viz-zone-mid` |
| High | `#FF6B2C` | Threshold | `bg-viz-zone-high` |
| Max | `#FF453A` | Maximum / overreach | `bg-viz-zone-max` |

---

## 4. Typography

### 4.1 The Type Scale

NextRep's type scale is organized by *purpose*, not abstract size names:

| Token | Size | Weight | tnum | Use |
|-------|------|--------|------|-----|
| `hero-stat` | 48px | 700 | ✅ | Recovery score, total volume, workout duration on dashboard |
| `large-stat` | 32px | 700 | ✅ | Secondary scores, in-workout timer |
| `title` | 28px | 600 | — | Page titles |
| `heading` | 22px | 600 | — | Section headings |
| `subheading` | 17px | 600 | — | Card titles, exercise names |
| `body` | 15px | 400 | — | Descriptions, instructions, notes |
| `body-semibold` | 15px | 600 | — | Emphasized body text |
| `stat-value` | 20px | 700 | ✅ | In-card stats (sets × reps, weight lifted) |
| `caption` | 12px | 400 | — | Timestamps, units (kg, lbs, reps), date labels |
| `micro` | 10px | 500 | — | Set type indicators (W/D/F), tiny labels |

### 4.2 Tabular Numerals: Non-Negotiable

Every number that represents a measurable value **must** use `font-variant-numeric-tabular-nums`. This ensures digits don't visually shift as `9` becomes `10`, or `99` becomes `100`.

**Applies to**: All stat values, weights, reps, durations, percentages, scores.
**Doesn't apply to**: Prose text, labels, descriptions.

### 4.3 Number Display Conventions

- **Right-align** numbers in columns (sets across exercises)
- **Fixed-width containers** for animated/changing stats (prevent layout shift)
- **Animate value changes**: Counter spring animation from old → new value
- **Unit labels**: Lighter weight + smaller + same baseline as the number
  - ✅ `245` **lbs** — number in `stat-value`, unit in `caption`
  - ❌ `245 lbs` — all same style

### 4.4 Font Family

Default: **System font** (SF Pro on iOS, Roboto on Android). Zero-cost, highly optimized, already includes tabular figures. Custom font (Inter or Geist) is a Phase 4 consideration.

---

## 5. Iconography

### 5.1 Icon Size Tokens

| Token | Size | Stroke | Use |
|-------|------|--------|-----|
| `icon-xs` | 12px | 2.0px | Inline micro labels, set type badges |
| `icon-sm` | 16px | 2.0px | Card header icons, button icons, list item indicators |
| `icon-md` | 20px | 2.0px | **Tab bar icons** (default), section header icons |
| `icon-lg` | 24px | 1.5px | Hero stat companions, empty state illustrations |
| `icon-xl` | 32px | 1.5px | PR celebration, onboarding feature highlights |

> **Stroke width rule**: `icon-lg` and `icon-xl` use 1.5px stroke for a more refined, premium feel. `icon-xs` through `icon-md` use 2.0px for clarity at small sizes.

### 5.2 Icon Color Rules

| Context | Color Token | Rationale |
|---------|------------|-----------|
| Primary action (CTA button) | `text-accent` | Orange accent draws attention to the action |
| Active tab bar item | `text-accent` | Indicates current screen |
| Inactive tab bar item | `text-tertiary` | Quiet, doesn't compete with active tab |
| Default icon (cards, rows) | `text-secondary` | Visible but not dominant |
| Disabled / completed state | `text-tertiary` | Diminished to indicate inactive state |
| Muscle-group indicator | Viz muscle color | Follows muscle color map (Section 3.4) |
| Danger / destructive | `text-danger` | Red for delete, remove, warning |
| Success / completion | `text-success` | Green for checkmark, done, achieved |

### 5.3 Context Mapping

| Context | Icon Size | Color | Example |
|---------|----------|-------|---------|
| Tab bar (active) | `icon-md` | `text-accent` | Dumbbell, BarChart3, Sparkles, Settings |
| Tab bar (inactive) | `icon-md` | `text-tertiary` | |
| Card header | `icon-sm` | follows card accent | `text-viz-muscle-chest` for chest card |
| Button (with icon) | `icon-sm` | matches button text color | Play icon in "Start Workout" |
| Hero stat companion | `icon-lg` | `text-accent` | Flame icon next to "12,480 lbs" |
| Exercise row indicator | `icon-sm` | muscle viz color | 3px left border + icon |
| Empty state illustration | `icon-xl` | `text-tertiary` | Dumbbell at 64px for "No workouts yet" |
| Set type badge | `icon-xs` | `text-tertiary` | W/D/F inline indicators |

### 5.4 Icon Library

**Primary**: `lucide-react-native` — all icons from this library.
**Fallback**: Custom SVG for muscle-group icons not in Lucide.

Do **not** mix icon libraries on the same screen. All icons in a view must come from the same family with consistent stroke characteristics.

---

## 6. Layout & Spacing

### 6.1 The Spacing Token System

| Token | Value | NativeWind Class | Use |
|-------|-------|-----------------|-----|
| `edge-x` | 20px | `px-edge-x` | Horizontal page padding |
| `section-gap` | 24px | `gap-section-gap` | Between major content sections |
| `card-gap` | 12px | `gap-card-gap` | Between sibling cards |
| `card-padding` | 16px | `p-card-padding` | Internal card padding |
| `item-gap` | 8px | `gap-item-gap` | Between items within a card |

### 6.2 Page Anatomy

```
┌──────────────────────────────┐
│  Status Bar (system)        │
├──────────────────────────────┤
│  ← px-edge-x (20)           │
│  ┌──────────────────────┐   │
│  │ Header               │   │
│  │   Title + Subtitle   │   │
│  └──────────────────────┘   │
│                              │
│  ┌──────────────────────┐   │
│  │ Stat Card (hero)     │   │
│  │   48px number        │   │
│  └──────────────────────┘   │
│         ↕ gap-card-gap      │
│  ┌──────────────────────┐   │
│  │ Section              │   │
│  │  ┌────────────────┐  │   │
│  │  │ Card           │  │   │
│  │  └────────────────┘  │   │
│  │         ↕ gap-card-gap│  │
│  │  ┌────────────────┐  │   │
│  │  │ Card           │  │   │
│  │  └────────────────┘  │   │
│  └──────────────────────┘   │
│                              │
│  ↕ gap-section-gap           │
│  ┌──────────────────────┐   │
│  │ Next Section...      │   │
│  └──────────────────────┘   │
│                              │
│  ↕ 100px bottom safe area   │
├──────────────────────────────┤
│  Tab Bar (floating)          │
└──────────────────────────────┘
```

### 6.3 Page Layout Pattern (Code Template)

```tsx
<View className="flex-1 bg-background">
  <ScrollView
    contentContainerStyle={{
      paddingHorizontal: 20,       // px-edge-x
      paddingTop: insets.top + 16,
      paddingBottom: 100 + insets.bottom,
      gap: 24,                     // section-gap
    }}
  >
    {/* Header */}
    {/* Stat Cards — hero section */}
    {/* Section — card stack with gap-card-gap */}
    {/* Next section... */}
  </ScrollView>
</View>
```

### 6.4 Composed View Blueprints

These blueprints show how components combine to form complete screens. They are reference layouts, not rigid templates.

#### Home Screen (Launch State)

```
┌────────────────────────────────┐
│  [greeting]                    │  ← body text-secondary, no icon
│  Today's Training              │  ← title text-primary
│                                │
│  ┌────────────────────────┐   │
│  │ 🔥  Weekly Volume      │   │  ← StatCard (hero variant)
│  │     12,480 lbs         │   │     bg-surface, rounded-lg
│  │     ▲ 8% · ───────    │   │     hero-stat text-accent, sparkline
│  └────────────────────────┘   │
│                                │
│  ┌────────────────────────┐   │
│  │ Today's Workout    [3] │   │  ← Section heading
│  │ ┌──────────────────┐  │   │
│  │ │ 🏋️ Bench Press  ▶│  │   │  ← ExerciseRow × N
│  │ │ 4×8 · 185 lbs    │  │   │     bg-surface-elevated,
│  │ └──────────────────┘  │   │     muscle accent left border
│  │ ┌──────────────────┐  │   │
│  │ │ 🏋️ Squat       ▶│  │   │
│  │ │ 3×10 · 225 lbs   │  │   │
│  │ └──────────────────┘  │   │
│  └────────────────────────┘   │
│                                │
│  [+ Add Exercise]             │  ← ghost button, text-accent
│                                │
│  [    Start Workout     ]     │  ← accent button (solid orange), lg
│                                │     Fixed at bottom or inline
└────────────────────────────────┘
```

#### Home Screen (Empty State — No Workouts Yet)

```
┌────────────────────────────────┐
│  Today's Training              │
│                                │
│               🏋️               │  ← icon-xl, text-tertiary
│         Ready to move?         │  ← subheading text-primary
│     Your first workout is      │  ← body text-secondary
│      waiting on the other      │
│          side of "start"       │
│                                │
│    [  Create First Workout ]   │  ← accent button, lg
└────────────────────────────────┘
```

#### Dashboard Screen (Data-Loaded State)

```
┌────────────────────────────────┐
│  Dashboard                     │  ← title
│  Last 7 days                   │  ← caption text-secondary
│                                │
│  ┌────────────────────────┐   │
│  │       78               │   │  ← StatCard (hero)
│  │   Recovery Score        │   │     ProgressRing (inside card)
│  │   ▲ 5 pts              │   │
│  └────────────────────────┘   │
│                                │
│  ┌──────────┐ ┌──────────┐   │
│  │ 12,480  │ │  6,200   │   │  ← StatCard × 2 (compact, side-by-side)
│  │ Volume   │ │  Est. 1RM│   │
│  └──────────┘ └──────────┘   │
│                                │
│  Training Overview             │  ← heading
│  ┌────────────────────────┐   │
│  │ [bar chart: 7-day vol] │   │
│  └────────────────────────┘   │
│                                │
│  Body Metrics                  │  ← heading
│  ┌────────────────────────┐   │
│  │ [line chart: weight]   │   │
│  └────────────────────────┘   │
└────────────────────────────────┘
```

#### In-Workout Screen (Active State)

```
┌────────────────────────────────┐
│  ← Back    Bench Press    ⋮   │  ← minimal header
│                                │
│         Set 3 of 4            │  ← caption text-secondary
│                                │
│  ┌────────────────────────┐   │
│  │                        │   │
│  │     −   185   +        │   │  ← SetCounter (large)
│  │          lbs           │   │     large-stat text-accent
│  │                        │   │     +/- rounded-sm bg-surface-elevated
│  └────────────────────────┘   │
│                                │
│  ┌────────────────────────┐   │
│  │     −    8    +        │   │  ← SetCounter (default)
│  │         reps           │   │
│  └────────────────────────┘   │
│                                │
│  [  Set Complete  ]          │   ← success button (green)
│                                │
│  Previous sets:               │  ← caption text-secondary
│  1. 185 × 8 ✓                 │  ← body text-primary
│  2. 185 × 7 ✓                 │
└────────────────────────────────┘
```

---

## 7. Elevation & Depth

### Shadow-Free Philosophy (Dark Mode)

On dark surfaces, shadows are *nearly invisible*. NextRep creates depth through **luminance layering** (background → surface → surface-elevated), not drop shadows.

| Elevation | NativeWind Class | When to Use |
|-----------|-----------------|-------------|
| `none` | `shadow-none` | Default state for all cards and surfaces |
| `subtle` | `shadow-subtle` | Floating tab bar, toast notifications |
| `medium` | `shadow-medium` | Bottom sheets, modals (when they float above content) |
| `strong` | `shadow-strong` | Onboarding overlays, alert dialogs |

**Glassmorphism** (selective, not pervasive):
- ✅ Floating stat overlays during active workout
- ✅ Modal/Bottom Sheet backdrop blur
- ❌ Never on regular content cards
- ❌ Never on text-heavy surfaces

> **Platform note**: `backdrop-blur-xl` is a web-only Tailwind utility. On React Native, use `expo-blur`'s `<BlurView>` component. The glassmorphism formula maps to: `<BlurView intensity={80} tint="dark">` with `bg-[rgba(255,255,255,0.06)]` overlay and `border border-[rgba(255,255,255,0.10)]`.

---

## 8. Shapes & Borders

### 8.1 Border Radius Identity

NextRep uses a **"generous curve"** system:

| Token | Value | NativeWind Class | Use |
|-------|-------|-----------------|-----|
| `sm` | 8px | `rounded-sm` | Buttons, badges, inputs |
| `md` | 12px | `rounded-md` | Toggle groups, chips, chart bars (top corners) |
| `lg` | 16px | `rounded-lg` | **Cards, sheets** — signature radius |
| `xl` | 20px | `rounded-xl` | Bottom sheets, modals, hero cards |
| `pill` | 9999px | `rounded-pill` | Pills, badges, toggles |

### 8.2 Border Strategy

- **Default**: Cards have `border border-border` for visual anchoring in dark mode. Sub-regions use spacing and surface color for hierarchy.
- **When borders are needed**: `border border-border` (12% white opacity)
- **Emphasis borders**: `border border-border-strong` (24% white opacity)
- **Accent border**: `border border-accent/30` — *only* for selected/active interactive cards
- **Status borders** (left edge on cards): 3px in semantic or muscle viz color — for ExerciseRow and similar list items

---

## 9. Components

### 9.1 Signature Components (Identity-Defining)

These 5 components are what make NextRep look like **NextRep**, not a Shadcn template.

#### 9.1.1 `<StatCard>` — The Hero Data Display

The primary card for displaying a metric with trend. This is NextRep's "WHOOP dial".

```
┌────────────────────────────┐
│  🔥 Weekly Volume         │  ← caption label + viz color icon
│                            │
│  12,480                    │  ← hero-stat, tabular-nums
│  lbs                       │  ← caption, text-tertiary
│                            │
│  ▲ 8% vs last week  ───── │  ← caption, success color + sparkline
└────────────────────────────┘
```

**Props API**:
```typescript
interface StatCardProps {
  label: string;              // "Weekly Volume"
  value: number;              // 12480
  unit: string;               // "lbs"
  trend?: { direction: 'up' | 'down'; percentage: number };  // ▲ 8%
  color?: string;             // viz token color for icon + sparkline
  icon?: React.ReactNode;     // lucide icon, icon-lg size
  sparklineData?: number[];   // 7-day data points
  formatValue?: (v: number) => string;  // "12,480"
  animating?: boolean;        // spring counter on mount
  variant?: 'hero' | 'compact';  // hero = 48px, compact = 20px
}
```

**Implementation rules**:
- Background: `bg-surface`, rounded: `rounded-lg`, padding: `p-card-padding`
- Value: `text-hero-stat font-variant-numeric-tabular-nums text-accent`
- Use `spring` counter animation on mount (values animate from 0 → actual)
- Sparkline: 7-day mini chart, same color as the metric's viz palette
- Trend: Green (`text-success`) for positive, `text-danger` for negative
- Icon: `icon-lg` size, follows the card's color prop

#### 9.1.2 `<ExerciseRow>` — The Fitness Workhorse

The repeating unit in workout logging. Compact, data-rich, tappable.

```
┌──────────────────────────────────────┐
│  🏋️ Bench Press                 ▶  │
│  4 × 8  ·  185 lbs            ⋮   │
└──────────────────────────────────────┘
```

**Props API**:
```typescript
interface ExerciseRowProps {
  name: string;               // "Bench Press"
  muscleGroup: MuscleGroup;   // 'chest' | 'back' | 'shoulders' | 'legs' | 'core' | 'cardio'
  sets: { completed: number; total: number };  // 4 × 8
  weight: number;             // 185
  weightUnit: string;         // "lbs"
  isCompleted?: boolean;      // dims content, shows checkmark
  onPress?: () => void;
  onOptions?: () => void;
}
```

**Implementation rules**:
- Tappable row → opens exercise detail
- Muscle group accent: **Left border 3px** in muscle viz color
- Icon: `icon-sm` in muscle viz color, inside the row
- Sets display: `text-caption`, weight: `text-stat-value font-variant-numeric-tabular-nums`
- Completion state: Name + number shift to `text-tertiary`, checkmark replaces ▶, border shifts to `text-success`
- Wrap in `AnimatedPressable` with `activeScale={0.985}`

#### 9.1.3 `<ProgressRing>` — Circular Goal Visualization

SVG arc progress indicator. Wraps any content inside (number, icon, label).

**Props API**:
```typescript
interface ProgressRingProps {
  progress: number;           // 0-100 percentage
  size?: number;              // 64 | 96 | 40
  strokeWidth?: number;       // default: size * 0.12
  color?: string;             // accent or muscle-group color
  trackColor?: string;        // surface-elevated
  children?: React.ReactNode; // content inside the ring
  animated?: boolean;         // spring fill on mount
  duration?: number;          // animation duration (default 1200ms)
}
```

**Implementation rules**:
- SVG using `react-native-svg`
- Ring stroke: `accent` color (or muscle-group color)
- Track stroke: `bg-surface-elevated`
- Animated fill on mount: spring animation over 1200ms
- Size variants: 64px (in-card), 96px (dashboard hero), 40px (inline)
- Inner radius: 70% of outer radius

#### 9.1.4 `<PRBanner>` — Personal Record Celebration

An ephemeral component that appears when a personal record is broken.

**Props API**:
```typescript
interface PRBannerProps {
  exerciseName: string;       // "Bench Press"
  value: string;              // "195 lbs"
  type: 'weight' | 'reps' | 'volume' | 'duration';
  onDismiss?: () => void;
  autoHide?: number;          // ms to auto-dismiss (default 3000)
}
```

**Implementation rules**:
- Gradient border: `accent → warning → accent` (animated shimmer)
- Content: "🏆 New PR! Bench Press 195 lbs"
- Duration: Shows for 3 seconds, then collapses
- Haptic: `Haptics.NotificationFeedbackType.Success`
- Confetti: `react-native-confetti-cannon` (small burst, 60 particles)
- Tier: **Macro** — only for actual PRs, not routine completions
- Must NOT be fired from generic checkin/complete flow — only from PR detection logic

#### 9.1.5 `<SetCounter>` — In-Workout Number Input

Large, tappable +/- number display for logging sets. Designed for gym-floor use.

```
┌───────────────────────┐
│    −   │  8  │   +    │
│        │ reps │        │
└───────────────────────┘
```

**Props API**:
```typescript
interface SetCounterProps {
  value: number;
  onChange: (value: number) => void;
  label: string;              // "reps" | "sets" | "lbs" | "kg"
  min?: number;               // default 0
  max?: number;               // default 999
  step?: number;              // default 1
  size?: 'default' | 'large'; // default = medium stat, large = hero
}
```

**Implementation rules**:
- Number: `text-large-stat font-variant-numeric-tabular-nums text-accent`
- Press feedback: `AnimatedPressable` (scale 0.97, 150ms spring)
- Haptic: Light impact on tap
- Value change animation: Spring counter from old → new
- +/- buttons: `rounded-sm bg-surface-elevated` with `text-primary`, min 44×44 touch target

### 9.2 Infrastructure Components

These follow the rn-primitives / Shadcn pattern closely. Identity comes from *tokens*, not structure.

#### 9.2.1 Button Variants

```tsx
<Button variant="default">      {/* bg-primary + text-accent — white bg, orange text */}
<Button variant="accent">       {/* bg-accent + text-white — solid orange fill, highest priority */}
<Button variant="secondary">    {/* bg-surface-elevated + text-primary */}
<Button variant="destructive">  {/* bg-danger + text-white */}
<Button variant="ghost">        {/* bg-transparent + text-text-secondary */}
<Button variant="outline">      {/* border border-border + bg-transparent */}
<Button variant="link">         {/* text-accent, no bg */}

<Button size="default">         {/* h-12 px-6 */}
<Button size="sm">              {/* h-10 px-3 */}
<Button size="lg">              {/* h-14 px-8 */}
<Button size="icon">            {/* h-12 w-12 */}

<Button loading={true}>         {/* shows ActivityIndicator */}
<Button asChild>                {/* Slot pattern for custom children */}
```

**Intent-to-variant mapping**:

| Intent | Button Variant | Size | When |
|--------|---------------|------|------|
| Start Workout | accent (solid orange) | lg | The single most important action on screen |
| Save / Confirm | default (white bg, orange text) | default | Positive confirmations |
| Set Complete | default + success color scheme | default | Mid-workout completion |
| Delete / Cancel | destructive (red) | sm | Destructive actions |
| Tertiary / More | ghost | sm | Overflow menus, secondary actions |
| Add Item | outline | default | Adding exercises to a workout |

#### 9.2.2 Text Variants

```tsx
<Text variant="title">Today's Workout</Text>
<Text variant="heading">Weekly Overview</Text>
<Text variant="subheading">Bench Press</Text>
<Text variant="body">Great session today!</Text>
<Text variant="body-semibold">Emphasized body text</Text>
<Text variant="muted">Last 7 days</Text>
<Text variant="caption">kg · lbs · reps</Text>
<Text variant="micro">W  ·  D  ·  F</Text>
<Text variant="label">Username</Text>
```

#### 9.2.3 Card Variants

```tsx
<Card>                     {/* bg-surface rounded-lg border border-border p-card-padding */}
<CardHeader>               {/* gap-1.5 */}
<CardTitle>                {/* text-subheading text-primary */}
<CardDescription>          {/* text-caption text-secondary */}
<CardContent>              {/* gap-item-gap */}
<CardFooter>               {/* mt-4 flex-row items-center gap-2 */}
```

#### 9.2.4 Badge Variants

```tsx
<Badge variant="default">      {/* bg-accent/10 + text-accent — orange */}
<Badge variant="secondary">    {/* bg-surface-elevated + text-secondary */}
<Badge variant="destructive">  {/* bg-danger/10 + text-danger — red */}
<Badge variant="outline">      {/* bg-transparent + border-border */}
<Badge variant="success">      {/* bg-success/10 + text-success — green, for completion badges */}
```

---

## 10. Data Visualization

### 10.1 Chart Token System

All charts share a common token vocabulary. No hardcoded colors, stroke widths, or radii in chart components.

| Token | Value | NativeWind Class | Use |
|-------|-------|-----------------|-----|
| Chart grid lines | `border-border` at 50% opacity | `stroke-border/50` | Grid behind bar/line charts |
| Chart axis labels | `text-caption text-tertiary` | — | X and Y axis text |
| Chart axis line | `border-border` | `stroke-border` | Axis baselines |
| Chart tooltip bg | `bg-surface-elevated` | — | Tooltip background |
| Chart tooltip text | `text-caption text-primary` | — | Tooltip content |
| Chart tooltip radius | `rounded-md` (12px) | — | Tooltip container |
| No-data overlay | `bg-background/80` | — | When chart data is empty |

### 10.2 Bar Chart

Used for: weekly training volume comparison, per-muscle-group breakdown.

```
┌──────────────────────────────────┐
│  2,400 ┤                         │
│        ┤    ██                   │
│  1,800 ┤    ██    ██             │
│        ┤    ██    ██    ██       │
│  1,200 ┤    ██ ██ ██    ██ ██    │
│        ┤    ██ ██ ██ ██ ██ ██ ██ │
│    600 ┤    ██ ██ ██ ██ ██ ██ ██ │
│        └──────┬──┬──┬──┬──┬──┬── │
│              M  T  W  T  F  S  S │
└──────────────────────────────────┘
```

**Spec**:
- Bar fill: muscle viz color or accent (depends on context)
- Bar radius: `rounded-sm` (8px) on top corners only
- Bar gap: `gap-1` (4px) between bars
- Bar max width: 48px
- Grid: horizontal lines only, `stroke-border/50`, no vertical grid
- Hover/active: bar brightens to 100% opacity (default 85%)
- Animation: bars grow from 0 height on mount, 600ms `gentle` spring, 30ms stagger

### 10.3 Line Chart

Used for: body weight trend, estimated 1RM progression, recovery score over time.

**Spec**:
- Line stroke: `2px`, accent or viz color
- Line tension: 0.4 (slightly curved, not straight segments)
- Data point: circle, radius 3px, same color as line, appears on press/hover
- Fill below line: same color at 10% opacity (optional, for area charts)
- Grid: horizontal lines only, `stroke-border/50`
- Animation: line draws in over 800ms, `gentle` spring
- Y-axis: 3–5 gridlines, always include 0 baseline if data permits
- X-axis: 7 labels max before switching to alternating labels

### 10.4 Heatmap (Training Calendar)

Used for: monthly workout consistency view.

```
┌──────────────────────────────────┐
│  January 2026                    │
│  M   T   W   T   F   S   S      │
│       ◻   ◻   ◻   ◼   ◻   ◻    │
│  ◼   ◼   ◻   ◼   ◻   ◻   ◻    │
│  ◻   ◼   ◼   ◻   ◻   ◻   ◻    │
│  ◻   ◻   ◻   ◼   ◼   ◻   ...   │
└──────────────────────────────────┘
```

**Spec**:
- Cell size: 36×36px (default), 28×28px (compact)
- Cell radius: `rounded-sm` (8px)
- Color gradient: 4-level scale
  - No workout: `bg-surface-elevated`
  - Light (1–3 sets): relevant viz color at 25% opacity
  - Medium (4–6 sets): relevant viz color at 55% opacity
  - Heavy (7+ sets): relevant viz color at 100% opacity
- Row gap: 4px, column gap: 4px
- Month label: `text-subheading text-primary`
- Day labels (M T W T F S S): `text-micro text-tertiary`

### 10.5 Ring / Donut Chart

Used for: muscle group distribution, workout type split.

**Spec**:
- Outer radius: defined by chart size
- Inner radius: 70% of outer (donut hole)
- Stroke width: 12% of chart size
- Segment colors: muscle viz color map (Section 3.4)
- Segment gap: 2px between segments
- Center content: total value in `text-stat-value`, label in `text-caption text-secondary`
- Animation: segments draw in over 1200ms, `gentle` spring, 100ms stagger between segments
- Legend: below chart, `text-caption text-secondary`, colored dot matching segment

### 10.6 Sparkline (Inline Mini Chart)

Used for: trend indicators inside StatCard, exercise detail headers.

**Spec**:
- Height: 32px (stat card), 24px (inline)
- Width: fills available space (typically 80–120px)
- Stroke: 1.5px, follows card's accent color
- Fill below line: same color at 15% opacity
- No axes, no grid, no labels — pure trend shape
- Endpoint dot: 3px radius at the latest data point, accent color
- Animation: line draws in over 400ms on card mount

---

## 11. Motion Design

### 11.1 Spring Personality: "Snappy Athletic"

NextRep moves like an athlete — not a robot, not a soap bubble.

| Preset | Damping | Stiffness | Mass | Use |
|--------|---------|-----------|------|-----|
| **snappy** | 20 | 300 | 0.8 | Buttons, toggles, cards — *default* |
| **gentle** | 25 | 150 | 1.0 | Layout changes, filtering, reordering, chart animations |
| **bouncy** | 12 | 200 | 0.6 | Celebrations, PRs, confetti triggers only |

> **Note**: This replaces the previous `ELEGANT_SPRING` (20/90) and `MICRO_INTERACTION_SPRING` (18/150) from AGENTS.md. The new presets are higher-energy to match the "athletic" personality.

### 11.2 Duration Scale

| Name | ms | Use |
|------|-----|-----|
| `micro` | 150 | Button press, toggle flip, set completion bounce |
| `standard` | 250 | Card expand, sheet open, value change counter |
| `emphasis` | 400 | Screen entry, stat reveal, progress ring fill start |
| `celebration` | 800 | PR banner, workout complete, achievement unlock |
| `skeleton` | 1500 | Skeleton shimmer cycle (one full wave) |

### 11.3 Stagger Patterns

| Pattern | Delay | Use |
|---------|-------|-----|
| `fast` | 50ms | Card list entry (subtle cascade) |
| `dramatic` | 100ms | Screen hero + stat reveal (page open) |
| `list` | 30ms | Long scrollable lists (smooth flow) |
| `chart` | 30ms | Bar chart bar entrance, ring segment draw |

### 11.4 Animation Choreography by Context

**Screen Entry** (every page navigation):
1. Header fades in + translates 8px up (200ms, `snappy` spring)
2. Hero stat card fades in + scale 0.98 → 1.0 (300ms, `gentle` spring, `dramatic` stagger)
3. Remaining cards cascade in (50ms stagger, `fast` pattern)
4. Charts draw/animate after cards settle (600–1200ms delay from mount)

**In-Workout**:
1. Set completion: Scale bounce 1.0 → 1.05 → 1.0 (150ms, `snappy`) + `lightHaptic` + checkmark draws-in
2. Exercise done: Card success border-glow (opacity 0 → 1 → 0, 500ms) + `mediumHaptic`
3. Workout complete: Summary card slides up, stats revealed 100ms apart + `heavyHaptic` + confetti
4. Rest timer: background overlay fades in over 200ms when timer starts, fades out when timer ends

**Data Reveal**:
1. Dashboard open: Progress rings fill over 1200ms (`gentle` spring)
2. Tab switch: Stats reset → count-up from 0 to actual value (600ms, `snappy`)
3. Pull-to-refresh: Skeleton placeholders → stagger-fade when data arrives
4. Chart mount: Bars ascend from 0, lines draw from left, rings fill clockwise

### 11.5 Celebration Tiers

| Tier | Trigger | Visual | Haptic | Frequency |
|------|---------|--------|--------|-----------|
| **Micro** | Every set complete | Scale bounce + success color flash | `ImpactFeedbackStyle.Light` | High (every set) |
| **Meso** | Exercise / workout complete | Border glow + staggered reveals | `ImpactFeedbackStyle.Medium` | Medium (per exercise) |
| **Macro** | Personal record | Gradient shimmer border + confetti (60 particles) | `NotificationFeedbackType.Success` | Rare (PRs only) |

> **The Earned Celebration Rule**: If every set triggers confetti, nothing feels special. NextRep reserves the Macro tier exclusively for personal records. Routine completions (checkin, set done) must NOT trigger confetti.

---

## 12. State Design

Every data-bearing surface in NextRep has four possible states. Each must be designed, not left to developer discretion.

### 12.1 Loading State (Skeleton)

**When**: Initial data fetch, pull-to-refresh, tab switch before data arrives.

```
┌────────────────────────────┐
│  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  │  ← skeleton bar (title width)
│                            │
│  ┌────────────────────────┐│
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ││  ← skeleton card
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ││     bg-surface-elevated
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ││
│  └────────────────────────┘│
│                            │
│  ┌────────────────────────┐│
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ││
│  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ││
│  └────────────────────────┘│
└────────────────────────────┘
```

**Spec**:
- Skeleton base color: `bg-surface-elevated`
- Shimmer peak color: `bg-surface-hover`
- Skeleton shape radius: `rounded-sm` (8px)
- Shimmer animation: linear gradient sweep, 1500ms per cycle, infinite loop
- Content-type matching: text → long bar (varying width), card → full card shape, chart → chart-shaped placeholder
- Stagger: multiple skeleton items appear with 50ms stagger

### 12.2 Empty State (No Data)

**When**: No workouts logged, no dashboard data, no exercises in library.

```
┌────────────────────────────┐
│                            │
│           🏋️               │  ← icon-xl, text-tertiary
│                            │
│     Ready to move?         │  ← subheading text-primary
│   Your first workout is    │  ← body text-secondary, centered
│    waiting. Start now.     │
│                            │
│   [ Start First Workout ]  │  ← accent button, lg
│                            │
└────────────────────────────┘
```

**Spec**:
- Layout: vertically centered in available space
- Icon: `icon-xl` (32px, 1.5px stroke), `text-tertiary`
- Title: `text-subheading text-primary`, no bold weight needed (system font weight handles it)
- Description: `text-body text-secondary`, max 2 lines, centered
- CTA: accent button below description, `gap-section-gap` from text block
- Empty states must be **forward-looking** (focus on what the user can do), not **deficit-focused** (don't say "no data yet")

**Per-screen empty states**:

| Screen | Icon | Title | Description | CTA |
|--------|------|-------|-------------|-----|
| Home | Dumbbell | "Ready to move?" | "Your first workout is waiting on the other side of 'start.'" | "Create First Workout" |
| Dashboard | BarChart3 | "Nothing to show yet" | "Log a few workouts and your stats will appear here." | "Go to Training" |
| Exercises | ListPlus | "No exercises yet" | "Build your exercise library to start logging workouts." | "Add Exercise" |
| AI Coach | Sparkles | "Hi, I'm your coach" | "Log some workouts first so I can give you personalized insights." | "Start Training" |

### 12.3 Error State

**When**: DB initialization failure, network error, data fetch exception.

```
┌────────────────────────────┐
│                            │
│           ⚠️               │  ← icon-lg, text-danger
│                            │
│   Something went wrong     │  ← subheading text-primary
│   We couldn't load your    │  ← body text-secondary, centered
│   data. Please try again.  │
│                            │
│       [  Retry  ]          │  ← default button
│                            │
└────────────────────────────┘
```

**Spec**:
- Background: `bg-background` (full screen) or `bg-surface` (in-card error)
- Container: `bg-surface rounded-lg p-card-padding` (for in-card errors)
- Icon: `icon-lg` (24px, 1.5px stroke), `text-danger`
- Title: `text-subheading text-primary`
- Description: `text-body text-secondary`, centered, 2–3 lines max
- Retry button: `default` variant (white bg, orange text)
- Do NOT use the accent (solid orange) button for errors — it signals opportunity, not recovery

### 12.4 Partial State (Some Data Loaded)

**When**: Dashboard loads training data but body metrics are still fetching; or exercises load but AI insights are pending.

**Spec**:
- Loaded sections: render normally with full fidelity
- Loading sections: show skeleton (not empty state)
- Partial state should NOT show an error — it's just async loading
- If a section has been loading for >5s, show a subtle "Still loading..." caption below the skeleton

---

## 13. Contextual UI

NextRep's UI responds to **training state** — not just user input, but the body's condition. This is the system's deepest differentiator.

### 13.1 Training Intensity → Accent Shift

As the user approaches their weekly volume limit, the accent color progressively shifts to signal caution:

| Training Load | Accent Shift | Visual Effect |
|--------------|-------------|---------------|
| Normal (0–70% of limit) | `#FF6B2C` (standard orange) | Default — energetic, motivating |
| Elevated (70–90%) | `#FF8C3F` (warmer orange) | ProgressRing stroke warms slightly |
| Near limit (90–100%) | `#FFA040` → `#FFD60A` (orange → warning yellow) | Hero stat shifts to `text-warning` |
| Over limit (>100%) | `#FF453A` (danger red) | Hero stat uses `text-danger`, card gets danger left border |

> **Implementation**: This is a gradient interpolation, not a hard switch. Use a continuous scale from accent → warning → danger based on the load percentage. Apply to: ProgressRing stroke color, hero stat text color, weekly volume card accent.

### 13.2 Recovery State → Visual Calm

When the recovery score is "fresh" or "rested," the UI should feel calmer to encourage rest:

| Recovery Score | UI Response |
|---------------|-------------|
| Low (<40%) | Hero stat in `text-danger`, dashboard shows rest recommendations prominently |
| Moderate (40–70%) | Default state — accent orange, normal energy |
| High (>70%) | Hero stat uses `text-success` instead of `text-accent`, reduced animation energy (e.g., slower counter), ProgressRing uses `gentle` spring instead of `snappy` |

### 13.3 Rest Timer (Between Sets)

When the rest timer is active between sets:

| Timer Phase | Visual |
|------------|--------|
| **Start** (3:00 → 2:30) | Background overlay fades in: `<BlurView>` or `bg-overlay` + semi-transparent dark layer. Timer in `text-large-stat text-accent`. |
| **Mid** (2:30 → 0:30) | Timer remains prominent. Previous set data visible but muted (`text-tertiary`). |
| **Warning** (0:30 → 0:10) | Timer shifts to `text-warning`. Subtle scale pulse every second. |
| **Go** (0:10 → 0:00) | Timer shifts to `text-success`. Scale bounce + `lightHaptic` at 0:00. Overlay fades out. |

### 13.4 Workout Complete → Glow Pulse

When a workout is marked complete:

1. **Immediate**: Brief full-screen accent glow pulse (500ms, `bg-accent/10` overlay fade in → out)
2. **Transition**: Summary card slides up from bottom (300ms, `snappy` spring)
3. **Reveal**: Stats revealed sequentially (100ms stagger): volume → duration → exercises completed
4. **Settle**: Stats stop animating, "Workout Complete" header fades in
5. **Haptic**: `NotificationFeedbackType.Success` at moment of completion

### 13.5 Context Rules Summary

| Condition | What Changes | Token Affected |
|-----------|-------------|----------------|
| High training load | Accent shifts toward warning/danger | `text-accent` → `text-warning` → `text-danger` |
| Recovery day | Lower energy visuals, success color | `text-accent` → `text-success`, reduced animation |
| Rest timer active | Background dims, timer prominent | `bg-overlay`, `text-large-stat` |
| Set in progress | Minimal chrome, max focus | Reduced header, no tab bar |
| Workout complete | Glow pulse + summary cascade | `bg-accent/10` overlay |

---

## 14. Voice & Tone

Copywriting is a design material, not an afterthought. The words on screen shape the user's emotional response as much as colors and motion.

### 14.1 Three Voice Principles

1. **Numbers first, feelings second.** Stats are the hero. Emotional language supports the data, not the other way around.
   - ✅ "12,480 lbs this week. ▲ 8% from last week."
   - ❌ "You're crushing it! Amazing progress this week!"

2. **Earned enthusiasm.** Match the celebration tier (Section 11.5). Don't hype routine actions.
   - ✅ Micro (set complete): "Set logged" — factual, brief
   - ✅ Macro (PR): "🏆 New PR! 195 lbs — that's a new benchmark." — earned celebration
   - ❌ Micro with macro language: "INCREDIBLE SET!" on every rep

3. **Direct, not chatty.** Fitness is about action. Instructions and labels should be clear, not conversational.
   - ✅ "Start Workout"
   - ❌ "Ready to get moving? Let's do this!"

### 14.2 Voice by Celebration Tier

| Tier | Tone | Example (EN) | Example (ZH) |
|------|------|-------------|-------------|
| **Micro** | Factual, brief | "Set complete" | "完成一组" |
| **Meso** | Warm, specific | "Bench Press done. 4 sets in the books." | "卧推完成，4组入账" |
| **Macro** | Celebratory, earned | "🏆 PR! 195 lbs — a new benchmark." | "🏆 新纪录！195 lbs" |

### 14.3 Voice by UI State

| State | Tone | Example (EN) | Example (ZH) |
|-------|------|-------------|-------------|
| **Empty** | Forward-looking, inviting | "Ready to move?" | "准备动起来？" |
| **Loading** | Minimal, no filler text | — (skeleton only, no "Loading...") | — |
| **Error** | Honest, actionable | "Something went wrong. We couldn't load your data." | "出了点问题，无法加载数据" |
| **Success** | Brief, moves on | "Saved" (auto-dismiss) | "已保存" |
| **Warning** | Clear, specific | "You're close to your weekly volume limit" | "接近本周训练上限" |

### 14.4 Label Conventions

- **Buttons**: Verb + noun. "Start Workout" not "Begin". "Add Exercise" not "New".
- **Empty states**: Question or invitation. "Ready to move?" not "No data".
- **Errors**: What happened + what to do. "Couldn't load data. Try again."
- **Tab labels**: Single noun. "Training" "Dashboard" "Coach" "Settings".
- **Units**: Abbreviated, lowercase. "lbs" "kg" "reps" "min".

### 14.5 Bilingual Baseline

The app supports English and Chinese. Both languages must follow the same voice principles. Chinese copy should NOT be a literal translation — it should feel natural in Chinese while preserving the tone tier.

| Principle | English bias | Chinese bias |
|-----------|-------------|--------------|
| Direct | Short imperative verbs | Short verb phrases (完成, 开始, 保存) |
| Earned | "PR!" signals rarity | "新纪录！" — same rarity signal |
| Numbers first | "12,480 lbs" prefix | "12,480 lbs" same prefix (numbers are universal) |

---

## 15. Accessibility

### 15.1 Color Contrast

| Token Pair | Ratio | WCAG Level |
|------------|-------|------------|
| `text-primary` on `bg-background` | 13.5:1 | AAA ✅ |
| `text-secondary` on `bg-surface` | 5.2:1 | AA ✅ |
| `text-accent` on `bg-primary` (button) | 4.8:1 | AA ✅ |
| `text-accent` on `bg-surface` | 3.8:1 | AA Large Text ✅ |
| `text-tertiary` on `bg-surface` | 3.2:1 | AA Large Text ✅ |

### 15.2 Touch Targets

- Minimum interactive target: 44×44 points (iOS HIG)
- All buttons, toggles, and tappable rows must meet this
- Use `hitSlop` for icons that are visually smaller but functionally need 44pt target
- SetCounter +/- buttons: ensure 44×44 minimum even when icon is `icon-md` (20px)

### 15.3 Haptic Feedback Integration

| Interaction | Haptic Type | Implementation |
|------------|-------------|----------------|
| Button press | Light impact | `ImpactFeedbackStyle.Light` |
| Set complete | Medium impact | `ImpactFeedbackStyle.Medium` |
| Rest timer end | Light impact | `ImpactFeedbackStyle.Light` |
| PR achieved | Success notification | `NotificationFeedbackType.Success` |
| Error / destructive | Warning notification | `NotificationFeedbackType.Warning` |
| Workout complete | Success notification | `NotificationFeedbackType.Success` |

### 15.4 Accessibility Labels

Every interactive element must have `accessibilityLabel` or `accessibilityRole`:

```tsx
<Button accessibilityRole="button" accessibilityLabel="Start Workout">
<Pressable accessibilityLabel="Delete exercise" accessibilityRole="button">
<SetCounter accessibilityLabel="Weight, 185 pounds. Double tap to edit.">
```

### 15.5 Motion Reduction

Respect the system "Reduce Motion" accessibility setting:
- Skip all spring animations when reduced motion is active
- Replace spring counters with instant value changes
- Replace staggered list entry with simultaneous appearance
- Charts render at final state (no draw animation)
- Use `AccessibilityInfo.isReduceMotionEnabled()` to detect

---

## 16. Light Mode

Light mode is a **second-class citizen** — supported but not optimized. The CSS cascade is dark-first: `:root` = dark, `.light` = overrides.

### 16.1 Dark-First CSS Cascade

```css
/* global.css — dark-first structure */
:root {
  /* Dark mode is the default */
  --background: #0A0A0F;
  --surface: #141419;
  --surface-elevated: #1C1C24;
  --surface-hover: #222230;
  --accent: #FF6B2C;
  --text-primary: #F5F5F7;
  --text-secondary: #8E8E93;
  --text-tertiary: #636366;
  /* ... all other dark tokens ... */
}

.light {
  /* Light mode overrides */
  --background: #FAFAFA;
  --surface: #FFFFFF;
  --surface-elevated: #F4F4F5;
  --accent: #E85D20;
  --text-primary: #18181B;
  --text-secondary: #71717A;
  --text-tertiary: #A1A1AA;
  /* ... all other light tokens ... */
}
```

This eliminates the flash-of-light-mode on app launch. The Expo splash screen background should match `#0A0A0F`.

### 16.2 Light Mode Color Overrides

| Token | Dark | Light |
|-------|------|-------|
| `--background` | `#0A0A0F` | `#FAFAFA` |
| `--surface` | `#141419` | `#FFFFFF` |
| `--surface-elevated` | `#1C1C24` | `#F4F4F5` |
| `--accent` | `#FF6B2C` | `#E85D20` |
| `--text-primary` | `#F5F5F7` | `#18181B` |
| `--text-secondary` | `#8E8E93` | `#71717A` |

### 16.3 Light Mode Rules

- Accent shifts to `#E85D20` (darker orange) for sufficient contrast on white backgrounds
- Surface hierarchy inverts: white → subtle gray
- Borders become visible (`#18181B14`) — in dark mode they're nearly invisible
- The same accent usage rules apply — sparingly
- No drop shadows needed — light mode naturally creates depth through gray values
- Charts: grid lines become more visible; ensure `border-border` token resolves correctly in light mode

---

## 17. Migration Roadmap

### Phase 0: Infrastructure Setup (Pre-requisite)

1. **Invert CSS cascade to dark-first**: Move dark values to `:root`, light values to `.light` in `global.css`
2. **Import `tailwind.theme.json` into `tailwind.config.js`** as a Tailwind preset or deep merge
3. **Fix `--accent`** CSS variable: change from `#27272a` → `#FF6B2C`
4. **Fix `--success`** CSS variable: change from `#fafafa` → `#30D158`
5. **Add missing CSS vars** to `global.css`: `--surface`, `--surface-elevated`, `--surface-hover`, `--text-secondary`, `--text-tertiary`, `--border-strong`, `--warning`, `--info`, `--overlay`
6. **Update `constants/colors.ts`** to mirror DESIGN.md hex values exactly (orange = `#FF6B2C`, red = `#FF453A`, background = `#0A0A0F`, etc.)
7. **Add `font-variant-numeric: tabular-nums`** to `tailwind.theme.json` utility class
8. **Add icon size tokens** to `tailwind.theme.json`

### Phase 1: Token Unification (Low Effort, High Impact)

1. **Map all existing code** from hardcoded colors → NativeWind token classes
2. **Standardize Card padding**: Change base Card class from `p-6` → `p-card-padding`, add `border border-border`
3. **Resolve Shadcn vs NextRep token conflict**: Keep Shadcn tokens for infrastructure (inputs, toggles), use NextRep tokens for identity surfaces (cards, stats, exercises)
4. **Add `tabular-nums`** to all Text variants that display numbers (`stat-value`, `hero-stat`, `large-stat`)
5. **Replace `StyleSheet.create()`** in BottomSheetModal with NativeWind classes
6. **Add `accent` button variant** to button.tsx (solid orange fill)
7. **Integrate haptics** into AnimatedPressable (light impact on press-in)
8. **Remove confetti from generic checkin** — reserve for PRBanner (Macro tier only)

### Phase 2: Signature Components (Medium Effort, Highest Impact)

1. Build `<StatCard>` with animated counter + sparkline
2. Build `<ExerciseRow>` with muscle-group accent border
3. Build `<ProgressRing>` SVG with spring fill
4. Build `<PRBanner>` with gradient shimmer + confetti
5. Build `<SetCounter>` with +/- interactions
6. Refactor `<Button>` to include accent variant and intent-based mapping
7. Build icon component wrapper with size + color token support

### Phase 3: Motion + Context System (Medium Effort)

1. Create `lib/motion.ts` — spring, stagger, and duration presets (snappy/gentle/bouncy)
2. Implement 3-tier celebration system (micro → meso → macro) with proper haptics
3. Add contextual UI responses: training load → accent shift, recovery → visual calm
4. Implement rest timer with background dimming
5. Add reduce-motion detection and graceful degradation
6. Replace `BottomSheetModal` StyleSheet with token-driven styling

### Phase 4: UI Audit & Polish (Lower Priority)

1. Build all empty states (4 screens × empty state patterns from Section 12.2)
2. Build skeleton loading components with shimmer animation
3. Add chart drawing animations (bar ascent, line draw, ring fill)
4. Build all chart components per Section 10 specs (bar, line, heatmap, ring, sparkline)
5. Replace all inline `text-[Npx]` references with type scale tokens
6. Audit WCAG contrast ratios (light mode especially)
7. Add bilingual copy following Voice & Tone (Section 14)
8. Add responsive layout tokens if web support is prioritized
9. Evaluate custom font (Inter or Geist) for brand differentiation
10. Audit all hardcoded hex values and inline styles — replace with tokens

---

## Appendices

### A. File Roles

| File | Role |
|------|------|
| `global.css` | CSS variables — single source of truth for theme values (dark-first cascade) |
| `tailwind.config.js` | Maps CSS vars + theme.json to NativeWind classes |
| `tailwind.theme.json` | Custom design tokens (surface, text, viz colors, typography, spacing, radii, icons) |
| `constants/colors.ts` | Runtime bridge for dynamic values (SVG fills, animations) |
| `constants/animations.ts` | Spring presets (snappy/gentle/bouncy), duration scale, stagger patterns |
| `hooks/useTheme.tsx` | Theme context provider, dark/light/system logic, reduce-motion detection |

### B. Quick Reference: Token → Class Mapping

```tsx
// Colors
<View className="bg-background" />           // #0A0A0F
<View className="bg-surface" />               // #141419
<View className="bg-surface-elevated" />      // #1C1C24
<Text className="text-accent" />              // #FF6B2C
<Text className="text-primary" />             // #F5F5F7
<Text className="text-secondary" />           // #8E8E93
<Text className="text-tertiary" />            // #636366
<Text className="text-success" />             // #30D158
<Text className="text-danger" />              // #FF453A

// Typography
<Text className="text-hero-stat" />           // 48px Bold, tnum
<Text className="text-large-stat" />          // 32px Bold, tnum
<Text className="text-stat-value" />          // 20px Bold, tnum
<Text className="text-caption" />             // 12px
<Text className="text-micro" />               // 10px

// Iconography
<Icon size="icon-md" />                       // 20px, 2px stroke
<Icon size="icon-lg" />                       // 24px, 1.5px stroke
<Icon size="icon-xl" />                       // 32px, 1.5px stroke

// Spacing
<View className="p-card-padding" />           // padding: 16
<View className="gap-card-gap" />             // gap: 12
<View className="gap-section-gap" />          // gap: 24
<View className="px-edge-x" />                // paddingHorizontal: 20

// Radius
<View className="rounded-lg" />               // 16px (cards)
<View className="rounded-xl" />               // 20px (sheets)
<View className="rounded-pill" />             // 9999px

// Tabular numerals
<Text className="text-hero-stat font-variant-numeric-tabular-nums" />

// Shadows (rare)
<View className="shadow-subtle" />            // tab bar, toasts
<View className="shadow-medium" />            // bottom sheets

// Data Visualization
<View className="stroke-border/50" />         // chart grid lines
<Text className="text-caption text-tertiary" /> // chart axis labels
```

### C. Anatomy of a Well-Styled Screen

```tsx
import { View, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/hooks/useTheme";
import { Text } from "@/components/ui/text";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedEnter } from "@/components/ui/AnimatedEnter";
import { Icon } from "@/components/ui/icon";

export default function MyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,       // px-edge-x
          paddingTop: insets.top + 16,
          paddingBottom: 100 + insets.bottom,
          gap: 24,                     // section-gap
        }}
      >
        <AnimatedEnter delay={0}>
          <Text variant="title" className="text-primary">
            Screen Title
          </Text>
        </AnimatedEnter>

        <AnimatedEnter delay={100}>
          <Card>
            <CardContent className="gap-item-gap">
              <View className="flex-row items-center gap-2">
                <Icon name="Flame" size="icon-sm" className="text-accent" />
                <Text variant="body-semibold" className="text-primary">
                  Card heading
                </Text>
              </View>
              <Text variant="body" className="text-secondary">
                Card content
              </Text>
            </CardContent>
          </Card>
        </AnimatedEnter>
      </ScrollView>
    </View>
  );
}
```

### D. Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | — | Initial design system |
| 2.0 | — | Token architecture, signature components, migration roadmap |
| 3.0 | 2026-06 | Added: Emotional Arc (§1), Iconography (§5), Composed View Blueprints (§6.4), Data Visualization (§10), State Design (§12), Contextual UI (§13), Voice & Tone (§14), Dark-First Cascade (§2.2, §16). Updated: Spring presets (§11), Migration Roadmap (§17), Button variants with `accent` variant (§9.2.1). |

---

> **Document version**: 3.0 · **Status**: Active specification · **Companion**: `AGENTS.md`
