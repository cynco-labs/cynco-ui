/**
 * Cynco UI — keyboard helpers shared by the layout primitives and the productivity components.
 *
 * One definition each, so a shortcut behaves the same wherever it is bound: the same idea of which
 * platform uses ⌘, and the same idea of "the user is typing, leave the key alone".
 */

/** `navigator.userAgentData` is not in TypeScript's DOM lib yet; only its `platform` is read here. */
type NavigatorWithUAData = Navigator & { userAgentData?: { platform?: string } };

/**
 * True on platforms whose shortcut modifier is ⌘. Reads `navigator.userAgentData.platform` first and
 * falls back to the deprecated `navigator.platform`, which Chrome still serves but no longer updates.
 */
export function isMac(): boolean {
	if (typeof navigator === "undefined") return false;
	const ua = (navigator as NavigatorWithUAData).userAgentData?.platform;
	return /Mac|iPhone|iPad/.test(ua || navigator.platform || navigator.userAgent);
}

/** True when the event holds the platform's shortcut modifier: ⌘ on Mac, Ctrl elsewhere. */
export const hasModKey = (e: { metaKey: boolean; ctrlKey: boolean }): boolean => (isMac() ? e.metaKey : e.ctrlKey);

/**
 * Matches a combo such as "esc", "mod+z" or "mod+shift+e" against a key event; `mod` is ⌘ on Mac and
 * Ctrl elsewhere. Every named modifier must be held and every unnamed one must not be, so "mod+z"
 * does not fire on ⌘⇧Z.
 */
export function matchesCombo(e: KeyboardEvent, combo: string): boolean {
	const parts = combo.toLowerCase().split("+");
	let key = parts.pop() as string;
	if (key === "esc") key = "escape";
	return (
		e.key.toLowerCase() === key &&
		hasModKey(e) === parts.includes("mod") &&
		e.altKey === parts.includes("alt") &&
		e.shiftKey === parts.includes("shift")
	);
}

/** True when the event holds no modifier at all, so the key means only itself. */
export const hasNoModifiers = (e: {
	metaKey: boolean;
	ctrlKey: boolean;
	altKey: boolean;
	shiftKey: boolean;
}): boolean => !e.metaKey && !e.ctrlKey && !e.altKey && !e.shiftKey;

/** Input types that take no text, so a bare-letter shortcut over them is not someone typing. */
const NON_TEXT_INPUTS = new Set(["checkbox", "radio", "button", "submit", "reset", "range", "color", "file"]);

/**
 * True when a key event comes from somewhere the user is typing text, so a bare-letter shortcut must
 * stand down. A checkbox, radio, button or other non-text input is not typing: single keys stay live
 * over a row of tick boxes, which is where bulk actions are used.
 */
export function isTypingTarget(target: EventTarget | null): boolean {
	const el = target as HTMLElement | null;
	if (!el?.tagName) return false;
	if (el.isContentEditable || el.tagName === "TEXTAREA" || el.tagName === "SELECT") return true;
	if (el.tagName !== "INPUT") return false;
	return !NON_TEXT_INPUTS.has((el as HTMLInputElement).type);
}
