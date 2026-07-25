"use client";

import { motion, type HTMLMotionProps } from "motion/react";

import {
  fadeUp,
  staggerContainer,
  staggerSection,
  viewport,
} from "@/lib/animations";

type StaggerElement = "section" | "div" | "footer";

type StaggerContainerProps = HTMLMotionProps<"div"> & {
  as?: StaggerElement;
  variant?: "section" | "group";
};

export function StaggerContainer({
  as = "div",
  children,
  variant = "section",
  ...props
}: StaggerContainerProps) {
  const Component = motion[as];

  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={variant === "section" ? staggerSection : staggerContainer}
      {...props}
    >
      {children}
    </Component>
  );
}

export function StaggerItem({
  children,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={fadeUp} {...props}>
      {children}
    </motion.div>
  );
}

export function StaggerGroup({
  children,
  ...props
}: HTMLMotionProps<"div">) {
  return (
    <motion.div variants={staggerContainer} {...props}>
      {children}
    </motion.div>
  );
}
