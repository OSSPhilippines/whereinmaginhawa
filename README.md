# Where In Maginhawa

A community-driven platform to discover the best restaurants, cafés, and food spots on Maginhawa Street, Quezon City, Philippines.

**🌟 Community-Powered**: Anyone can contribute by adding or updating places via pull requests!

## 📦 Monorepo Structure

This project uses [Turborepo](https://turbo.build/repo) with [pnpm](https://pnpm.io/) for efficient monorepo management.

### Workspaces

```
whereinmaginhawa/
├── apps/
│   └── web/              # Main user-facing website (Phase 1)
│   └── admin/            # Admin panel (Phase 2 - Coming Soon)
├── packages/
│   └── typescript-config/  # Shared TypeScript configurations
└── turbo.json            # Turborepo configuration
```

## 🎯 Features

### Phase 1 (Current)

**User Features**:
- ✅ **Beautiful Hero Section** with animated gradients and MagicUI-inspired components
- ✅ **Advanced Search Bar** with real-time autocomplete suggestions
- ✅ **Smart Search** powered by Fuse.js for fuzzy matching
- ✅ **Place Listings** with grid view and filtering
- ✅ **Detailed Place Pages** with complete information
- ✅ **Tag-Based Filtering** (cuisines, amenities, cravings)
- ✅ **Responsive Design** optimized for all devices

**Community Features**:
- ✅ **Community Contributions** - Add places via pull requests
- ✅ **Automated PR Validation** - Instant feedback on contributions
- ✅ **Zero Merge Conflicts** - Each place has its own file
- ✅ **Auto-Generated Index** - Optimized search performance
- ✅ **GitHub Actions CI/CD** - Automated build and deployment

### Phase 2 (Planned)
- 🔜 Supabase PostgreSQL integration
- 🔜 Image upload to Supabase Storage
- 🔜 Full-text search with PostgreSQL
- 🔜 User authentication
- 🔜 Admin panel for managing places
- 🔜 User reviews and ratings
- 🔜 Interactive map integration

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Search**: Fuse.js
- **Icons**: Lucide React

### Data & Validation
- **Validation**: Zod (JSON schema validation)
- **Build Tools**: tsx (TypeScript execution)
- **Data Format**: JSON (individual files + auto-generated index)

### CI/CD
- **Automation**: GitHub Actions
- **Deployment**: Vercel
- **Quality Gates**: Automated PR validation

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- pnpm 8+ (recommended: `npm install -g pnpm`)

### Installation

1. Install dependencies (installs for all workspaces):
```bash
pnpm install
```

2. Set up environment variables:
Create `apps/web/.env.local` file with your MagicUI Pro API key:
```bash
NEXT_PUBLIC_MAGICUI_API_KEY=your_api_key_here
```

3. Run the development server:
```bash
pnpm dev
```

This will start all apps in development mode using Turborepo.

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Useful Commands

```bash
# Development
pnpm dev              # Run dev servers for all apps
pnpm build            # Build all apps and packages
pnpm lint             # Run linting for all apps
pnpm type-check       # Type check all TypeScript

# Data Management
pnpm build:index      # Generate places.json from individual files
pnpm build:stats      # Generate stats.json from individual files
pnpm validate:places  # Validate all place files
pnpm validate:place <file>  # Validate a specific place file

# Maintenance
pnpm clean            # Clean all build artifacts and node_modules

# Package Management
pnpm add <package> --filter @whereinmaginhawa/web  # Install in specific workspace
pnpm add -Dw <package>                             # Install dev dependency in root
```

## 📁 Project Structure

```
whereinmaginhawa/
├── apps/
│   └── web/                    # Main website
│       ├── src/
│       │   ├── app/           # Next.js app directory
│       │   ├── components/    # React components
│       │   ├── data/          # JSON data (Phase 1)
│       │   ├── lib/           # Utility functions
│       │   └── types/         # TypeScript types
│       ├── public/            # Static assets
│       └── package.json
├── packages/
│   └── typescript-config/     # Shared TS configs
│       ├── base.json
│       └── nextjs.json
├── turbo.json                 # Turborepo config
└── package.json               # Root package.json
```

### Web App Structure (`apps/web/src/`)

```
src/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home page with hero
│   ├── layout.tsx         # Root layout
│   └── places/            # Places routes
├── components/            # React components
│   ├── hero/             # Hero section
│   ├── place/            # Place components
│   ├── search/           # Search components
│   └── ui/               # shadcn/ui components
├── data/                 # JSON data (Phase 1)
│   ├── places.json       # Auto-generated index (lightweight)
│   ├── stats.json        # Auto-generated statistics
│   └── places/           # Individual place files
│       ├── rodics-diner.json
│       ├── crazy-katsu.json
│       └── ...           # 200+ place files
├── lib/                  # Utility functions
│   └── places.ts
└── types/                # TypeScript types
    ├── place.ts          # Place types & DB schema
    └── tags.ts
```

## 🗄️ Database Schema (Phase 2)

The complete Supabase PostgreSQL schema is documented in `src/types/place.ts`, including:
- `places` table with full-text search support
- `tags` table for normalized tag management
- `place_tags` junction table
- Indexes for optimal search performance

## 🤝 Contributing

We welcome community contributions! Help us keep Where In Maginhawa up to date.

### Adding a New Place

1. **Fork the repository** on GitHub
2. **Create a new file**: `apps/web/src/data/places/your-place-slug.json`
3. **Use this template**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Your Restaurant Name",
  "slug": "your-restaurant-name",
  "description": "Brief description (minimum 10 characters)",
  "address": "Full address in Maginhawa",
  "operatingHours": {
    "monday": { "open": "10:00", "close": "22:00" }
  },
  "priceRange": "$$",
  "cuisineTypes": ["filipino"],
  "createdAt": "2025-11-09T00:00:00.000Z",
  "updatedAt": "2025-11-09T00:00:00.000Z"
}
```

4. **Generate a UUID** for the `id` field at [uuidgenerator.net](https://www.uuidgenerator.net/)
5. **Submit a pull request**

### Automated Validation

When you create a PR:
- ✅ GitHub Actions **automatically validates** your file
- ✅ Bot **comments on your PR** with validation results
- ✅ If errors found, fix them and push - **validation runs again**
- ✅ Once valid, maintainers will review and merge

**No need to edit `places.json` or `stats.json`** - they're auto-generated!

### Detailed Guide

See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Complete field reference
- UUID generators
- Validation rules
- Common errors and fixes
- Schema documentation

### Updating Existing Places

1. Find the file in `apps/web/src/data/places/`
2. Edit the JSON
3. Update the `updatedAt` timestamp
4. Submit a pull request

## 🚀 Deployment

### Automated CI/CD

This project uses **GitHub Actions** for automated deployment:

1. **PR Validation** (`.github/workflows/validate-pr.yml`)
   - Validates place files when PRs are created
   - Comments on PR with validation results
   - Blocks merge if validation fails

2. **Build and Deploy** (`.github/workflows/build-and-deploy.yml`)
   - Triggers when PRs are merged to `main`
   - Validates changed files
   - Builds `places.json` and `stats.json`
   - Commits built files back to repo
   - Triggers Vercel deployment via webhook

### Vercel Setup

1. **Disable automatic deployments** in Vercel (Settings → Git)
2. **Create a Deploy Hook** in Vercel (Settings → Git → Deploy Hooks)
3. **Add to GitHub Secrets** as `VERCEL_DEPLOY_HOOK`

### Manual Deployment

For local testing:

```bash
pnpm build:index    # Build places index
pnpm build:stats    # Build statistics
pnpm build          # Build all apps
```

Then deploy via the [Vercel Platform](https://vercel.com).

## 📊 Data Structure

### How It Works

```
Individual Files                Auto-Generated Files
─────────────────              ──────────────────────

