"use client";

import { PrinterIcon } from "@phosphor-icons/react";
import * as React from "react";
import { Button, cn, toAriaKeyShortcuts } from "../../base";
import { useIsMac } from "../../base/hooks/use-platform";
import { Kbd, useHotkey } from "../../lib/shared";

/**
 * Page setup and print isolation, mounted with the button rather than from one shared stylesheet:
 * the rules only worked before when an UndoToastViewport happened to be on the page too.
 *
 * `data-cy-print-root` is the consumer's contract: put it on the element that should be the printed
 * page and everything else on screen is hidden for the print.
 */
const PRINT_CSS = `
@page { size: A4; margin: 16mm; @bottom-right { content: "Page " counter(page) " of " counter(pages); font: 8pt system-ui, sans-serif; color: var(--doc-ink-subtle); } }
@media print {
	html, body { background: var(--doc-paper) !important; color-scheme: light !important; }
	body:has([data-cy-print-root]) * { visibility: hidden; }
	html body [data-cy-print-root], html body [data-cy-print-root] * { visibility: visible; }
	html body [data-cy-print-root] { position: absolute; left: 0; top: 0; width: 100%; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
}`;
function PrintStyles() {
	return <style data-cy-print-css="">{PRINT_CSS}</style>;
}

export type PrintButtonProps = Omit<React.ComponentProps<typeof Button>, "onClick"> & {
	/** Replace window.print() — e.g. download a server-rendered PDF. */
	onPrint?: () => void;
	/** Handle ⌘/Ctrl+P on this page. Default: only when `onPrint` is given (otherwise the browser's own print already uses the print layout). */
	bindShortcut?: boolean;
	/** Show the ⌘/Ctrl+P keycap. Default true. */
	showShortcut?: boolean;
};

/** "Print" with a ⌘/Ctrl+P keycap; calls window.print() unless `onPrint` is given. Hidden in print. */
export function PrintButton({
	onPrint,
	bindShortcut,
	showShortcut = true,
	variant = "secondary",
	className,
	children,
	...props
}: PrintButtonProps) {
	const mac = useIsMac();
	const print = React.useCallback(() => {
		if (onPrint) onPrint();
		else if (typeof window !== "undefined") window.print();
	}, [onPrint]);
	useHotkey("mod+p", print, { enabled: bindShortcut ?? !!onPrint });
	return (
		<>
			<PrintStyles />
			<Button
				variant={variant}
				onClick={print}
				aria-keyshortcuts={toAriaKeyShortcuts("mod+p", mac)}
				className={cn("gap-1.5 print:hidden", className)}
				{...props}
			>
				<PrinterIcon size={14} aria-hidden="true" />
				{children ?? "Print"}
				{showShortcut && <Kbd keys="mod+p" aria-hidden="true" />}
			</Button>
		</>
	);
}
