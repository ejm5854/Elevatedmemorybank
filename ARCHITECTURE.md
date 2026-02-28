# Elevated — Architecture Document
> Couples travel memory app for Erik & Marisa  
> Stack: React 18 + Vite + TypeScript + Tailwind CSS + Zustand + React Router v6 + React Leaflet + Framer Motion

---

## 1. File Structure

```
tmp/elevated/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── tsconfig.node.json
└── src/
    ├── main.tsx                        # React entry point, Router wraps App
    ├── App.tsx                         # Route definitions
    ├── index.css                       # Tailwind directives + Google Fonts import
    │
    ├── types/
    │   └── index.ts                    # All TypeScript interfaces (Trip, Memory, AppState, Theme)
    │
    ├── store/
    │   └── useAppStore.ts              # Zustand store — trips, memories, theme, actions, persist middleware
    │
    ├── data/
    │   └── seedTrips.ts                # 7 realistic seed trips with coordinates + picsum photos
    │
    ├── utils/
    │   ├── cn.ts                       # clsx + tailwind-merge utility
    │   ├── dates.ts                    # Date formatting helpers
    │   └── stats.ts                    # Derived stats: total days, countries, continents
    │
    ├── hooks/
    │   ├── useTheme.ts                 # Reads active theme tokens from store
    │   └── useTrips.ts                 # Selector hooks: useAllTrips, useTripById, useFilteredTrips
    │
    ├── components/
    │   ├── Navbar.tsx                  # Top nav with theme-aware styles, active route highlight
    │   ├── LockScreen.tsx              # PIN entry gate — sets active theme on correct PIN
    │   ├── Hero.tsx                    # Home hero banner with animated headline
    │   ├── StatsBar.tsx                # Horizontal stat strip (trips, countries, days, years)
    │   ├── TripCard.tsx                # Single trip card — cover photo, title, destination, rating
    │   ├── TripGrid.tsx                # Responsive grid of TripCards
    │   ├── TripListItem.tsx            # Compact list-row view for a trip
    │   ├── ViewToggle.tsx              # Grid / List toggle button pair
    │   ├── TagBadge.tsx                # Pill badge for trip tags
    │   ├── StarRating.tsx              # 1–5 star display / input component
    │   ├── PhotoUpload.tsx             # File input + base64 preview for memory photos
    │   ├── MemoryCard.tsx              # Photo + note card inside trip detail
    │   └── MapPin.tsx                  # Custom Leaflet marker icon component
    │
    ├── pages/
    │   ├── Home.tsx                    # Landing page — Hero + StatsBar + recent trips strip
    │   ├── MemoryBank.tsx              # /memories — grid/list of all trips + filters
    │   ├── TripDetail.tsx              # /memories/:id — full trip detail + memories gallery
    │   ├── NewTrip.tsx                 # /memories/new — add trip form
    │   ├── EditTrip.tsx                # /memories/:id/edit — edit trip form (shares form component)
    │   └── WorldMap.tsx                # /map — React Leaflet map with trip pins
    │
    └── forms/
        └── TripForm.tsx                # Shared form component used by NewTrip + EditTrip
```

---

## 2. Data Model

### Core Interfaces (`src/types/index.ts`)

```typescript
// Geographic coordinates for map pin placement
export interface Coordinates {
  lat: number
  lng: number
}

// A photo or note attached to a trip (individual memory)
export interface Memory {
  id: string
  tripId: string
  type: 'photo' | 'note'
  // For photos: base64 data URL or URL string
  photoUrl?: string
  caption?: string
  note?: string
  createdAt: string   // ISO 8601
}

// Core trip entity
export interface Trip {
  id: string
  title: string
  // Destination breakdown for map + display
  destination: {
    city: string
    country: string
    countryCode: string   // ISO 3166-1 alpha-2, e.g. "US"
    continent: string
    coordinates: Coordinates
  }
  startDate: string       // ISO 8601 date string "YYYY-MM-DD"
  endDate: string         // ISO 8601 date string "YYYY-MM-DD"
  coverPhotoUrl: string   // Primary card image
  photos: string[]        // Additional photo URLs
  notes: string           // Trip overview / journal entry
  rating: number          // 1–5 stars
  tags: string[]          // e.g. ["beach", "adventure", "food"]
  erikAttended: boolean
  marisaAttended: boolean
  createdAt: string       // ISO 8601 — used for sort
  updatedAt: string       // ISO 8601
}

// Theme token set (Erik dark luxury vs Marisa warm romance)
export type ThemeName = 'erik' | 'marisa'

export interface ThemeTokens {
  name: ThemeName
  displayName: string
  pin: string             // 4-digit PIN string
  bgHex: string
  surfaceHex: string
  accentHex: string
  textHex: string
  textMutedHex: string
  borderHex: string
  navBgHex: string
  cardBgHex: string
}

// View preference for MemoryBank page
export type ViewMode = 'grid' | 'list'

// Full Zustand store shape
export interface AppState {
  // --- Data ---
  trips: Trip[]
  memories: Memory[]

  // --- UI State ---
  activeTheme: ThemeName | null   // null = lock screen
  viewMode: ViewMode

  // --- Trip Actions ---
  addTrip: (trip: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTrip: (id: string, updates: Partial<Omit<Trip, 'id' | 'createdAt'>>) => void
  deleteTrip: (id: string) => void

  // --- Memory Actions ---
  addMemory: (memory: Omit<Memory, 'id' | 'createdAt'>) => void
  deleteMemory: (id: string) => void

  // --- UI Actions ---
  setActiveTheme: (theme: ThemeName | null) => void
  setViewMode: (mode: ViewMode) => void
}
```

