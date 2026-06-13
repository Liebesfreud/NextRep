---
version: alpha
name: NextRep Design System
description: >
  Dark-first fitness tracker with an energetic orange accent and restrained elegance.
  Built on Expo + NativeWind + rn-primitives (Shadcn/RNR pattern), the system
  leverages component-library pragmatism while injecting identity through signature
  color, tabular-numeral typography, athletic spring choreography, and bespoke
  data-visualization components.

colors:
  # ── Surface ──
  background: "#0A0A0F"
  surface: "#141419"
  surface-elevated: "#1C1C24"
  surface-hover: "#222230"

  # ── Brand / Accent ──
  accent: "#FF6B2C"
  accent-muted: "#FF6B2C"
  accent-subtle: "#FF6B2C"
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
  viz-muscle-arms: "#34C759"
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
  # ── Hero: Big stat numbers (score, volume, duration) ──
  hero-stat:
    fontFamily: System
    fontSize: 48px
    fontWeight: 700
    lineHeight: 1.0
    letterSpacing: "-0.03em"
    fontFeature: '"tnum"'
  # ── Large Stat: Secondary score displays ──
  large-stat:
    fontFamily: System
    fontSize: 32px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
    fontFeature: '"tnum"'
  # ── Title: Page titles ──
  title:
    fontFamily: System
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  # ── Heading: Section headings ──
  heading:
    fontFamily: System
    fontSize: 22px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  # ── Subheading: Card / subsection ──
  subheading:
    fontFamily: System
    fontSize: 17px
    fontWeight: 600
    lineHeight: 1.3
  # ── Body: Default reading ──
  body:
    fontFamily: System
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.6
  # ── Body Semibold: Emphasized body ──
  body-semibold:
    fontFamily: System
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.6
  # ── Caption: Timestamps, units, hints ──
  caption:
    fontFamily: System
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4
  # ── Micro: Set type indicators (W/D/F), tiny labels ──
  micro:
    fontFamily: System
    fontSize: 10px
    fontWeight: 500
    lineHeight: 1.3
  # ── Stat Value: In-card number display ──
  stat-value:
    fontFamily: System
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.2
    fontFeature: '"tnum"'

rounded:
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  pill: 9999px

spacing:
  edge-x: 20px
  section-gap: 24px
  card-gap: 12px
  card-padding: 16px
  item-gap: 8px

elevation:
  none:
    shadowColor: transparent
    shadowOffset: "0px 0px"
    shadowRadius: 0px
    shadowOpacity: 0
  subtle:
    shadowColor: "#000000"
    shadowOffset: "0px 2px"
    shadowRadius: 8px
    shadowOpacity: 0.2
  medium:
    shadowColor: "#000000"
    shadowOffset: "0px 4px"
    shadowRadius: 16px
    shadowOpacity: 0.3
  strong:
    shadowColor: "#000000"
    shadowOffset: "0px 8px"
    shadowRadius: 24px
    shadowOpacity: 0.4

components:
  # ── Button Variants ──
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.accent}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-pressed:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.accent}"
  button-secondary:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-accent-pressed:
    backgroundColor: "#E85D20"
    textColor: "#FFFFFF"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-success:
    backgroundColor: "{colors.success}"
    textColor: "#0A0A0F"
    rounded: "{rounded.md}"
    padding: "12px 24px"

  # ── Card Variants ──
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card-padding}"
  card-elevated:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card-padding}"
  card-interactive:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card-padding}"

  # ── Badge Variants ──
  badge-default:
    backgroundColor: "{colors.accent}1A"
    textColor: "{colors.accent}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  badge-success:
    backgroundColor: "{colors.success}1A"
    textColor: "{colors.success}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  badge-warning:
    backgroundColor: "{colors.warning}1A"
    textColor: "{colors.warning}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"
  badge-danger:
    backgroundColor: "{colors.danger}1A"
    textColor: "{colors.danger}"
    rounded: "{rounded.pill}"
    padding: "4px 10px"

  # ── Input ──
  input:
    backgroundColor: "{colors.surface-elevated}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  input-focused:
    borderColor: "{colors.accent}"
    borderWidth: 2px

  # ── Tab Bar ──
  tab-bar:
    backgroundColor: "{colors.surface}E6"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.lg}"
    padding: "8px"
  tab-bar-active:
    textColor: "{colors.accent}"

  # ── Bottom Sheet ──
  bottom-sheet:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "{spacing.card-padding}"

  # ── Floating Overlay (glassmorphic) ──
  overlay-glass:
    backgroundColor: "#FFFFFF0F"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.card-padding}"
