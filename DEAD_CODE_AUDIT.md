# NextRep Dead/Unused Code Audit Report
**Scanned:** 2026-06-13 | **Scope:** Full project excluding node_modules, .git, .expo-home

---

## 1. UNUSED FILES (High Confidence)

| File | Reason | Action |
|------|--------|--------|
| `constants/theme.ts` | Entire file is never imported anywhere. All exports (`spacing`, `radius`, `typography`, `shadow`, `BENTO_GAP`, `BENTO_RADIUS_LG`, `BENTO_RADIUS_SM`) have zero consumers. | **Delete** |
| `components/ui/LightEffect.tsx` | Exported `LightEffect` component is never imported by any file. | **Delete** — or integrate if ambient glow is desired |
| `components/ui/brand-mark.tsx` | Exported `BrandMark` component is never imported. | **Delete** — or use for branding |
| `components/ui/category-badge.tsx` | Exported `CategoryBadge` + `CategoryBadgeProps` are never imported. | **Delete** |
| `components/ui/dialog.tsx` | Exported `Dialog` + `DialogProps` are never imported. | **Delete** |
| `components/ui/empty-state.tsx` | Exported `EmptyState` + `EmptyStateProps` are never imported. | **Delete** — or use for empty state views |
| `components/ui/label.tsx` | Exported `Label` is never imported. | **Delete** |
| `components/ui/pagination-dots.tsx` | Exported `PaginationDots` + `PaginationDotsProps` are never imported. | **Delete** |
| `components/ui/section-header.tsx` | Exported `SectionHeader` + `SectionHeaderProps` are never imported. | **Delete** — or use for section headers |
| `components/ui/status-badge.tsx` | Exported `StatusBadge` + `StatusBadgeProps` are never imported. | **Delete** |
| `components/ui/switch.tsx` | Exported `Switch` is never imported. | **Delete** |
| `assets/adaptive-icon.png` | 3MB file, not referenced in `app.json` (which uses `android-icon-foreground.png` / `android-icon-background.png` instead). | **Delete** — save 3MB |
| `docs/ARCHITECTURE.md` | Not imported or linked; dev-only docs | **Keep** (not code) |
| `docs/DATA_AND_PRIVACY.md` | Same | **Keep** |
| `docs/DEVELOPMENT.md` | Same | **Keep** |

---

## 2. UNUSED EXPORTS (Dead Code Within Used Files)

### 2a. `constants/theme.ts` — ALL exports unused
| Export | Confidence | Action |
|--------|-----------|--------|
| `spacing` | **HIGH** — no import found | **Delete** (file) |
| `radius` | **HIGH** | **Delete** (file) |
| `typography` | **HIGH** | **Delete** (file) |
| `shadow` | **HIGH** | **Delete** (file) |
| `BENTO_GAP` | **HIGH** | **Delete** (file) |
| `BENTO_RADIUS_LG` | **HIGH** | **Delete** (file) |
| `BENTO_RADIUS_SM` | **HIGH** | **Delete** (file) |

### 2b. `hooks/useTheme.tsx` — `toggleTheme` unused
| Export | Confidence | Action |
|--------|-----------|--------|
| `toggleTheme` | **HIGH** — exposed in context type and provider, but never destructured from `useTheme()` anywhere | **Delete** from context type, provider, and value |

### 2c. `constants/colors.ts` — 3 color properties never referenced
| Export | Confidence | Action |
|--------|-----------|--------|
| `Colors.dark.bento` / `Colors.light.bento` | **HIGH** — no `colors.bento` usage found | **Delete** — app uses `colors.card` instead |
| `Colors.dark.black` / `Colors.light.black` | **MEDIUM** — no `colors.black` usage; "black" is confusing (actually inverted per theme) | **Delete** |
| `Colors.dark.accentForeground` / `Colors.light.accentForeground` | **HIGH** — `accent-foreground` CSS var never used in Tailwind classes | **Delete** |

