"use client";

import { motion, type HTMLMotionProps } from "motion/react";

import { cardHoverTransition, cardReveal } from "@/lib/animations";

type AnimatedCardProps = HTMLMotionProps<"article">;

export function AnimatedCard({ children, ...props }: AnimatedCardProps) {
  return (
    <motion.article
      variants={cardReveal}
      whileHover={{ y: -4, transition: cardHoverTransition }}
      {...props}
    >
      {children}
    </motion.article>
  );
}