---

# NextRep Design System

> *Dark-first fitness tracker · Orange-accent identity · Elegant & restrained motion*

## Overview

NextRep is a fitness tracking app built on **Expo (React Native) + NativeWind + rn-primitives** following the Shadcn/RNR composability pattern. The design challenge: **retain the engineering efficiency of a component library while forging a visual identity that is unmistakably NextRep** — not a generic Tailwind dark-mode template.

### Design Philosophy: **"克制的热忱"** (Restrained Passion)

Fitness apps run hot — energy, motivation, competition. But visual noise kills usability. NextRep's identity lives in the *tension* between these two forces:

- **Restraint**: Monochromatic dark surfaces, minimal borders, generous whitespace, systematic spacing. 80% of the visual field is quiet.
- **Passion**: The orange accent fires only when it matters — the primary CTA, the active state, the personal record. It *earns* its attention.

### The 20/80 Identity Rule

Five decisions create 80% of visual identity. Everything else is infrastructure:

1. **Background color** — `#0A0A0F`, not generic `#111` — a cooler, deeper near-black with blue undertone
2. **Accent color** — `#FF6B2C`, warm orange — energy, action, used sparingly but decisively
3. **Hero number typography** — 48px Bold, tabular-nums, tracking-tight — numbers *are* the interface
4. **Spring personality** — Snappy-athletic (damping 20, stiffness 300) — moves like an athlete, not a robot
5. **Signature component** — The StatCard with animated counter + sparkline — what people screenshot

### What We Keep vs What We Transform

**Keep as-is (infrastructure UI):** Text inputs, separators, toggles, dropdowns, dialogs, skeleton loaders. Shadcn/RNR's accessibility patterns, focus management, and keyboard interactions are *non-differentiating*. Making a weird text input doesn't add brand value — it adds frustration.

**Transform aggressively (identity surfaces):** Stat cards, workout rows, progress rings, exercise detail headers, celebration moments, page transitions. These are where NextRep's personality lives.

---

## Colors

### Surface Hierarchy

The background system creates depth through *increasing luminance*, not elevation shadows:

| Token | Hex | Role |
|-------|-----|------|
| `background` | `#0A0A0F` | Root — the void |
| `surface` | `#141419` | Cards, sheets — one step up from the void |
| `surface-elevated` | `#1C1C24` | Hovered/pressed cards, input backgrounds |
| `surface-hover` | `#222230` | Active hover feedback (web) |

**Key decision**: `#0A0A0F` (not `#000` or `#111`). The cool blue undertone gives the dark surface a *quality* feel — like a premium matte phone case vs. flat black paint. On AMOLED, it saves battery. On LCD, it reads as richer than pure black.

**Accent: The Orange Thread**

`#FF6B2C` is NextRep's signature. Usage rules:

- ✅ **Accent buttons** (Start Workout, Start Exercise — the "fire" CTA)
- ✅ **Active/focused states** (selected tab, active toggle, selected exercise)
- ✅ **PR/Achievement celebrations** (PR banner border, confetti trigger)
- ✅ **Single highlight per card** (one stat number, one progress indicator)
- ❌ **Never** as a section background, card fill, or decorative gradient
- ❌ **Never** combined with another warm color in the same view