places/
├── rodics-diner.json          ┌─→ places.json (index)
├── crazy-katsu.json    ───────┤   - Lightweight
├── friuli-trattoria.json      │   - Search optimized
└── ... (200+ files)           │   - 168KB vs 380KB
                               │
                               └─→ stats.json
                                   - Cuisine counts
                                   - Amenity stats
```

**Benefits**:
- ✅ **Zero merge conflicts** - each contributor edits their own file
- ✅ **Faster page loads** - 56% smaller index file
- ✅ **Better for Git** - meaningful diffs, easy to review
- ✅ **Scalable** - add 1000s of places without performance issues

## 👥 For Contributors

### Quick Start

Want to add a restaurant? It's easy:

1. **Fork this repo** on GitHub
2. **Create one file**: `apps/web/src/data/places/your-restaurant.json`
3. **Copy template** from [CONTRIBUTING.md](CONTRIBUTING.md)
4. **Get a UUID** at https://www.uuidgenerator.net/
5. **Submit PR** - our bot will validate it automatically!

### What Happens Next?

```
You create PR
    ↓
Bot validates your file (< 1 minute)
    ↓
Bot comments: ✅ "All good!" or ❌ "Fix these errors"
    ↓
If needed: Fix & push (validation runs again)
    ↓
Maintainer reviews
    ↓
Merged!
    ↓
GitHub Actions builds & deploys
    ↓
Your place is LIVE! 🎉
```

### Need Help?

- 📖 Read [CONTRIBUTING.md](CONTRIBUTING.md)
- 🔍 Look at existing files in `apps/web/src/data/places/`
- 💬 Ask questions in your PR
- 📧 Open an issue

---

Built with ❤️ for the Maginhawa community

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
