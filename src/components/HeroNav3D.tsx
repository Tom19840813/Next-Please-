import React from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'motion/react';
import { Trophy, Gamepad2, Shuffle, MessageCircle } from 'lucide-react';
import { lightTap } from '@/utils/haptics';

const NAV_ITEMS = [
  {
    href: '#hall-of-fame',
    label: 'Hall of Fame',
    icon: Trophy,
    glow: 'hover:neon-glow-yellow',
    text: 'hover:text-accent',
    badge: null as string | null,
  },
  {
    href: '#original-games',
    label: 'Original Games',
    icon: Gamepad2,
    glow: 'hover:neon-glow-cyan',
    text: 'hover:text-primary',
    badge: null,
  },
  {
    href: '#random-games',
    label: 'Random Games',
    icon: Shuffle,
    glow: 'hover:neon-glow-magenta',
    text: 'hover:text-secondary',
    badge: '∞',
  },
  {
    href: '#feedback',
    label: 'Feedback',
    icon: MessageCircle,
    glow: 'hover:neon-glow-cyan',
    text: 'hover:text-primary',
    badge: null,
  },
];

const HeroNav3D: React.FC = () => {
  const reduceMotion = useReducedMotion();

  // Drive tilt off window scroll so the effect spans a meaningful distance
  // (the nav itself is only ~50px tall, which made the previous target-based
  // useScroll compress the range to nothing).
  const { scrollY } = useScroll();

  // Idle: clear 3D tilt so the menu reads as a tilted arcade carousel before scroll.
  // Scrolling turns it into a receding perspective rail.
  const rotateX = useTransform(scrollY, [0, 650], [18, 66]);
  const rotateY = useTransform(scrollY, [0, 650], [-8, 10]);
  const translateZ = useTransform(scrollY, [0, 650], [60, -320]);
  const translateY = useTransform(scrollY, [0, 650], [0, -52]);
  const opacity = useTransform(scrollY, [0, 560], [1, 0]);

  if (reduceMotion) {
    return (
      <nav className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10 mb-12">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.href}
              href={item.href}
              onClick={lightTap}
              className={`group flex items-center gap-2 px-5 py-2.5 rounded-full glass transition-all text-sm font-medium text-foreground ${item.glow} ${item.text}`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
              {item.badge && (
                <span className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-full font-bold leading-none">
                  {item.badge}
                </span>
              )}
            </a>
          );
        })}
      </nav>
    );
  }

  return (
      <nav
        aria-label="Hero sections"
        className="relative mt-10 mb-12 mx-auto max-w-4xl"
      style={{
        perspective: '1200px',
        perspectiveOrigin: '50% 140%',
        transformStyle: 'preserve-3d',
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-4 top-1/2 h-10 -translate-y-1/2 rounded-full border border-primary/15 bg-primary/5 blur-sm"
        style={{ transform: 'translateZ(-80px) rotateX(68deg)', transformStyle: 'preserve-3d' }}
      />
      <motion.div
        className="relative flex flex-col sm:flex-row items-center justify-center gap-3"
        style={{
          rotateX,
          rotateY,
          y: translateY,
          z: translateZ,
          opacity,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {NAV_ITEMS.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.a
              key={item.href}
              href={item.href}
              onClick={lightTap}
              initial={{ opacity: 0, rotateX: -40, y: 20 }}
              animate={{ opacity: 1, rotateX: 0, y: 0 }}
              transition={{
                delay: 0.15 + idx * 0.1,
                type: 'spring',
                stiffness: 120,
                damping: 14,
              }}
              whileHover={{
                scale: 1.08,
                rotateX: 0,
                z: 40,
                transition: { type: 'spring', stiffness: 300, damping: 15 },
              }}
              whileTap={{ scale: 0.95 }}
              className={`group flex items-center gap-2 px-5 py-2.5 rounded-full glass transition-colors text-sm font-medium text-foreground shadow-lg shadow-primary/10 ${item.glow} ${item.text}`}
              style={{
                transformStyle: 'preserve-3d',
                transform: `translateZ(${idx % 2 === 0 ? 54 : 22}px) rotateY(${(idx - 1.5) * 6}deg)`,
              }}
            >
              <Icon className="h-4 w-4" />
              {item.label}
              {item.badge && (
                <span className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-full font-bold leading-none">
                  {item.badge}
                </span>
              )}
            </motion.a>
          );
        })}
      </motion.div>
    </nav>
  );
};

export default HeroNav3D;