> **Why orange?** Strava (`#FC4C02`) proved that orange = energy + motivation without the danger signal of red. Our `#FF6B2C` is warmer, slightly more playful — gym energy, not race energy.

> **Button strategy**: **Primary buttons** use a white surface with orange text (WCAG-safe, high contrast). **Accent buttons** use the solid orange fill — reserved for the single most important action on screen (Start Workout). This creates a visual hierarchy: accent > primary > secondary > ghost.

### Semantic Colors

- **Success** (`#30D158`): Set complete, workout done, PR achieved, recovered state
- **Warning** (`#FFD60A`): Near-failure set, approaching volume limit, moderate strain
- **Danger** (`#FF453A`): Missed rep, skipped workout, overtraining alert, destructive actions
- **Info** (`#0A84FF`): Secondary accent, contrast data (e.g., chart comparison color), tips

### Data Visualization Palette

Muscle-group color mapping **must stay consistent** across every chart, heatmap, and card in the app:

| Zone | Color | Muscles |
|------|-------|---------|
| Blue | `#0A84FF` | Chest, Full Body |
| Green | `#30D158` | Back, Arms |
| Orange | `#FF6B2C` | Shoulders |
| Amber | `#FF9F0A` | Legs |
| Red | `#FF453A` | Core |
| Cyan | `#5AC8FA` | Cardio |

Intensity zones (for heart rate / strain):
| Zone | Color | Meaning |
|------|-------|---------|
| Low | `#30D158` | Recovery / warm-up |
| Mid | `#FFD60A` | Moderate effort |
| High | `#FF6B2C` | Threshold |
| Max | `#FF453A` | Maximum / overreach |

### Light Mode

Light mode is a **second-class citizen** — supported but not optimized. The palette mirrors dark mode with inverted luminance and desaturated accents. The accent shifts to `#E85D20` (darker orange) for sufficient contrast on white backgrounds.

---

## Typography

### The Type Scale

NextRep's type scale is organized by *purpose*, not abstract size names:

| Token | Size | Weight | Feature | Use |
|-------|------|--------|---------|-----|
| `hero-stat` | 48px | 700 | tnum | Recovery score, total volume, workout duration on dashboard |
| `large-stat` | 32px | 700 | tnum | Secondary scores, in-workout timer |
| `title` | 28px | 600 | — | Page titles ("Today's Workout", "Settings") |
| `heading` | 22px | 600 | — | Section headings ("Weekly Overview", "Exercises") |
| `subheading` | 17px | 600 | — | Card titles, exercise names |
| `body` | 15px | 400 | — | Descriptions, instructions, notes |
| `body-semibold` | 15px | 600 | — | Emphasized body text |
| `stat-value` | 20px | 700 | tnum | In-card stats (sets × reps, weight lifted) |
| `caption` | 12px | 400 | — | Timestamps, units (kg, lbs, reps), date labels |
| `micro` | 10px | 500 | — | Set type indicators (W/D/F), tiny labels |

### Tabular Numerals: Non-Negotiable

Every number that represents a measurable value **must** use `fontVariant: ['tabular-nums']` (NativeWind: `font-variant-numeric: tabular-nums`). This ensures:

- Digits don't visually shift as `9` becomes `10`, or `99` becomes `100`
- Columns of numbers align correctly
- Animated counter values don't jitter during transitions

**Applies to**: All stat values, weights, reps, durations, percentages, scores.
**Doesn't apply to**: Prose text, labels, descriptions.

### Number Display Conventions

- **Right-align** numbers in columns (sets across exercises)
- **Fixed-width containers** for animated/changing stats (prevent layout shift)
- **Animate value changes**: Counter spring animation from old → new value
- **Unit labels**: Lighter weight + smaller + same baseline as the number
  - ✅ `245` **lbs** — number in `stat-value`, unit in `caption`
  - ❌ `245 lbs` — all same style

