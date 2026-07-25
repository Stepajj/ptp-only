"use client";

import { motion, type HTMLMotionProps } from "motion/react";

import { buttonTransition } from "@/lib/animations";

type MotionButtonProps = HTMLMotionProps<"button">;

export function MotionButton({ children, ...props }: MotionButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={buttonTransition}
      {...props}
    >
      {children}
    </motion.button>
  );
}
