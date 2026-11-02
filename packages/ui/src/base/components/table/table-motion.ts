import { motion, useReducedMotion } from "motion/react";

export const MotionTbody = motion.create("tbody");

export const TABLE_FADE_IN = {
	initial: { opacity: 0 },
	animate: { opacity: 1 },
} as const;

export const TABLE_TRANSITION = {
	duration: 0.12,
	ease: [0.23, 1, 0.32, 1],
} as const;

/** Fade-in props for `MotionTbody`; renders in place when the user asks for reduced motion. */
export function useTableFadeIn() {
	const reduceMotion = useReducedMotion();
	return {
		initial: reduceMotion ? false : TABLE_FADE_IN.initial,
		animate: TABLE_FADE_IN.animate,
		transition: TABLE_TRANSITION,
	} as const;
}