### Font Family

Default: **System font** (SF Pro on iOS, Roboto on Android). Zero-cost, highly optimized, already includes tabular figures.

Custom font is a **Phase 2** consideration. If branding demands it, load exactly **one** font family with **two** weights (Regular + Bold). Candidates: Inter, Geist, or Sora.

---

## Layout & Spacing

### The Rhythm System

Spacing follows an **8px felt grid** — all visible spacing uses multiples of 8:

| Token | Value | Use |
|-------|-------|-----|
| `edge-x` | 20px | Horizontal page padding (slightly asymmetric from 8px grid for historical iOS safe-area fit; acceptable) |
| `section-gap` | 24px | Between major content sections |
| `card-gap` | 12px | Between sibling cards in a vertical stack |
| `card-padding` | 16px | Internal card padding |
| `item-gap` | 8px | Between items within a card (label → value, icon → text) |

### Page Anatomy

```
┌──────────────────────────────┐
│  Status Bar (system)        │
├──────────────────────────────┤
│  ← edge-x →                 │
│  ┌──────────────────────┐   │
│  │ Header               │   │
│  │   Title + Subtitle   │   │
│  └──────────────────────┘   │
│                              │
│  ┌──────────────────────┐   │
│  │ Stat Card (hero)     │   │
│  │   48px number        │   │
│  └──────────────────────┘   │
│         ↕ card-gap           │
│  ┌──────────────────────┐   │
│  │ Section              │   │
│  │  ┌────────────────┐  │   │
│  │  │ Card           │  │   │
│  │  └────────────────┘  │   │
│  │         ↕ card-gap    │   │
│  │  ┌────────────────┐  │   │
│  │  │ Card           │  │   │
│  │  └────────────────┘  │   │
│  └──────────────────────┘   │
│                              │
│  ↕ section-gap               │
│  ┌──────────────────────┐   │
│  │ Next Section...      │   │
│  └──────────────────────┘   │
│                              │
│  ↕ 100px bottom safe area   │
├──────────────────────────────┤
│  Tab Bar (floating)          │
└──────────────────────────────┘
```

### Migration from Current Inconsistencies

| Current | Issue | Fix |
|---------|-------|-----|
| `p-6` on Card base class | Too generous (24px), most code overrides to `p-4` | Change Card default to `p-4` (16px = `card-padding`) |
| Hardcoded `paddingHorizontal: 20` in feature components | Inconsistent with token | Use `px-edge-x` NativeWind class or map to custom spacing token |
| Mixed `gap-2`, `gap-2.5`, `gap-3`, `gap-4` | No clear rule | `gap-item-gap` for within-card, `gap-card-gap` for between-cards, `gap-section-gap` for sections |
| `spacing.bento: 16px` | Defined but barely used | Align to `card-padding: 16px` token — deprecate `bento` |
| `borderRadius.bento-lg/sm` | Confusing naming | Map to `rounded.lg/sm` in this spec, use contextual names |

---

## Elevation & Depth

### Shadow-Free Philosophy (Dark Mode)

On dark surfaces, shadows are *nearly invisible*. NextRep creates depth through **luminance layering** (background → surface → surface-elevated), not drop shadows.

| Elevation | When to Use |
|-----------|------------|
| `none` | Default state for all cards and surfaces |
| `subtle` | Floating tab bar, toast notifications |
| `medium` | Bottom sheets, modals (when they float above content) |
| `strong` | Onboarding overlays, alert dialogs |

**Glassmorphism** (selective, not pervasive):
- ✅ Floating stat overlays during active workout
- ✅ Modal/Bottom Sheet backdrop blur
- ❌ Never on regular content cards
- ❌ Never on text-heavy surfaces

Formula: `background: rgba(255,255,255,0.06); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.10)`

---

## Shapes

### Border Radius Identity

NextRep uses a **"generous curve"** system — rounded-2xl as the signature card shape:

