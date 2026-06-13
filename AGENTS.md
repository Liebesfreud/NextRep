# NextRep AGENTS.md — AI Agent Reference

> Auto-read this file before any code generation. This is the source of truth for design conventions, token references, and code patterns.

---

## 1. Project Identity

- **App**: NextRep — Fitness tracker, Expo + NativeWind + rn-primitives
- **Design Philosophy**: "克制的热忱" (Restrained Passion)
  - 80% quiet dark surfaces → 20% orange accent fires only when it matters
- **Default mode**: Dark-first. Light mode is supported but secondary.
- **Motion personality**: "Snappy athletic" — damping 20, stiffness 300

---

## 2. Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Expo SDK 56 + React Native 0.85.3 |
| Navigation | expo-router v4 (file-based tabs) |
| Styling | NativeWind v4 (Tailwind classes → RN styles) |
| CSS Engine | NativeWind compile-time + global.css CSS vars |
| Primitives | @rn-primitives (slot, separator, switch) |
| Variants | class-variance-authority (CVA) |
| Icons | lucide-react-native |
| Animation | moti + react-native-reanimated |
| Database | drizzle-orm + expo-sqlite |
| Class Merge | clsx + tailwind-merge → cn() in lib/utils.ts |

---

## 3. Design Token Reference ("引用规则")

### 3.1 Color Tokens — NativeWind Classes

**NEVER hardcode hex values. Always use token names.**

| Token Class | Hex | Usage |
|-------------|-----|-------|
| `bg-background` | `#0A0A0F` | Root page background |
| `bg-surface` | `#141419` | Cards, sheets, containers |
| `bg-surface-elevated` | `#1C1C24` | Hovered cards, input bg |
| `bg-surface-hover` | `#222230` | Active hover state |
| --- | --- | --- |
| `text-accent` / `bg-accent` | `#FF6B2C` | Primary CTA, active states, PR celebrations |
| `text-primary` | `#F5F5F7` | Primary text |
| `text-secondary` | `#8E8E93` | Secondary text, labels |
| `text-tertiary` | `#636366` | Hints, units, placeholders |
| `text-success` / `bg-success` | `#30D158` | Set complete, PR achieved |
| `text-warning` / `bg-warning` | `#FFD60A` | Near failure, moderate strain |
| `text-danger` / `bg-danger` | `#FF453A` | Missed rep, destructive actions |
| `text-info` / `bg-info` | `#0A84FF` | Tips, secondary data |
| --- | --- | --- |
| `border border-border` | `#FFFFFF12` | Default subtle border |
| `border border-border-strong` | `#FFFFFF24` | Emphasis border |
| `bg-overlay` | `#00000099` | Modal/Sheet backdrop |

### 3.2 Muscle-Group Color Map (Viz Tokens)

These **must be consistent** across every chart, heatmap, and card:

| Class | Hex | Muscle |
|-------|-----|--------|
| `text-viz-muscle-chest` / `bg-viz-muscle-chest` | `#0A84FF` | Chest, Full Body |
| `text-viz-muscle-back` / `bg-viz-muscle-back` | `#30D158` | Back, Arms |
| `text-viz-muscle-shoulders` / `bg-viz-muscle-shoulders` | `#FF6B2C` | Shoulders |
| `text-viz-muscle-legs` / `bg-viz-muscle-legs` | `#FF9F0A` | Legs |
| `text-viz-muscle-core` / `bg-viz-muscle-core` | `#FF453A` | Core |
| `text-viz-muscle-cardio` / `bg-viz-muscle-cardio` | `#5AC8FA` | Cardio |

### 3.3 Typography Tokens

| Token Class | Size/Wt | When |
|-------------|---------|------|
| `text-hero-stat` | 48px/700 | Recovery score, total volume, duration |
| `text-large-stat` | 32px/700 | Secondary scores, timer |
| `text-title` | 28px/600 | Page titles |
| `text-heading` | 22px/600 | Section headings |
| `text-subheading` | 17px/600 | Card titles, exercise names |
| `text-body` | 15px/400 | Descriptions, instructions |
| `text-body-semibold` | 15px/600 | Emphasized body |
| `text-stat-value` | 20px/700 | In-card numbers (sets×reps, weight) |
| `text-caption` | 12px/400 | Timestamps, units |
| `text-micro` | 10px/500 | Set type indicators (W/D/F), tiny labels |

**Critical rule**: Every measurable number **must** use `tabular-nums`:
```tsx
<Text className="text-hero-stat font-variant-numeric-tabular-nums">12,480</Text>
```
This prevents jitter during animated counters. Applies to: stats, weights, reps, durations, percentages, scores. Does NOT apply to prose.

**Unit labels**: Always lighter weight + smaller. Number in `text-stat-value` or `text-hero-stat`, unit in `text-caption text-tertiary`.

### 3.4 Spacing Tokens

