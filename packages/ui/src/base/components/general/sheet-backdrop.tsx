"use client";

import { AnimatePresence, motion } from "motion/react";
import type * as React from "react";
import { createPortal } from "react-dom";
import { useIsClient } from "../../hooks/use-platform";
import { cn } from "../../lib/utils";

const SHEET_BACKDROP_Z_INDEX = 40;

interface SheetBackdropProps extends Omit<React.ComponentProps<typeof motion.div>, "children"> {
	isOpen: boolean;
	onClose: () => void;
	zIndex?: number;
}

/**
 * Full-viewport dimming backdrop for inline sheets, portaled to the document body
 * so it covers everything behind the floating sheet panel uniformly.
 */
export function SheetBackdrop({
	isOpen,
	onClose,
	zIndex = SHEET_BACKDROP_Z_INDEX,
	className,
	style,
	...props
}: SheetBackdropProps) {
	if (!useIsClient()) return null;
	return createPortal(
		<AnimatePresence>
			{isOpen && (
				<motion.div
					data-slot="sheet-backdrop"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onMouseDown={onClose}
					{...props}
					className={cn("fixed inset-0 bg-overlay-veil", className)}
					style={{ zIndex, ...style }}
				/>
			)}
		</AnimatePresence>,
		document.body,
	);
}
