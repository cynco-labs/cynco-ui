import { Background, ReactFlow, type ReactFlowProps } from "@xyflow/react";
import { type ReactNode, useSyncExternalStore } from "react";
import "@xyflow/react/dist/style.css";

type CanvasProps = ReactFlowProps & {
	children?: ReactNode;
};

type ColorMode = "light" | "dark";

/** React Flow's own colours (edges, controls, default nodes) follow the page theme on <html>. */
const readColorMode = (): ColorMode => {
	const root = document.documentElement;
	return root.classList.contains("dark") || (root.dataset.theme ?? "").endsWith("dark") ? "dark" : "light";
};

/** One observer on <html> for every canvas on the page, created with the first and dropped with the last. */
const colorModeListeners = new Set<() => void>();
let colorModeObserver: MutationObserver | null = null;
function subscribeColorMode(onChange: () => void) {
	colorModeListeners.add(onChange);
	if (!colorModeObserver) {
		colorModeObserver = new MutationObserver(() => {
			for (const l of colorModeListeners) l();
		});
		colorModeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-theme"] });
	}
	return () => {
		colorModeListeners.delete(onChange);
		if (colorModeListeners.size === 0) {
			colorModeObserver?.disconnect();
			colorModeObserver = null;
		}
	};
}

export const Canvas = ({ children, className, ...props }: CanvasProps) => {
	// Node focus ring and attribution styling live in theme.css (they must beat React Flow's unlayered CSS).
	const colorMode = useSyncExternalStore(subscribeColorMode, readColorMode, () => "light" as const);
	return (
	<ReactFlow
		colorMode={colorMode}
		className={className}
		deleteKeyCode={["Backspace", "Delete"]}
		fitView
		panOnDrag={false}
		panOnScroll
		selectionOnDrag={true}
		zoomOnDoubleClick={false}
		{...props}
	>
		<Background bgColor="var(--sidebar)" />
		{children}
	</ReactFlow>
	);
};
