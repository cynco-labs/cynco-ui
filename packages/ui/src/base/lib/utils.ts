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

export const getMetaKey = () =>
	navigator.userAgent.includes("Mac") ? "⌘" : "Ctrl";