| Class | Value | Use |
|-------|-------|-----|
| `px-edge-x` | 20px | Horizontal page padding |
| `gap-section-gap` | 24px | Between major sections |
| `gap-card-gap` | 12px | Between sibling cards |
| `p-card-padding` | 16px | Inside cards |
| `gap-item-gap` | 8px | Between items inside a card |

### 3.5 Border Radius Tokens

| Class | Value | Use |
|-------|-------|-----|
| `rounded-sm` | 8px | Buttons, badges, inputs |
| `rounded-md` | 12px | Toggle groups, chips |
| `rounded-lg` | 16px | **Cards, sheets** — signature radius |
| `rounded-xl` | 20px | Bottom sheets, modals, hero cards |
| `rounded-pill` | 9999px | Pills, badges, toggles |

### 3.6 Elevation (Shadow — rarely used)

| Token | Use |
|-------|-----|
| `shadow-none` | Default — all cards |
| `shadow-subtle` | Floating tab bar, toasts |
| `shadow-medium` | Bottom sheets, modals |
| `shadow-strong` | Onboarding overlays, alerts |

**Rule**: In dark mode, depth comes from **luminance layering** (bg → surface → surface-elevated), not shadows. Shadows are invisible on dark surfaces.

---

## 4. Component Conventions

### 4.1 Architecture Rules

- **UI primitives** (`components/ui/`): Use RN primitives + CVA + `cn()`. Keep these generic and token-driven.
- **Feature components** (`components/home/`, `components/dashboard/`, `components/settings/`): Compose UI primitives. Business logic lives here.
- **Screens** (`app/`): Compose feature components. Minimal JSX.

### 4.2 Import Convention

```tsx
// UI primitives — direct named exports
import { Text } from "@/components/ui/text";
import { Button, ButtonText } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, BadgeText } from "@/components/ui/badge";
import { Sheet } from "@/components/ui/sheet";

// Animation primitives
import { AnimatedPressable } from "@/components/ui/AnimatedPressable";
import { AnimatedEnter } from "@/components/ui/AnimatedEnter";

// Feature components — PascalCase directory name
import { HomeHeader } from "@/components/home/HomeHeader";
import { TrainingOverview } from "@/components/dashboard/TrainingOverview";

// Lucide icons
import { Dumbbell, Flame } from "lucide-react-native";

// Hooks
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
```

### 4.3 Styling Rules

1. **Prefer NativeWind classes** over inline `style={}`:
   ```tsx
   // ✅ Correct
   <View className="flex-1 bg-surface p-card-padding gap-card-gap" />
   
   // ❌ Wrong — hardcoded values
   <View style={{ backgroundColor: "#141419", padding: 16, gap: 12 }} />
   ```

2. **Use `cn()` for className merging** — always:
   ```tsx
   <View className={cn("bg-surface", className)} {...props} />
   ```

3. **Dynamic colors**: Use `useTheme().colors` only when absolutely necessary (e.g., SVG fills). For everything else, use token classes.

4. **No `StyleSheet.create()`** in new code. Use NativeWind classes instead.

5. **Never hardcode hex values** — always use the token system.

### 4.4 Button Variants

```tsx
// Intent-based variants (Not visual-style-based)
<Button variant="default">      {/* bg-primary surface + accent text — white/orange */}
<Button variant="secondary">    {/* bg-surface-elevated + text-primary */}
<Button variant="destructive">  {/* bg-danger + white text */}
<Button variant="ghost">        {/* transparent + text-secondary */}
<Button variant="outline">      {/* border + bg-transparent */}
<Button variant="link">         {/* text-accent, underlined on web */}

// Density
<Button size="default">         {/* h-12 px-6 */}
<Button size="sm">              {/* h-10 px-3 */}
<Button size="lg">              {/* h-14 px-8 */}
<Button size="icon">            {/* h-12 w-12 */}
```

### 4.5 Text Variants

```tsx
<Text variant="title">Today's Workout</Text>
<Text variant="heading">Weekly Overview</Text>
<Text variant="subheading">Bench Press</Text>
<Text variant="body">Great session today!</Text>
<Text variant="muted">Last 7 days</Text>
<Text variant="caption">kg · lbs · reps</Text>
<Text variant="label">Username</Text>
```

### 4.6 Card Variants

```tsx
<Card>                     {/* bg-surface + rounded-lg + border border-border + p-card-padding */}
<CardHeader>               {/* gap-1.5 */}
<CardTitle>                {/* text-lg font-semibold */}
<CardDescription>          {/* text-sm text-muted-foreground */}
<CardContent>              {/* gap-4 */}
<CardFooter>               {/* mt-6 flex-row items-center gap-2 */}
```

### 4.7 Badge Variants

```tsx
<Badge variant="default">      {/* bg-accent/10 + text-accent */}
<Badge variant="secondary">    {/* bg-secondary */}
<Badge variant="destructive">  {/* bg-destructive/10 + text-destructive */}
<Badge variant="outline">      {/* bg-transparent + border */}
```

---

## 5. Spacing & Layout Conventions

### 5.1 Page Layout Pattern

