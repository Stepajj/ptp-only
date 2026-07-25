import type { Transition, Variants } from "motion/react";

export const viewport = {
  once: true,
  amount: 0.2,
} as const;

export const sectionTransition: Transition = {
  duration: 0.7,
  ease: "easeOut",
};

export const buttonTransition: Transition = {
  duration: 0.2,
  ease: "easeOut",
};

export const cardHoverTransition: Transition = {
  duration: 0.2,
  ease: "easeOut",
};

export const faqTransition: Transition = {
  duration: 0.35,
  ease: "easeOut",
};

export const staggerDelay = 0.1;

export const heroImageDelay = 5 * staggerDelay + 0.3;

export function fadeUpInView(delay = 0) {
  return {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport,
    transition: { ...sectionTransition, delay },
  } as const;
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: sectionTransition,
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: sectionTransition,
  },
};

export const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: sectionTransition,
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerDelay,
    },
  },
};

export const staggerSection: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
      staggerChildren: staggerDelay,
    },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: sectionTransition,
  },
};

export const cardReveal: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: sectionTransition,
  },
};

export const heroImageReveal: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
      delay: 0.3,
    },
  },
};
