"use client";

import { motion, type HTMLMotionProps } from "motion/react";

import { sectionReveal, viewport } from "@/lib/animations";

type SectionElement = "section" | "div" | "footer" | "header";

type AnimatedSectionProps = HTMLMotionProps<"div"> & {
  as?: SectionElement;
};

export function AnimatedSection({
  as = "div",
  children,
  ...props
}: AnimatedSectionProps) {
  const Component = motion[as];

  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={sectionReveal}
      {...props}
    >
      {children}
    </Component>
  );
}
