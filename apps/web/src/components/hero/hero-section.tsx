'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Plus, Edit3 } from 'lucide-react';
import { GradientBackground } from './gradient-bg';
import { SparklesText } from '../ui/sparkles-text';
import { WordRotate } from '../ui/word-rotate';
import { NumberTicker } from '../ui/number-ticker';
import { SearchBar } from '../search/search-bar';
import { Button } from '../ui/button';
import stats from '@/data/stats.json';

export function HeroSection() {
  const router = useRouter();
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-white to-gray-50/50">
      <GradientBackground />

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight flex items-center justify-center gap-4">
              <WordRotate
                words={['Discover', 'Explore', 'Survey', 'Scout', 'Uncover', 'Search']}
                className="text-5xl md:text-7xl font-bold text-gray-900"
                duration={2500}
              />
              <SparklesText
                colors={{ first: '#FB8500', second: '#DC2626' }}
                className="inline-block text-5xl md:text-7xl"
                sparklesCount={8}
              >
                Maginhawa
              </SparklesText>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Your ultimate guide to the best restaurants, cafés, and food spots on Maginhawa Street and nearby areas in Teacher's Village
            </motion.p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="w-full"
            role="search"
            aria-label="Search for restaurants and cafés"
          >
            <SearchBar />
          </motion.div>

          {/* Popular Tags */}
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="flex flex-wrap gap-2 justify-center items-center"
            aria-label="Popular search tags"
          >
            <span className="text-sm text-gray-500" aria-hidden="true">Popular:</span>
            {[
              'Coffee',
              'Pizza',
              'Ramen',
              'Pet Friendly',
              'WiFi',
              'Delivery',
              'Takeout',
              'Dine-in',
              'Reservations',
              'Kids-friendly',
              'Live-music',
              'Late-night',
              '24-hours',
            ].map((tag) => (
              <motion.button
                key={tag}
                onClick={() => router.push(`/places?q=${encodeURIComponent(tag)}`)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-1.5 text-sm rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all duration-200 cursor-pointer"
                aria-label={`Search for ${tag}`}
              >
                {tag}
              </motion.button>
            ))}
          </motion.nav>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8"
            role="region"
            aria-label="Site statistics"
          >
            <article className="space-y-2">
              <p className="text-5xl md:text-6xl font-bold text-primary" aria-label={`${stats.totalPlaces} places`}>
                <NumberTicker value={stats.totalPlaces} delay={1.6} className="text-primary" />
              </p>
              <p className="text-base md:text-lg font-medium text-gray-600">Places</p>
            </article>
            <article className="space-y-2">
              <p className="text-5xl md:text-6xl font-bold text-primary" aria-label={`${stats.uniqueCuisines} cuisines`}>
                <NumberTicker value={stats.uniqueCuisines} delay={1.7} className="text-primary" />
              </p>
              <p className="text-base md:text-lg font-medium text-gray-600">Cuisines</p>
            </article>
            <article className="space-y-2">
              <p className="text-5xl md:text-6xl font-bold text-primary" aria-label={`${stats.uniqueAmenities} amenities`}>
                <NumberTicker value={stats.uniqueAmenities} delay={1.8} className="text-primary" />
              </p>
              <p className="text-base md:text-lg font-medium text-gray-600">Amenities</p>
            </article>
          </motion.div>

          {/* Contribute Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.6 }}
            className="flex flex-wrap gap-4 justify-center pt-8"
          >
            <Button
              variant="outline"
              size="lg"
              asChild
              className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <a
                href="https://forms.gle/XxUuNUtXYJDsucQv6"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Plus className="w-5 h-5" />
                Add a New Place
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="gap-2"
            >
              <a
                href="https://forms.gle/pu9VjrG7JNkYmm9K9"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Edit3 className="w-5 h-5" />
                Report an Issue
              </a>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