| Token | Value | Use |
|-------|-------|-----|
| `sm` | 8px | Buttons, badges, inputs, small containers |
| `md` | 12px | Toggle groups, chips, medium containers |
| `lg` | 16px | **Cards, sheets** — the signature radius |
| `xl` | 20px | Bottom sheets, modals, hero cards |
| `pill` | 9999px | Pills, badges (when badge style), toggle indicators |

### Border Strategy

- **Default: No borders.** Hierarchy comes from spacing and surface color, not lines.
- **When borders are needed**: `border border-border` (12% white opacity in dark mode)
- **Emphasis borders**: `border border-border-strong` (24% white opacity)
- **Accent border**: `border border-accent/30` — *only* for selected/active interactive cards

---

## Components

### Signature Components (Identity-Defining)

These 5 components are what make NextRep look like **NextRep**, not a Shadcn template:

#### 1. `<StatCard>` — The Hero Data Display

The primary card for displaying a metric with trend. This is NextRep's "WHOOP dial" — what users screenshot.

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

- Background: `{colors.surface}`
- Number: `hero-stat` or `large-stat` typography
- Trend: Green arrow (positive) / Red arrow (negative)
- Sparkline: 7-day mini chart, same color as the metric's viz palette

#### 2. `<ExerciseRow>` — The Fitness Workhorse

The repeating unit in workout logging. Compact, data-rich, tappable.

```
┌──────────────────────────────────────┐
│  🏋️ Bench Press                 ▶  │
│  4 × 8  ·  185 lbs            ⋮   │
└──────────────────────────────────────┘
```

- Tappable row → opens exercise detail
- Shows: exercise name (subheading), sets × reps (caption), weight (stat-value)
- Muscle group accent: Left border 3px in muscle viz color
- Completion state: Name + number shift to `text-tertiary`, checkmark replaces ▶

#### 3. `<ProgressRing>` — Circular Goal Visualization

SVG arc progress indicator. Wraps any content inside (number, icon, label).

- Ring stroke: `accent` color (or muscle-group color for specific exercises)
- Track stroke: `surface-elevated`
- Animated fill on mount: spring animation over 1200ms
- Size variants: 64px (in-card), 96px (dashboard hero), 40px (inline)

#### 4. `<PRBanner>` — Personal Record Celebration

An ephemeral component that appears when a personal record is broken:

- Gradient border: `accent → warning → accent` (animated shimmer)
- Content: "🏆 New PR! Bench Press 195 lbs" 
- Duration: Shows for 3 seconds, then collapses
- Haptic: `Haptics.NotificationFeedbackType.Success`
- Confetti: `react-native-confetti-cannon` (small burst, 60 particles)

#### 5. `<SetCounter>` — In-Workout Number Input

Large, tappable +/- number display for logging sets. Designed for gym-floor use (no fine motor precision needed).

```
┌───────────────────────┐
│    −   │  8  │   +    │
│        │ reps │        │
└───────────────────────┘
```

- Number: `large-stat` size, `tabular-nums`
- Press feedback: `AnimatedPressable` (scale 0.97, 150ms spring)
- Haptic: Light impact on tap
- Value change animation: Spring counter from old → new

### Infrastructure Components (Keep from Shadcn/RNR)

These follow the rn-primitives / Shadcn pattern closely. Identity comes from *tokens*, not structure:

- **Button**: Override CVA variants → `primary / secondary / ghost / danger / success` + `compact / comfortable` density
- **Card**: Generic container with `surface` bg + `rounded.lg`. Content-defined.
- **Badge**: Semantic color variants (`default / success / warning / danger`) with 10% opacity backgrounds
- **Input**: `surface-elevated` bg, `accent` border on focus
- **Separator**: `border` color, thin, horizontal default
- **Toggle / ToggleGroup**: `accent` background when active, `pill` radius
- **Sheet / BottomSheet**: `surface` bg, `xl` radius, drag handle
- **Text**: Variant-based (title → micro) using CVA. Capital of our typographic system.

