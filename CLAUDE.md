# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Where In Maginhawa is a community-driven platform to discover restaurants, cafés, and food spots on Maginhawa Street, Quezon City, Philippines. Built as a **Turborepo monorepo** using **pnpm** with Next.js 14+ App Router, TypeScript, and Tailwind CSS.

**Key Architecture Philosophy**:
- Individual JSON files per place (apps/web/src/data/places/*.json) to prevent merge conflicts
- Auto-generated index files (places.json, stats.json) for optimized search performance
- Phase 1: JSON-based data layer | Phase 2 (planned): Supabase PostgreSQL migration

## Essential Commands

### Development
```bash
pnpm install           # Install dependencies for all workspaces
pnpm dev              # Run dev servers for all apps (main app at localhost:3000)
pnpm build            # Build all apps and packages (runs prebuild hooks)
pnpm lint             # Run linting for all apps
pnpm type-check       # Type check all TypeScript
```

### Data Management (Critical)
```bash
# Auto-generate index files from individual place files
pnpm build:index      # Generate apps/web/src/data/places.json (lightweight index)
pnpm build:stats      # Generate apps/web/src/data/stats.json (cuisine/amenity counts)

# Validation
pnpm validate:places  # Validate ALL place files
pnpm validate:place <file>  # Validate specific file (e.g., apps/web/src/data/places/rodics-diner.json)
```

**IMPORTANT**: `places.json` and `stats.json` are auto-generated. NEVER edit them manually. Always run `pnpm build:index` and `pnpm build:stats` after modifying individual place files.

### Testing Individual Features
```bash
# Run a single validation
tsx scripts/validate-place.ts apps/web/src/data/places/your-file.json

# Test index generation
tsx scripts/build-places-index.ts

# Validate in CI mode (clean output)
tsx scripts/validate-place.ts apps/web/src/data/places --ci
```

## Architecture & Data Flow

### Two-Tier Data System

**PlaceIndex (Lightweight)**: Used in places.json for list views, search results, filtering
- Contains: id, name, slug, description, address, priceRange, tags, amenities, cuisineTypes, specialties, updatedAt
- Excludes: operatingHours, contact info, location, media URLs
- Size: ~168KB vs 380KB for full data
- Location: `apps/web/src/data/places.json` (auto-generated)

**Place (Complete)**: Individual files with full details for place pages
- Contains: All PlaceIndex fields PLUS operatingHours, phone, email, website, media URLs, location coords, payment methods
- Location: `apps/web/src/data/places/[slug].json` (manually edited)
- Schema: See `apps/web/src/types/place.ts`

### Data Flow
```
Individual Files                     Auto-Generated Files
─────────────────                    ────────────────────
places/rodics-diner.json     ──┐
places/crazy-katsu.json      ──┤──→  places.json (PlaceIndex[])
places/friuli-trattoria.json ──┤     Used for: search, filters, lists
... (225+ files)             ──┘
                                 └──→ stats.json
                                      Used for: filter counts, analytics
```

### Search Implementation
- **Client-side fuzzy search**: Fuse.js with PlaceIndex (apps/web/src/lib/places.ts)
- **Weighted fields**: name (2.0), cuisineTypes/specialties (1.5), tags (1.2), description/amenities (1.0)
- **Threshold**: 0.4 for fuzzy matching
- **Autocomplete**: Top 5 matches for places, tags, amenities, cuisines

### Component Organization
```
components/
├── hero/          # Landing page hero section with animated gradients
├── search/        # Search bar with autocomplete, CommandMenu
├── place/         # PlaceCard, PlaceDetail, PlaceGrid components
├── filters/       # Tag, cuisine, price range filters
├── navigation/    # Nav, Footer
├── seo/          # Metadata, SEO components
└── ui/           # shadcn/ui components (Button, Card, Dialog, etc.)
```

## Critical Development Rules

### 1. Place File Management

**When adding/updating places**:
1. ONLY edit individual files in `apps/web/src/data/places/[slug].json`
2. NEVER manually edit `places.json` or `stats.json`
3. Always run validation: `pnpm validate:place <file-path>`
4. After merging changes, GitHub Actions auto-generates index files
5. UUID generation required for new places: https://www.uuidgenerator.net/

**Validation Schema** (scripts/validate-place.ts):
- `id`: Valid UUID format
- `slug`: Kebab-case only (lowercase, hyphens)
- `description`: Minimum 10 characters
- `operatingHours`: Time format HH:MM (24-hour)
- `priceRange`: Exactly '$', '$$', '$$$', or '$$$$'
- `cuisineTypes`: At least one required
- `email/website/URLs`: Valid format or empty string ""
- `createdAt/updatedAt`: ISO 8601 timestamps

### 2. Type Safety

**Always use proper types**:
- Import from `@/types/place`: `Place`, `PlaceIndex`, `SearchFilters`, `SearchResult`
- For list views/search: Use `PlaceIndex`
- For detail pages: Use `Place` (loaded via `getPlaceBySlug`)
- Operating hours: Use `OperatingHours` type
- Tags: Import tag types from `@/types/tags.ts`

### 3. Data Loading Patterns

**Static list pages** (use PlaceIndex):
```typescript
import placesIndex from '@/data/places.json';
const places: PlaceIndex[] = placesIndex;
```

**Dynamic detail pages** (load full Place):
```typescript
import { getPlaceBySlug } from '@/lib/places';
const place = await getPlaceBySlug(params.slug);
```

**Search/Filter** (use helper functions):
```typescript
import { searchPlaces, getAllTags, getAllCuisineTypes } from '@/lib/places';
const results = searchPlaces({ query, tags, cuisineTypes, priceRanges });
```

### 4. Phase 2 Database Migration Preparation

The `Place` type already mirrors the Supabase PostgreSQL schema (documented in apps/web/src/types/place.ts). When migrating to Phase 2:
- Table structure already defined with indexes
- Full-text search vector configuration ready
- Tag normalization via junction table
- Keep slug-based routing (SEO-friendly)

## Community Contribution Workflow

1. **User creates PR** with new place file
2. **GitHub Actions validates** (`.github/workflows/validate-pr.yml`)
3. **Bot comments** with validation results
4. **PR merged** → Build workflow runs (`.github/workflows/build-and-deploy.yml`)
5. **Index files rebuilt** → Committed back to repo
6. **Vercel deploy hook** triggered → Site deploys

**Validation in CI**: Uses `--ci` flag for clean, parseable output. See scripts/validate-place.ts for implementation.

## Workspace Structure

This is a Turborepo monorepo with pnpm workspaces:

```
whereinmaginhawa/
├── apps/
│   └── web/              # Main Next.js app (@whereinmaginhawa/web)
└── packages/
    └── typescript-config/ # Shared TS configs (base.json, nextjs.json)
```

**Package management**:
- Install in specific workspace: `pnpm add <package> --filter @whereinmaginhawa/web`
- Install dev dependency in root: `pnpm add -Dw <package>`
- Turborepo tasks defined in `turbo.json`

## Testing & Quality

- **Type checking**: `pnpm type-check` (runs tsc --noEmit)
- **Linting**: `pnpm lint` (ESLint 9 with Next.js config)
- **Data validation**: Critical for maintaining data integrity
- **Build validation**: Prebuild hooks ensure data is generated before builds

## Next.js App Router Patterns

- **File-based routing**: `app/page.tsx` (home), `app/places/[slug]/page.tsx` (detail)
- **Metadata generation**: Export `metadata` or `generateMetadata` for SEO
- **Static generation**: Place detail pages use `generateStaticParams`
- **Client components**: Search, filters marked with 'use client'
- **Server components**: Default for data fetching and SEO

## Key Dependencies

- **UI**: shadcn/ui (Radix UI primitives), Tailwind CSS v4, Framer Motion
- **Search**: Fuse.js for client-side fuzzy search
- **Validation**: Zod schemas (scripts/validate-place.ts)
- **Icons**: Lucide React
- **Analytics**: Vercel Analytics, Speed Insights
- **Command Palette**: cmdk for search modal

## Environment Variables

Create `apps/web/.env.local`:
```
NEXT_PUBLIC_MAGICUI_API_KEY=your_api_key_here
```

## CI/CD Pipeline

**PR Validation** (.github/workflows/validate-pr.yml):
- Detects changed place files
- Validates with Zod schema
- Comments results on PR

**Build & Deploy** (.github/workflows/build-and-deploy.yml):
- Runs on merge to main
- Validates changed files
- Builds places.json and stats.json
- Commits built files
- Triggers Vercel deployment via webhook

**GitHub Secrets Required**:
- `VERCEL_DEPLOY_HOOK`: Deployment webhook URL