### 2d. `db/schema.ts` — 5 type exports never used externally
| Export | Confidence | Action |
|--------|-----------|--------|
| `NewWorkout` | **HIGH** — no import found | **Delete** |
| `StrengthPreset` (type) | **HIGH** — no import found | **Delete** |
| `DailyCheckin` (type) | **HIGH** — no import found | **Delete** |
| `BodyMetric` (type) | **HIGH** — no import found | **Delete** |
| `UserProfile` (type) | **HIGH** — no import found | **Delete** |

Note: The table constants themselves (`workouts`, `strengthPresets`, etc.) ARE used by db/ services — only the inferred type exports are dead.

---

## 3. UNUSED DEPENDENCIES (package.json)

| Package | Confidence | Reason | Action |
|---------|-----------|--------|--------|
| `expo-blur` | **HIGH** | No import found. Not in app.json plugins or code. | **Remove** |
| `expo-constants` | **HIGH** | No import found (`Constants` from expo-constants not used). | **Remove** |
| `expo-font` | **HIGH** | No `useFonts` or font loading found. | **Remove** |
| `expo-linear-gradient` | **HIGH** | No `LinearGradient` import found. | **Remove** |
| `expo-linking` | **HIGH** | No `Linking` import found. | **Remove** |
| `expo-system-ui` | **HIGH** | No import found. Not in app.json plugins. | **Remove** |
| `markdown-it` | **HIGH** | No import found. (Was likely replaced by `react-native-markdown-display`) | **Remove** |
| `punycode` | **HIGH** | No import found. Likely a transient dep accidentally persisted. | **Remove** |
| `react-native-web` | **MEDIUM** — no direct import, but Expo/Metro may need it for web builds. | **Investigate** — if web not used, remove |
| `react-native-worklets` | **MEDIUM** — no direct import, but `react-native-reanimated` may require it. | **Investigate** — if reanimated doesn't need it, remove |
| `react-native-screens` | **MEDIUM** — no direct import, but `expo-router` requires it. | **Keep** (peer dep) |
| `@emotion/is-prop-valid` | **MEDIUM** — no direct import, but `framer-motion`/`moti` may list it as peer dep. | **Investigate** — check if moti actually requires it |
| `@emotion/memoize` | **MEDIUM** — same as above | **Investigate** |

---

## 4. UNUSED CSS / TAILWIND THEME EXTENSIONS

### 4a. CSS Custom Properties in `global.css` (never referenced in Tailwind)

| Variable | Confidence | Action |
|----------|-----------|--------|
| `--success` / `--success-foreground` | **HIGH** — no `bg-success`, `text-success`, or `border-success` class used in any component | **Delete** from global.css and tailwind config |
| `--accent` / `--accent-foreground` | **HIGH** — no `bg-accent`, `text-accent` used anywhere | **Delete** from global.css and tailwind config |

### 4b. Tailwind Config Extensions

| Extension | Used? | Confidence | Action |
|-----------|-------|-----------|--------|
| `colors.success` / `colors.success.foreground` | **NO** — never used in classes | **HIGH** | **Delete** from tailwind.config.js & global.css |
| `colors.accent` / `colors.accent.foreground` | **NO** | **HIGH** | **Delete** from tailwind.config.js & global.css |
| `fontFamily.sans: ["System"]` | Not used in NativeWind (uses platform default) | **MEDIUM** | **Investigate** — likely dead |
| `spacing.bento: "16px"` | NOT used via class `gap-bento` or `p-bento` (inline `gap-4` used instead) | **HIGH** | **Delete** |
| `borderRadius.bento-lg` / `borderRadius.bento-sm` | **YES** — used as `rounded-bento-lg` and `rounded-bento-sm` | N/A | **Keep** |

### 4c. Tailwind Content Paths

| Path | Exists? | Action |
|------|---------|--------|
| `./features/**/*.{js,jsx,ts,tsx}` | **NO** — no `features/` directory | **Delete** from content array |

---