### Component Variant System

Move beyond Shadcn's `default / secondary / destructive / outline / ghost`. Fitness domains need domain-specific variants:

```typescript
// Button — Intent-based variants (not visual-style-based)
const buttonVariants = cva("...base...", {
  variants: {
    intent: {
      primary: "bg-accent text-white",           // Start Workout, Save
      complete: "bg-success text-white",           // Set Complete, Done
      danger: "bg-danger text-white",              // Delete, Cancel
      ghost: "bg-transparent text-text-secondary", // Tertiary actions
    },
    density: {
      compact: "h-9 px-3 text-sm",              // In-workout (sweaty hands)
      comfortable: "h-12 px-6 text-base",       // Settings, onboarding
    }
  }
});
```

---

## Motion Design

### Spring Personality: "Snappy Athletic"

NextRep moves like an athlete — not a robot, not a soap bubble. Three spring presets define the entire app's motion feel:

| Preset | Damping | Stiffness | Mass | Use |
|--------|---------|-----------|------|-----|
| **snappy** | 20 | 300 | 0.8 | Buttons, toggles, cards — *default* for most things |
| **gentle** | 25 | 150 | 1.0 | Layout changes, filtering, reordering |
| **bouncy** | 12 | 200 | 0.6 | Celebrations, PRs, confetti triggers only |

### Duration Scale

| Name | ms | Use |
|------|-----|-----|
| `micro` | 150 | Button press, toggle flip |
| `standard` | 250 | Card expand, sheet open, value change |
| `emphasis` | 400 | Screen entry, stat reveal |
| `celebration` | 800 | PR, workout complete, achievement unlock |

### Stagger Patterns

| Pattern | Delay | Use |
|---------|-------|-----|
| `fast` | 50ms | Card list entry (subtle cascade) |
| `dramatic` | 100ms | Screen hero + stat reveal (page open) |
| `list` | 30ms | Long scrollable lists (smooth flow) |

### Animation Choreography by Context

**Screen Entry** (every page navigation):
1. Header fades in + translates 8px up (200ms, `snappy` spring)
2. Hero stat card fades in + scale 0.98 → 1.0 (300ms, `gentle` spring, `dramatic` stagger)
3. Remaining cards cascade in (50ms stagger, `fast` pattern)

**In-Workout**:
1. Set completion: Scale bounce 1.0 → 1.05 → 1.0 (150ms, `snappy`) + `lightHaptic` + checkmark draws-in
2. Exercise done: Card success border-glow (opacity 0 → 1 → 0, 500ms) + `mediumHaptic`
3. Workout complete: Summary card slides up, stats revealed 100ms apart (duration → volume → PRs) + `heavyHaptic` + confetti

**Data Reveal**:
1. Dashboard open: Progress rings fill over 1200ms (`gentle` spring)
2. Tab switch: Stats reset → count-up from 0 to actual value (600ms, `snappy`)
3. Pull-to-refresh: Skeleton placeholders → stagger-fade when data arrives

### Celebration Tiers

| Tier | Trigger | Visual | Haptic | Frequency |
|------|---------|--------|--------|-----------|
| **Micro** | Every set complete | Scale bounce + color flash | Light | High (every set) |
| **Meso** | Exercise / workout complete | Border glow + staggered reveals | Medium | Medium (per exercise) |
| **Macro** | Personal record | Gradient shimmer border + confetti (60 particles) | Heavy | Rare (PRs only) |

> 🎯 **The Earned Celebration Rule**: If every set triggers confetti, nothing feels special. NextRep reserves the Macro tier (confetti + heavy haptic + gradient border) **exclusively for personal records**. Every other interaction gets micro or meso feedback. This 3-tier system creates *escalating delight*.

---

## Do's and Don'ts

