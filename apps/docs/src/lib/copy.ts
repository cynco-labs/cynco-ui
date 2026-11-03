/** Copies text, falling back to a hidden textarea where the Clipboard API is blocked (permissions, http). */
export async function copyText(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		const focused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		const area = document.createElement("textarea");
		area.value = text;
		area.readOnly = true;
		area.style.cssText = "position:fixed;opacity:0;pointer-events:none";
		document.body.append(area);
		area.select();
		const ok = document.execCommand("copy");
		area.remove();
		focused?.focus({ preventScroll: true });
		return ok;
	}
}

const timers = new WeakMap<Element, ReturnType<typeof setTimeout>>();
const originals = new WeakMap<Element, string>();

/** Copies `text` and says so on `label` for a moment, then restores it (repeat clicks restore the original). */
export async function copyWithFeedback(label: Element, text: string, done = "Copied", ms = 1500) {
	if (!originals.has(label)) originals.set(label, label.textContent ?? "");
	const ok = await copyText(text);
	label.textContent = ok ? done : "Couldn't copy";
	clearTimeout(timers.get(label));
	timers.set(label, setTimeout(() => (label.textContent = originals.get(label) ?? ""), ms));
}
