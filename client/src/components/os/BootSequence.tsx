import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BootSequenceProps {
  onComplete: () => void;
  variant?: 'default' | 'mew';
}

const mewAsciiArt = [
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣠⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⢀⣴⣾⣿⡟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⢀⣴⠿⢟⣛⣩⣤⣶⣶⣶⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⢀⣴⣿⠿⠸⣿⣿⣿⣿⣿⣿⡿⢿⣿⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀",
  "⠀⢠⠞⠉⠀⠀⠀⣿⠋⠻⣿⣿⣿⠀⣦⣿⠏⠀⠀⠀⢀⣀⣀⣀⣀⣀⠀⠀",
  "⢠⠏⠀⠀⠀⠀⠀⠻⣤⣷⣿⣿⣿⣶⢟⣁⣒⣒⡋⠉⠉⠁⠀⠀⠀⠈⠉⡧",
  "⢻⡀⠀⠀⠀⠀⠀⣀⡤⠌⢙⣛⣛⣵⣿⣿⡛⠛⠿⠃⠀⠀⠀⠀⠀⢀⡜⠁",
  "⠀⠉⠙⠒⠒⠛⠉⠁⠀⠸⠛⠉⠉⣿⣿⣿⣿⣦⣄⠀⠀⠀⢀⣠⠞⠁⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣿⣿⣿⡿⣿⣿⣷⡄⠞⠋⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⣿⣷⡻⣿⣿⣧⠀⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢨⣑⡙⠻⠿⠿⠈⠙⣿⣧⠀⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠸⣿⣷⡀⠀⠀⠀⠀⢹⣿⣆⠀⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢻⣿⡇⠀⠀⠀⠀⠸⣿⣿⡄⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠁⠀⠀⠀⠀⠀⡿⣿⣿⠀⠀⠀⠀",
  "⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⠀⠀⠀⠀⠀",
];

export function BootSequence({ onComplete, variant = 'default' }: BootSequenceProps) {
  const [phase, setPhase] = useState<'intro' | 'fadeout'>('intro');
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (variant === 'mew') {
      // Mew easter egg: show for 4 seconds then complete
      const timer = setTimeout(() => {
        onComplete();
      }, 4000);
      return () => clearTimeout(timer);
    }

    // Animate loading bar progress
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        // Progress faster initially, then slow down (more realistic loading feel)
        const increment = prev < 60 ? 8 : prev < 90 ? 3 : 1;
        return Math.min(prev + increment, 100);
      });
    }, 80);

    // Default PSP-style cinematic intro
    const fadeOutTimer = setTimeout(() => {
      setPhase('fadeout');
    }, 2200);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, variant]);

  if (variant === 'mew') {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed inset-0 bg-[#2d3436] z-[99999] flex flex-col items-center justify-center font-mono"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative"
        >
          <pre className="text-pink-300 text-[8px] sm:text-[10px] leading-[1] select-none drop-shadow-[0_0_20px_rgba(236,72,153,0.5)]">
            {mewAsciiArt.join('\n')}
          </pre>
          <div className="absolute inset-0 bg-pink-500/10 blur-[80px] rounded-full -z-10" />
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.5 }}
          className="mt-8 text-pink-400 text-lg font-light tracking-[0.3em] uppercase"
        >
          Mew Found You
        </motion.p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 1, backgroundColor: '#000000' }}
      animate={{
        opacity: phase === 'fadeout' ? 0 : 1,
        backgroundColor: '#000000'
      }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="fixed inset-0 bg-black z-[99999] flex items-center justify-center"
    >
      <AnimatePresence>
        {phase === 'intro' && (
          <motion.div
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: 0.7, scale: 1 }}
            exit={{ opacity: 0, scale: 1 }}
            transition={{
              duration: 2,
              ease: "easeInOut"
            }}
            className="relative flex flex-col items-center"
          >
            <h1 className="text-white/70 text-5xl sm:text-7xl font-light tracking-[0.4em] uppercase select-none">
              bhach
            </h1>

            {/* Brighter glow - 10% more intense */}
            <div className="absolute inset-0 bg-white/[0.04] blur-[60px] rounded-full -z-10" />

            {/* Underline animation - 10% brighter */}
            <motion.div
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 0.35 }}
              transition={{ duration: 2, delay: 0.8, ease: "easeInOut" }}
              className="absolute -bottom-4 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent origin-center"
            />

            {/* Loading bar */}
            <div className="mt-12 w-64 sm:w-80 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${loadingProgress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-full relative"
              >
                {/* Main bar with gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-300 to-blue-400" />

                {/* Bright glow when loading is complete */}
                {loadingProgress === 100 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 bg-blue-300 shadow-[0_0_20px_rgba(147,197,253,0.8)]"
                  />
                )}

                {/* Always-on subtle glow */}
                <div className="absolute inset-0 shadow-[0_0_10px_rgba(96,165,250,0.6)]" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}