"use client";

import { motion, useReducedMotion } from "motion/react";
import { useIsClient } from "../../hooks/use-platform";

export const MotionTbody = motion.create("tbody");

export const TABLE_FADE_IN = {
	initial: { opacity: 0 },
	animate: { opacity: 1 },
} as const;

export const TABLE_TRANSITION = {
	duration: 0.12,
	ease: [0.23, 1, 0.32, 1],
} as const;

/**
 * Fade-in props for `MotionTbody`. Renders in place when the user asks for reduced motion, and for
 * server-rendered rows, which would otherwise stay hidden until hydration.
 */
export function useTableFadeIn() {
	const reduceMotion = useReducedMotion();
	const isClient = useIsClient();
	return {
		initial: reduceMotion || !isClient ? false : TABLE_FADE_IN.initial,
		animate: TABLE_FADE_IN.animate,
		transition: TABLE_TRANSITION,
	} as const;
}
