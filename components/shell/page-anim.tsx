"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { type ReactNode } from "react";

/**
 * Page-level entrance animation.
 *
 * Wraps a page's main content in a staggered fade + slide-in.
 * Each direct child marked with `<PageAnim.Item>` becomes a step in
 * the stagger. Honours `prefers-reduced-motion` by collapsing to a
 * static reveal — no movement, just opacity if at all.
 */
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
      when: "beforeChildren",
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.36, ease: [0.22, 0.61, 0.36, 1] },
  },
};

export function PageAnim({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      variants={reduceMotion ? undefined : containerVariants}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}

function PageAnimItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      variants={reduceMotion ? undefined : itemVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

PageAnim.Item = PageAnimItem;
