import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import { COPY } from '../i18n';
import type { Language } from '../types';

interface Loading3DProps {
  lang: Language;
  pitch: string;
}

export function Loading3D({ lang, pitch }: Loading3DProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const t = COPY[lang];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setStepIndex((prev) => (prev + 1) % t.loadingSteps.length);
    }, 2400);
    return () => window.clearInterval(interval);
  }, [t.loadingSteps.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-[calc(100vh-88px)] flex flex-col items-center justify-center px-4 py-12"
    >
      {/* 3D Perspective Stage */}
      <div
        className="relative w-72 h-64 sm:w-80 sm:h-72 flex items-center justify-center mb-8"
        style={{ perspective: '1200px' }}
      >
        {/* Tilted 3D Orbital Rings */}
        <motion.div
          aria-hidden="true"
          className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full border border-amber-400/35 pointer-events-none"
          style={{ transformStyle: 'preserve-3d' }}
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  rotateX: [68, 72, 68],
                  rotateY: [-14, 14, -14],
                  rotateZ: [0, 360],
                }
          }
          transition={{
            rotateZ: { duration: 14, repeat: Infinity, ease: 'linear' },
            rotateX: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
            rotateY: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-500/80 shadow-[0_0_12px_rgba(245,158,11,0.7)]" />
        </motion.div>

        <motion.div
          aria-hidden="true"
          className="absolute w-52 h-52 sm:w-60 sm:h-60 rounded-full border border-black/[0.08] pointer-events-none"
          style={{ transformStyle: 'preserve-3d' }}
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  rotateX: [-64, -58, -64],
                  rotateY: [18, -18, 18],
                  rotateZ: [360, 0],
                }
          }
          transition={{
            rotateZ: { duration: 18, repeat: Infinity, ease: 'linear' },
            rotateX: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
            rotateY: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#111111]/70" />
        </motion.div>

        {/* 3D Floating Card Stack */}
        <motion.div
          className="relative w-44 h-52 sm:w-48 sm:h-56"
          style={{ transformStyle: 'preserve-3d' }}
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  rotateY: [-16, 16, -16],
                  rotateX: [8, -6, 8],
                  y: [-5, 5, -5],
                }
          }
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* Back 3D Card (Malt layer) */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl bg-amber-50/80 border border-amber-300/40 shadow-sm backdrop-blur-sm"
            style={{
              transform: 'translateZ(-36px) translateX(-16px) translateY(8px) rotateZ(-6deg)',
            }}
          />

          {/* Middle 3D Card (Fiverr layer) */}
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 rounded-2xl bg-white/85 border border-black/[0.08] shadow-md backdrop-blur-sm"
            style={{
              transform: 'translateZ(-16px) translateX(14px) translateY(-6px) rotateZ(5deg)',
            }}
          />

          {/* Front Primary 3D Card */}
          <div
            className="relative w-full h-full rounded-2xl bg-white border border-black/[0.1] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.14)] p-4 flex flex-col justify-between overflow-hidden"
            style={{ transform: 'translateZ(18px)' }}
          >
            {/* Top card header */}
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-100 to-amber-200/70 border border-amber-300/40 flex items-center justify-center text-xs font-semibold text-amber-900 font-mono">
                10
              </div>
              <span className="text-[11px] font-mono text-neutral-400 tabular-nums">
                Fiverr · Malt
              </span>
            </div>

            {/* Abstract profile skeleton lines */}
            <div className="space-y-2.5 my-auto">
              <div className="h-2.5 w-3/4 rounded-full bg-neutral-900/10" />
              <div className="h-2 w-full rounded-full bg-neutral-900/[0.06]" />
              <div className="h-2 w-5/6 rounded-full bg-neutral-900/[0.06]" />
            </div>

            {/* Bottom card footer */}
            <div className="flex items-center justify-between pt-2 border-t border-black/[0.05]">
              <div className="h-2 w-12 rounded-full bg-amber-500/35" />
              <div className="h-2 w-8 rounded-full bg-neutral-900/15" />
            </div>

            {/* Smooth 3D Scanner Light Sweep (compositor-only transform) */}
            {!shouldReduceMotion && (
              <motion.div
                aria-hidden="true"
                className="absolute inset-x-0 h-14 bg-gradient-to-b from-transparent via-amber-300/25 to-transparent pointer-events-none"
                animate={{ y: [-60, 230] }}
                transition={{ duration: 2.1, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
          </div>
        </motion.div>
      </div>

      {/* Status Heading & Animated Step Crossfade */}
      <h2 className="text-lg sm:text-xl font-semibold text-[#111111] tracking-tight text-center">
        {t.loadingTitle}
      </h2>

      <div className="h-7 mt-2 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={stepIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="text-sm text-neutral-500 text-center"
          >
            {t.loadingSteps[stepIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Subtle Pitch Preview */}
      <p className="mt-6 max-w-md text-xs text-neutral-400 text-center line-clamp-2 px-4">
        « {pitch} »
      </p>
    </motion.div>
  );
}