---

## 3. Zustand Store Design (`src/store/useAppStore.ts`)

### Key Decisions
- **`persist` middleware** from `zustand/middleware` — stores to `localStorage` key `"elevated-app-state"`
- `activeTheme` is intentionally **excluded from persistence** (partialize) so the app always starts at the lock screen
- `viewMode` IS persisted so the user's last preference is remembered
- IDs generated with `crypto.randomUUID()` (native browser API, no uuid library needed)
- Timestamps are `new Date().toISOString()`

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AppState, Trip, Memory, ThemeName, ViewMode } from '../types'
import { SEED_TRIPS } from '../data/seedTrips'

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // --- Initial State ---
      trips: SEED_TRIPS,
      memories: [],
      activeTheme: null,      // always starts locked
      viewMode: 'grid',

      // --- Trip Actions ---
      addTrip: (tripData) => {
        const trip: Trip = {
          ...tripData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({ trips: [trip, ...state.trips] }))
      },

      updateTrip: (id, updates) => {
        set((state) => ({
          trips: state.trips.map((t) =>
            t.id === id
              ? { ...t, ...updates, updatedAt: new Date().toISOString() }
              : t
          ),
        }))
      },

      deleteTrip: (id) => {
        set((state) => ({
          trips: state.trips.filter((t) => t.id !== id),
          // Cascade-delete orphaned memories
          memories: state.memories.filter((m) => m.tripId !== id),
        }))
      },

      // --- Memory Actions ---
      addMemory: (memoryData) => {
        const memory: Memory = {
          ...memoryData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        }
        set((state) => ({ memories: [memory, ...state.memories] }))
      },

      deleteMemory: (id) => {
        set((state) => ({
          memories: state.memories.filter((m) => m.id !== id),
        }))
      },

      // --- UI Actions ---
      setActiveTheme: (theme) => set({ activeTheme: theme }),
      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    {
      name: 'elevated-app-state',
      storage: createJSONStorage(() => localStorage),
      // Exclude activeTheme — always re-authenticate on load
      partialize: (state) => ({
        trips: state.trips,
        memories: state.memories,
        viewMode: state.viewMode,
        // activeTheme intentionally omitted
      }),
    }
  )
)
```

---

## 4. Routing Plan

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Home.tsx` | Landing page with hero, stats, recent trips |
| `/memories` | `MemoryBank.tsx` | Full trip grid/list with search + tag filter |
| `/memories/new` | `NewTrip.tsx` | Add trip form (must be before `:id` route) |
| `/memories/:id` | `TripDetail.tsx` | Single trip — cover, journal, memories gallery |
| `/memories/:id/edit` | `EditTrip.tsx` | Edit trip form, pre-filled with existing data |
| `/map` | `WorldMap.tsx` | Interactive Leaflet map with all trip pins |

### Router Setup Notes
- Wrap all routes in a `<ProtectedRoute>` component that redirects to `/` if `activeTheme === null`
- `/memories/new` must appear **before** `/memories/:id` in the `<Routes>` block to avoid "new" being matched as an ID
- Use `<Navigate replace to="/" />` as a catch-all for unknown routes

---

## 5. Theme System

Themes live in `src/store/useAppStore.ts` (exported as `THEMES`) and are keyed by `ThemeName`.