### ✅ Do

- **Use the accent for exactly ONE element per card** — make it the most important number or action
- **Right-align numeric columns** for scan-ability
- **Apply `tabular-nums`** to every stat, weight, rep count, and duration
- **Stagger card entry** with 50ms delays — it feels alive without being distracting
- **Use muscle-group colors consistently** — chest is always blue, back is always green, across every screen
- **Test dark mode first** — it's the default and primary experience
- **Add haptic feedback** to every interactive element — gym users don't look at the screen while working out
- **Keep borders invisible** by default — depth via surface luminance, not lines
- **Use fixed-width containers** for animated/changing numbers to prevent layout jumps
- **Let whitespace do the work** — generous `section-gap` between content blocks is free elegance

### ❌ Don't

- **Don't use accent orange as a background fill** — it's a signal color, not decoration
- **Don't mix warm colors** (orange + red + amber) in the same view — creates visual vibration
- **Don't use `text-[28px]` or arbitrary pixel values** — use the type scale (title = 28px)
- **Don't add drop shadows to cards on dark mode** — they're invisible and waste GPU
- **Don't use confetti for routine completions** — reserve it for PRs only
- **Don't create custom bottom-sheet/modal components** when a Shadcn primitive exists — the brand value is in tokens, not modal architecture
- **Don't use gradient backgrounds on content cards** — flat `surface` color reads cleaner
- **Don't override component default padding** without documenting why — `card-padding` exists for a reason
- **Don't use `--primary` for the accent color** — in Shadcn's system, `primary` means "foreground" in dark mode. Our accent is `accent`, explicitly separate
- **Don't animate everything** — motion is a seasoning, not the main course

---

## Migration Roadmap

### Phase 1: Token Unification (Low Effort, High Impact)

1. **Align dual color system**: Map `constants/colors.ts` runtime tokens → CSS variables in `global.css`. Single source of truth: CSS variables. Runtime `Colors` object becomes a *consumer* of CSS vars, not an independent palette.
2. **Rename `--primary`** CSS variable to `--accent` to avoid Shadcn semantic collision. Update all `bg-primary` / `text-primary` NativeWind classes → `bg-accent` / `text-accent`.
3. **Fix `--success`** CSS variable: currently resolves to `#fafafa` (foreground) — change to `#30D158`.
4. **Standardize Card padding**: Change base Card class from `p-6` → `p-4`. Update `bento` → `card-padding`.
5. **Add `tabular-nums`** to all Text variants that display numbers (`stat-value`, `hero-stat`, `large-stat`).

### Phase 2: Signature Components (Medium Effort, Highest Impact)

1. Build `<StatCard>` — the hero data display with animated counter
2. Build `<ExerciseRow>` — the compact workout row with muscle-group accent
3. Build `<ProgressRing>` — SVG circle progress with spring fill
4. Build `<PRBanner>` — gradient-border celebration with confetti
5. Build `<SetCounter>` — large +/- number input for gym-floor use
6. Refactor `<Button>` to `intent` + `density` variant system

### Phase 3: Motion System (Medium Effort, Differentiating Impact)

1. Create `lib/motion.ts` — `spring`, `stagger`, `duration` presets
2. Add `Expo.Haptics` to `AnimatedPressable` (light impact on press-in, release on press-out)
3. Replace `StyleSheet`-based `BottomSheetModal` with token-driven styling
4. Add shared-element transitions for exercise list → detail (Reanimated `sharedTransitionTag`)
5. Implement 3-tier celebration system (micro → meso → macro)

### Phase 4: Polish & Typography (Lower Priority)

1. Evaluate custom font (Inter or Geist) for brand differentiation
2. Ensure all inline `text-[Npx]` references are replaced with type scale tokens
3. Add skeleton loading states with shimmer animation
4. Audit WCAG contrast ratios (light mode especially)
5. Add responsive layout tokens if web support is prioritized
