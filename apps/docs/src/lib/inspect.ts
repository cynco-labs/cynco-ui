/**
 * Inspect mode for a demo iframe: hovering an element outlines its box, shades its padding and labels it
 * with size, padding, radius and type, so the 28px controls and 13px type can be checked by eye.
 * Started by the component page's Inspect toggle (message `cynco-demo-inspect`).
 */
export interface DemoInspectMessage {
	type: "cynco-demo-inspect";
	on: boolean;
}

const px = (v: string) => Math.round(parseFloat(v) * 10) / 10;

function describe(el: Element, cs: CSSStyleDeclaration, rect: DOMRect): string {
	const tag = el.tagName.toLowerCase();
	const pad = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map(px);
	const padText = pad.every((p) => p === pad[0]) ? `${pad[0]}` : pad[0] === pad[2] && pad[1] === pad[3] ? `${pad[0]} ${pad[1]}` : pad.join(" ");
	const parts = [`${tag} ${px(String(rect.width))} × ${px(String(rect.height))}`];
	if (pad.some(Boolean)) parts.push(`pad ${padText}`);
	if (px(cs.borderTopLeftRadius)) parts.push(`radius ${px(cs.borderTopLeftRadius)}`);
	const hasText = [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim());
	if (hasText) parts.push(`${px(cs.fontSize)}/${px(cs.lineHeight) || "normal"} · ${cs.fontWeight}`);
	return parts.join(" · ");
}

export function startInspect(): () => void {
	const layer = document.createElement("div");
	layer.setAttribute("aria-hidden", "true");
	layer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483647;";
	const box = document.createElement("div");
	box.style.cssText =
		"position:fixed;box-sizing:border-box;border-style:solid;border-color:color-mix(in srgb,var(--primary) 18%,transparent);outline:1px solid var(--primary);display:none;";
	const tag = document.createElement("div");
	tag.style.cssText =
		"position:fixed;display:none;padding:2px 6px;border-radius:4px;background:var(--foreground);color:var(--background);font:500 11px/16px var(--font-mono,ui-monospace,monospace);white-space:nowrap;";
	layer.append(box, tag);
	document.body.append(layer);

	const show = (e: PointerEvent) => {
		const el = e.target instanceof Element ? e.target : null;
		if (!el || el === document.documentElement || el === document.body || el.id === "demo-root") {
			box.style.display = tag.style.display = "none";
			return;
		}
		const rect = el.getBoundingClientRect();
		const cs = getComputedStyle(el);
		Object.assign(box.style, {
			display: "block",
			left: `${rect.left}px`,
			top: `${rect.top}px`,
			width: `${rect.width}px`,
			height: `${rect.height}px`,
			borderWidth: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
		});
		tag.textContent = describe(el, cs, rect);
		tag.style.display = "block";
		const above = rect.top - 22;
		tag.style.top = `${above >= 2 ? above : rect.bottom + 4}px`;
		tag.style.left = `${Math.max(2, Math.min(rect.left, innerWidth - tag.offsetWidth - 2))}px`;
	};
	const hide = () => {
		box.style.display = tag.style.display = "none";
	};
	document.addEventListener("pointermove", show, true);
	document.documentElement.addEventListener("pointerleave", hide);
	addEventListener("scroll", hide, true);
	return () => {
		document.removeEventListener("pointermove", show, true);
		document.documentElement.removeEventListener("pointerleave", hide);
		removeEventListener("scroll", hide, true);
		layer.remove();
	};
}