```
Erik Theme (dark luxury):
  bg:         #0a1628   (deep navy)
  surface:    #111f3a
  accent:     #C9A84C   (gold)
  text:       #f5f0e8
  textMuted:  #a89b7a
  card:       #0f2040

Marisa Theme (warm romance):
  bg:         #fff0f4   (blush white)
  surface:    #fff8fa
  accent:     #e8829a   (rose pink)
  text:       #5c2d3a
  textMuted:  #c2849a
  card:       #fff5f8
```

Luna + Isabelle can update exact hex values in `src/store/useAppStore.ts` → `THEMES` object. The Tailwind config extends these as CSS custom properties so component classes like `text-accent`, `bg-surface` work across the app.

---

## 6. Seed Data (`src/data/seedTrips.ts`)

7 trips with realistic destinations, coordinates, and Picsum placeholder images:

| # | Title | City | Country | Coordinates | Date Range |
|---|-------|------|---------|-------------|------------|
| 1 | Golden Hour in Hawaii | Maui | USA | 20.7984, -156.3319 | Jun 2023 |
| 2 | California Dreaming | San Francisco | USA | 37.7749, -122.4194 | Dec 2021 |
| 3 | Rocky Mountain High | Breckenridge | USA | 39.4817, -106.0384 | Mar 2022 |
| 4 | Temples of the Kingdom | Siem Reap | Cambodia | 13.3633, 103.8564 | Mar 2024 |
| 5 | Lost in London | London | UK | 51.5074, -0.1278 | Sep 2022 |
| 6 | Midnight in Tokyo | Tokyo | Japan | 35.6762, 139.6503 | Nov 2024 |
| 7 | Wine & Cobblestones | Porto | Portugal | 41.1579, -8.6291 | May 2025 |

Photos use `https://picsum.photos/seed/[keyword]/800/600` for stable, deterministic placeholders.

---

## 7. Component Contracts

### `TripCard.tsx`
```typescript
interface TripCardProps {
  trip: Trip
  onClick?: () => void
}
```

### `TripForm.tsx` (shared by NewTrip + EditTrip)
```typescript
interface TripFormProps {
  initialValues?: Partial<Trip>
  onSubmit: (data: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
  mode: 'create' | 'edit'
}
```

### `MapPin.tsx`
```typescript
interface MapPinProps {
  trip: Trip
  onClick: (trip: Trip) => void
}
```

### `PhotoUpload.tsx`
```typescript
interface PhotoUploadProps {
  onUpload: (base64: string) => void
  label?: string
}
```
Converts `File` → base64 via `FileReader` and calls `onUpload`. No external storage needed for localStorage phase.

---

## 8. localStorage Persistence Strategy

The Zustand `persist` middleware handles all serialization automatically. Key considerations:

**Storage Budget:**
- Each base64-encoded photo ~100–400KB
- localStorage limit is ~5MB per origin
- `PhotoUpload` should warn users if total storage exceeds 4MB (`navigator.storage.estimate()`)
- For now, photos stored as base64 strings in `Trip.photos[]` and `Memory.photoUrl`

**Migration Path to Supabase:**
1. Replace `createJSONStorage(() => localStorage)` with a custom Supabase storage adapter
2. `Trip` and `Memory` interfaces already match Supabase table column naming conventions
3. `id: string` (UUID) aligns with Supabase's `uuid` type with `gen_random_uuid()` default
4. Photos migrate to Supabase Storage buckets — `photoUrl` just becomes a Supabase signed URL
5. `activeTheme` migrates to a `user_preferences` table keyed by Supabase `user.id`

---

## 9. Performance Notes

- `React.lazy()` + `Suspense` on all page components (configured in `App.tsx`)
- Vite code-splitting is automatic per lazy-loaded route
- Framer Motion `AnimatePresence` wraps `<Routes>` for page transitions
- `TripGrid` uses CSS grid with `aspect-ratio: 3/2` cards — no JS layout calculations
- Leaflet map loads only on `/map` route (lazy loaded) — avoids tile downloads on other pages
- Images lazy-load with `loading="lazy"` attribute on all `<img>` tags

---

## 10. Implementation Roadmap

| Phase | Work | Owner |
|-------|------|-------|
| **Phase 1** (now) | Architecture doc + full scaffold | Kai |
| **Phase 2** | Memory Bank page + TripForm + TripDetail | Kai |
| **Phase 3** | World Map page with Leaflet pins | Noah (map specialist) |
| **Phase 4** | Visual polish — animations, transitions | Luna (UI/UX) |
| **Phase 5** | Final color tokens, brand assets | Isabelle + Luna |
| **Phase 6** | Supabase migration | Kai |
