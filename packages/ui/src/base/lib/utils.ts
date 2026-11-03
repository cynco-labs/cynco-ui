import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Cynco UI's custom type classes are font sizes, not colours: register them so cn() never
 * drops a colour utility (or the size) when both are passed together.
 */
const twMerge = extendTailwindMerge({
	extend: {
		classGroups: {
			"font-size": [
				{ text: ["2xs", "md", "giga", "main", "main-sec", "sub", "sub-secondary", "body", "body-highlight", "body-secondary", "body-sec-paragraph", "tiny", "tiny-id", "checkbox-label", "checkbox-descr", "checkbox-disabled", "form-text", "form-label", "form-placeholder"] },
			],
		},
	},
});

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Cmd/ctrl is reserved for sheet-level submit shortcuts (e.g. cmd+enter via
 * ShortcutButton), so focused toggles must not handle keys with it held.
 */
export const hasSubmitShortcutModifier = (event: {
	metaKey: boolean;
	ctrlKey: boolean;
}) => event.metaKey || event.ctrlKey;

/** Apple platforms use ⌘ where others use Ctrl. For event handlers; in render use `useIsMac`. */
export const isMacPlatform = () => typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

export const getMetaKey = () => (isMacPlatform() ? "⌘" : "Ctrl");

/**
 * A date for display. "2026-10-30" and "2026-10" are calendar dates and read as local midnight: `new Date()` reads
 * them as UTC midnight, which shows the previous day west of UTC. Other strings are instants and parse as usual.
 */
export function parseDate(value: string | Date): Date {
	if (typeof value !== "string") return value;
	const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(value);
	return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3] ?? 1)) : new Date(value);
}

/** Today's calendar date in the user's time zone, as "2026-10-30" (toISOString would give the UTC date). */
export function todayISO(): string {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Write text to the clipboard. False when the browser refuses (permission denied, or not a secure origin). */
export async function copyToClipboard(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		return false;
	}
}