```tsx
<View className="flex-1 bg-background">
  <ScrollView
    contentContainerStyle={{
      paddingHorizontal: 20,      // = px-edge-x
      paddingTop: insets.top + 16,
      paddingBottom: 100 + insets.bottom,
      gap: 16,                    // = gap-section-gap
    }}
  >
    {/* Header */}
    {/* Stat Cards — hero section */}
    {/* Section — card stack */}
    {/* Next section... */}
  </ScrollView>
</View>
```

### 5.2 Layout Rules

| Context | Spacing |
|---------|---------|
| Between page sections | `gap-section-gap` (24px) |
| Between sibling cards | `gap-card-gap` (12px) |
| Inside cards | `p-card-padding` (16px) |
| Between items in card | `gap-item-gap` (8px) |
| Card content children | `gap-4` (16px) |
| Horizontal page edges | `paddingHorizontal: 20` or `px-edge-x` |

---

## 6. Motion Reference

### 6.1 Spring Presets

```tsx
import { ELEGANT_SPRING, MICRO_INTERACTION_SPRING } from "@/constants/animations";

// Default — elegant, restrained
ELEGANT_SPRING = { type: "spring", damping: 20, stiffness: 90, mass: 1 }

// Micro-interaction — fast response
MICRO_INTERACTION_SPRING = { damping: 18, stiffness: 150, mass: 0.5 }
```

### 6.2 AnimatedEnter (Screen Entry)

```tsx
<AnimatedEnter delay={0} direction="up" distance={8}>
  {/* Hero content — fades in + slides up */}
</AnimatedEnter>

<AnimatedEnter delay={100} direction="up" distance={8}>
  {/* Secondary content — staggers in */}
</AnimatedEnter>
```

### 6.3 AnimatedPressable (Interactive Scale)

```tsx
<AnimatedPressable activeScale={0.97} activeOpacity={0.92}>
  {/* Content scales on press */}
</AnimatedPressable>
```

---

## 7. Critical DON'Ts

- DON'T use `--primary` as accent color. `--primary` = foreground. `--accent` = `#FF6B2C`.
- DON'T hardcode hex values. Always use token names.
- DON'T use `text-[28px]` or arbitrary pixel values — use `text-title`, `text-heading`, etc.
- DON'T add drop shadows to cards on dark mode — they're invisible.
- DON'T use confetti for routine completions — only for PRs (macro tier).
- DON'T create custom bottom-sheet/modal when `<Sheet>` primitive exists.
- DON'T use gradient backgrounds on content cards — flat `surface` color reads cleaner.
- DON'T use `StyleSheet.create()` in new code — use NativeWind classes.
- DON'T mix warm colors (orange + red + amber) in the same view.
- DON'T animate everything — motion is seasoning, not the main course.
- DON'T use `rounded-full` — use the design token `rounded-pill` (same value, correct name).
- DON'T use arbitrary `rounded-[*]` values — use the standard tokens: `rounded-sm` `rounded-md` `rounded-lg` `rounded-xl` `rounded-pill`.

---

## 8. File Organization

```
app/                          # Expo Router pages (file-based routing)
  _layout.tsx                 # Root: ThemeProvider + Tabs
  index.tsx                   # Home — workout logging
  dashboard.tsx               # Dashboard — analytics
  ai-coach.tsx                # AI coach
  settings.tsx                # Settings
  settings/exercises.tsx      # Exercise library
components/
  ui/                         # UI primitives (14 files)
  home/                       # Home screen feature components
  dashboard/                  # Dashboard feature components
  settings/                   # Settings feature components
constants/
  colors.ts                   # Runtime color bridge (consumer of CSS vars)
  animations.ts               # Spring presets
  exerciseVisuals.ts          # Muscle-group icon/color map
hooks/
  useTheme.tsx                # Theme context + AsyncStorage persistence
lib/
  utils.ts                    # cn() utility (clsx + tailwind-merge)
db/
  client.ts                   # Drizzle SQLite init
  schema.ts                   # Drizzle tables
  services/                   # Data access layer (5 modules)
```

---

## 9. CSS Variable Integration (Current State)

The `global.css` defines CSS variables consumed by NativeWind. `tailwind.config.js` maps `var(--xxx)` to Tailwind classes.

**Current mapping** (to be used in NativeWind classes):
- `var(--background)` → `bg-background`, `text-background`
- `var(--foreground)` → `text-foreground`
- `var(--primary)` → `bg-primary`, `text-primary` (foreground, not accent)
- `var(--destructive)` → `bg-destructive`, `text-destructive`
- `var(--secondary)` → `bg-secondary`, `text-secondary`
- `var(--muted)` → `bg-muted`, `text-muted-foreground`
- `var(--accent)` → `bg-accent`, `text-accent` (Shadcn default = gray)
- `var(--border)` → `border-border`

> **Note**: Custom design tokens (surface, accent-orange, text-secondary, gap-*, rounded-*) are defined in `tailwind.theme.json` and loaded by `tailwind.config.js`.
