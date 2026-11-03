"use client";

import { AnimatePresence, motion } from "motion/react";
import { createPortal } from "react-dom";
import { useIsClient } from "../../hooks/use-platform";

const SHEET_BACKDROP_Z_INDEX = 40;

interface SheetBackdropProps {
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
}: SheetBackdropProps) {
	if (!useIsClient()) return null;
	return createPortal(
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 bg-overlay-veil"
					style={{ zIndex }}
					onMouseDown={onClose}
				/>
			)}
		</AnimatePresence>,
		document.body,
	);
}
