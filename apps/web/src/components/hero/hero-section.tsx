'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MapPin, ArrowRight, Store, UtensilsCrossed, Sparkles } from 'lucide-react';
import { GradientBackground } from './gradient-bg';
import { NumberTicker } from '../ui/number-ticker';
import { SearchBar } from '../search/search-bar';

interface HeroSectionProps {
  stats?: { totalPlaces: number; uniqueCuisines: number; uniqueAmenities: number };
}

const popularTags = [
  'Coffee', 'Pizza', 'Ramen', 'Filipino', 'Pet Friendly',
  'WiFi', 'Delivery', 'Late-night', 'Desserts',
];

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

export function HeroSection({ stats = { totalPlaces: 0, uniqueCuisines: 0, uniqueAmenities: 0 } }: HeroSectionProps) {
  const router = useRouter();

  const statItems = [
    {
      value: stats.totalPlaces,
      label: 'Places',
      suffix: '+',
      delay: 1.0,
      icon: Store,
      color: 'from-primary to-[#d63c20]',
      glowColor: 'bg-primary/8',
    },
    {
      value: stats.uniqueCuisines,
      label: 'Cuisines',
      suffix: '+',
      delay: 1.1,
      icon: UtensilsCrossed,
      color: 'from-[#006c4b] to-[#00a676]',
      glowColor: 'bg-[#006c4b]/8',
    },
    {
      value: stats.uniqueAmenities,
      label: 'Amenities',
      suffix: '+',
      delay: 1.2,
      icon: Sparkles,
      color: 'from-[#765700] to-[#b8860b]',
      glowColor: 'bg-[#765700]/8',
    },
  ];

  return (
    <section className="relative flex items-center justify-center overflow-hidden min-h-[88vh]">
      <GradientBackground />

      <div className="container mx-auto px-4 py-20 md:py-28 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* Location badge */}
          <motion.div variants={fadeUp} className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/[0.06] border border-primary/10 text-sm font-medium text-primary dark:bg-primary/10 dark:border-primary/20">
              <MapPin className="w-3.5 h-3.5" />
              <span>Maginhawa St. &middot; Teacher&rsquo;s Village &middot; Quezon City</span>
            </div>
          </motion.div>

          {/* Heading */}
          <motion.div variants={fadeUp} className="text-center mb-6">
            <h1 className="text-[clamp(2.5rem,8vw,5.5rem)] font-extrabold leading-[0.92] tracking-[-0.03em] text-foreground">
              Discover where to
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-primary via-[#d63c20] to-[#e05a3a] bg-clip-text text-transparent">
                  eat next.
                </span>
                <motion.svg
                  className="absolute -bottom-1 left-0 w-full"
                  viewBox="0 0 286 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                  <motion.path
                    d="M2 8.5C47.3 3.5 143.8 -1.5 284 8.5"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="text-primary/30"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.8, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  />
                </motion.svg>
              </span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            className="text-center text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10"
          >
            Your guide to {stats.totalPlaces}+ restaurants, cafes, and hidden gems
            along the most delicious street in QC.
          </motion.p>

          {/* Search */}
          <motion.div
            variants={fadeUp}
            className="max-w-2xl mx-auto mb-10"
            role="search"
            aria-label="Search for restaurants and cafes"
          >
            <SearchBar />
          </motion.div>

          {/* Popular tags */}
          <motion.nav
            variants={fadeUp}
            className="flex flex-wrap gap-2 justify-center items-center mb-16"
            aria-label="Popular search tags"
          >
            <span className="text-[11px] font-semibold text-muted-foreground/50 uppercase tracking-[0.15em] mr-2">
              Popular
            </span>
            {popularTags.map((tag, i) => (
              <motion.button
                key={tag}
                onClick={() => router.push(`/places?q=${encodeURIComponent(tag)}`)}
                className="group relative px-4 py-1.5 text-[13px] font-medium rounded-full border border-border/50 bg-card/50 backdrop-blur-sm text-muted-foreground overflow-hidden transition-colors duration-300 cursor-pointer hover:border-primary/40 hover:text-primary"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.04, duration: 0.35 }}
                aria-label={`Search for ${tag}`}
              >
                {/* Hover fill background */}
                <span className="absolute inset-0 bg-primary/[0.04] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out" />
                <span className="relative flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-current opacity-40 group-hover:opacity-100 group-hover:bg-primary transition-all duration-300 group-hover:scale-125" />
                  {tag}
                </span>
              </motion.button>
            ))}
          </motion.nav>

          {/* Stats */}
          <motion.div
            variants={fadeUp}
            className="flex justify-center"
            role="region"
            aria-label="Site statistics"
          >
            <div className="grid grid-cols-3 gap-3 md:gap-4 w-full max-w-lg">
              {statItems.map((stat) => {
                const Icon = stat.icon;
                return (
                  <motion.article
                    key={stat.label}
                    className="group relative text-center px-4 py-5 md:py-6 rounded-2xl border border-border/30 bg-card/30 backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-border/60 hover:bg-card/50"
                    whileHover={{ y: -2 }}
                  >
                    {/* Ambient glow on hover */}
                    <div className={`absolute inset-0 ${stat.glowColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />

                    <div className="relative">
                      {/* Icon */}
                      <div className="flex justify-center mb-3">
                        <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-muted/80 transition-colors duration-300">
                          <Icon className="w-4 h-4 text-muted-foreground/60 group-hover:text-foreground/80 transition-colors duration-300" />
                        </div>
                      </div>

                      {/* Number */}
                      <p className={`text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-b ${stat.color} bg-clip-text text-transparent`}>
                        <NumberTicker value={stat.value} delay={stat.delay} className={`bg-gradient-to-b ${stat.color} bg-clip-text !text-transparent`} />
                        <motion.span
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: stat.delay + 0.8, duration: 0.4 }}
                          className="text-2xl md:text-3xl"
                        >
                          {stat.suffix}
                        </motion.span>
                      </p>

                      {/* Label */}
                      <p className="text-[11px] font-semibold text-muted-foreground/60 mt-1.5 uppercase tracking-[0.12em]">
                        {stat.label}
                      </p>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </motion.div>

          {/* Browse CTA */}
          <motion.div
            variants={fadeIn}
            className="flex justify-center mt-8"
          >
            <button
              onClick={() => router.push('/places')}
              className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground/70 hover:text-primary transition-colors duration-200"
            >
              or browse all places
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