## 5. OBSOLETE / LEGACY CODE

### 5a. Legacy AI Config Fields (marked `// Legacy` in code)

| Location | Fields | Confidence | Action |
|----------|--------|-----------|--------|
| `db/schema.ts` lines 67-69 | `aiBaseUrl`, `aiApiKey`, `aiModel` columns | **HIGH** — superseded by multi-config `aiConfigs` JSON | **Phase out** — keep DB columns + migration for backward compat, but stop writing to them |
| `db/services/profile.ts` lines 23-25, 99-102 | `aiBaseUrl`/`aiApiKey`/`aiModel` in `UserProfileData` type and reads | **HIGH** | Auto-migration logic (lines 81-89) is good — can eventually remove after all users migrated |
| `db/services/data.ts` lines 43-51, 257-259 | Export/import of legacy fields | **MEDIUM** | Keep for backward-compat of exported data |
| `app/settings.tsx` lines 29-31 | Hardcoded `null` values for legacy fields in state init | **HIGH** | Safe to clean up |

### 5b. `BottomSheetModal.tsx` uses `useColorScheme()` from RN

| Location | Issue | Action |
|----------|-------|--------|
| `components/ui/BottomSheetModal.tsx:14` | Imports `useColorScheme` from `react-native` instead of using `useTheme` hook which already has theme info | **Investigate** — use `useTheme().theme` instead |

---

## 6. SUMMARY STATISTICS

| Category | Count | Est. Size Savings |
|----------|-------|-------------------|
| Unused files (UI components) | 11 components | ~15KB source |
| Unused file (theme constant) | 1 file | ~1KB |
| Unused asset file | `adaptive-icon.png` | ~3.1MB |
| Unused exports | `toggleTheme`, 3 color props, 5 schema types, 4 theme objects | ~0.5KB |
| Unused dependencies | 6 HIGH confidence | ~varies (node_modules) |
| Unused CSS vars / Tailwind tokens | 4 vars + 2 color groups + 1 spacing | ~0.3KB |
| Legacy/deprecated code | AI legacy fields (3 DB cols, type, state) | ~1KB |
| Dead tailwind content path | `features/` | minimal |
| **Total dead code files** | **13 files** | **~3.1MB+ (mostly asset)** |

---

## 7. RECOMMENDED ACTIONS (Priority Order)

### Immediate — Delete (Zero Risk)
1. Delete `constants/theme.ts` — never imported
2. Delete 10 unused UI components: `LightEffect`, `BrandMark`, `CategoryBadge`, `Dialog`, `EmptyState`, `Label`, `PaginationDots`, `SectionHeader`, `StatusBadge`, `Switch`
3. Delete `assets/adaptive-icon.png` — 3MB, not referenced
4. Remove `toggleTheme` from useTheme hook/context
5. Remove unused color properties: `bento`, `black`, `accentForeground` from `constants/colors.ts`
6. Remove `features/` path from `tailwind.config.js` content array
7. Remove `--success`/`--success-foreground` CSS vars + tailwind `success` color
8. Remove `--accent`/`--accent-foreground` CSS vars + tailwind `accent` color
9. Remove `spacing.bento` from tailwind config
10. Remove unused type exports from `db/schema.ts`

### Cleanup — Remove Unused Dependencies
1. `expo-blur`, `expo-constants`, `expo-font`, `expo-linear-gradient`, `expo-linking`, `expo-system-ui`
2. `markdown-it`, `punycode`

### Investigation Needed — May Affect Runtime
1. `react-native-web` — needed for web builds?
2. `react-native-worklets` — needed by reanimated?
3. `@emotion/is-prop-valid` + `@emotion/memoize` — needed by moti?
4. `fontFamily.sans: ["System"]` in tailwind — used by NativeWind v4?
5. `BottomSheetModal.tsx` using `useColorScheme()` instead of `useTheme()`
6. Legacy AI fields (`aiBaseUrl`/`aiApiKey`/`aiModel`) — schedule deprecation
