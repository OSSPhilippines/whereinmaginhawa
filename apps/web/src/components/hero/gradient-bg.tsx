'use client';

import { motion } from 'framer-motion';

export function GradientBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Base warm gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#fdf6f0] via-[#fff8f3] to-white dark:from-[#1a1210] dark:via-[#161210] dark:to-[#111111]" />

      {/* Warm ambient glow - top right */}
      <motion.div
        className="absolute -top-32 -right-32 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-[#b32107]/12 via-[#d63c20]/8 to-transparent blur-[100px]"
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.6, 0.8, 0.6],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Forest green accent - bottom left */}
      <motion.div
        className="absolute -bottom-20 -left-20 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-[#006c4b]/10 via-[#006c4b]/5 to-transparent blur-[80px]"
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.4, 0.6, 0.4],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      />

      {/* Honey accent - center */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[300px] w-[600px] rounded-full bg-gradient-to-r from-[#765700]/6 via-[#b32107]/4 to-[#765700]/6 blur-[120px]"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />

      {/* Subtle noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px',
        }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  );
}
