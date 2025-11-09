# Where In Maginhawa

Your ultimate guide to discovering the best restaurants, cafés, and food spots on Maginhawa Street, Quezon City, Philippines.

## 🎯 Features

### Phase 1 (Current)
- ✅ **Beautiful Hero Section** with animated gradients and MagicUI-inspired components
- ✅ **Advanced Search Bar** with real-time autocomplete suggestions
- ✅ **Smart Search** powered by Fuse.js for fuzzy matching
- ✅ **Place Listings** with grid view and filtering
- ✅ **Detailed Place Pages** with complete information
- ✅ **Tag-Based Filtering** (cuisines, amenities, cravings)
- ✅ **Responsive Design** optimized for all devices
- ✅ **Data Structure** ready for Supabase migration

### Phase 2 (Planned)
- 🔜 Supabase PostgreSQL integration
- 🔜 Image upload to Supabase Storage
- 🔜 Full-text search with PostgreSQL
- 🔜 User authentication
- 🔜 Admin panel for managing places
- 🔜 User reviews and ratings
- 🔜 Interactive map integration

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **Search**: Fuse.js
- **Icons**: Lucide React

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create `.env.local` file with your MagicUI Pro API key:
```bash
NEXT_PUBLIC_MAGICUI_API_KEY=your_api_key_here
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home page with hero
│   ├── layout.tsx         # Root layout
│   └── places/            # Places routes
│       ├── page.tsx       # Places listing
│       └── [slug]/        # Individual place pages
├── components/            # React components
│   ├── hero/             # Hero section components
│   ├── place/            # Place-related components
│   ├── search/           # Search components
│   └── ui/               # shadcn/ui components
├── data/                 # JSON data files
│   └── places.json       # Restaurant data (Phase 1)
├── lib/                  # Utility functions
│   ├── places.ts         # Place data operations
│   └── utils.ts          # General utilities
└── types/                # TypeScript type definitions
    ├── place.ts          # Place types & DB schema
    └── tags.ts           # Tag definitions
```

## 🗄️ Database Schema (Phase 2)

The complete Supabase PostgreSQL schema is documented in `src/types/place.ts`, including:
- `places` table with full-text search support
- `tags` table for normalized tag management
- `place_tags` junction table
- Indexes for optimal search performance

## 🎨 Customization

### Adding New Places

Edit `src/data/places.json`:

```json
{
  "id": "unique-id",
  "name": "Restaurant Name",
  "slug": "restaurant-name",
  "description": "Description...",
  "cuisineTypes": ["italian"],
  "amenities": ["wifi", "pet-friendly"]
}
```

### Customizing Tags

Edit `src/types/tags.ts` to add amenities, cuisines, or other tags.

## 🚀 Deployment

Deploy to Vercel:

```bash
npm run build
```

Then deploy via the [Vercel Platform](https://vercel.com).

---

Built with ❤️ for the Maginhawa community
