import React, { useRef } from 'react';
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
  const containerRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  // Track scroll progress of the nav leaving the top of the viewport.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 0.15', 'end start'],
  });

  // As the user scrolls, the whole menu tilts back and recedes in 3D.
  const rotateX = useTransform(scrollYProgress, [0, 1], [0, 55]);
  const translateZ = useTransform(scrollYProgress, [0, 1], [0, -220]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const translateY = useTransform(scrollYProgress, [0, 1], [0, -30]);

  if (reduceMotion) {
    return (
      <nav
        ref={containerRef}
        className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10 mb-12"
      >
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
      ref={containerRef}
      className="mt-10 mb-12"
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="flex flex-col sm:flex-row items-center justify-center gap-3"
        style={{
          rotateX,
          translateY,
          translateZ,
          opacity,
          transformStyle: 'preserve-3d',
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
              className={`group flex items-center gap-2 px-5 py-2.5 rounded-full glass transition-colors text-sm font-medium text-foreground ${item.glow} ${item.text}`}
              style={{ transformStyle: 'preserve-3d' }}
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
