import type { Density, DocLocale } from "@cynco-labs/ui";
import { ACCENTS, DEFAULT_ACCENT, DEFAULT_RADIUS, RADII, RADIUS_ORDER, isAccent, isAccentPreset, themeCss, type Accent, type Radius } from "./theme";

/**
 * Site-wide settings that every demo on the site follows: the inline demos on the home page, and the
 * iframes on component pages (same origin, so they read the same localStorage and hear `storage` events).
 * Light and dark stay on the header toggle (`theme` in localStorage); these sit on top of it.
 */
export type Preset = "default" | "modern";

export interface SiteSettings {
	preset: Preset;
	accent: Accent;
	radius: Radius;
	density: Density;
	locale: DocLocale;
}

/** The settings drawn as a segmented control. The accent is a row of swatches (Settings.astro). */
type SegmentedKey = Exclude<keyof SiteSettings, "accent">;

interface Option<V extends string> {
	value: V;
	label: string;
}

interface SettingDef<K extends SegmentedKey> {
	key: K;
	label: string;
	/** Single key that cycles the value, shown beside the control. */
	shortcut: string;
	options: readonly Option<SiteSettings[K]>[];
}

const DEFS: { [K in SegmentedKey]: SettingDef<K> } = {
	preset: {
		key: "preset",
		label: "Theme",
		shortcut: "t",
		options: [
			{ value: "default", label: "Default" },
			{ value: "modern", label: "Modern" },
		],
	},
	radius: {
		key: "radius",
		label: "Radius",
		shortcut: "r",
		options: RADIUS_ORDER.map((value) => ({ value, label: RADII[value].label })),
	},
	density: {
		key: "density",
		label: "Density",
		shortcut: "d",
		options: [
			{ value: "compact", label: "Compact" },
			{ value: "default", label: "Default" },
			{ value: "comfortable", label: "Roomy" },
		],
	},
	locale: {
		key: "locale",
		label: "Documents",
		shortcut: "l",
		options: [
			{ value: "en", label: "EN" },
			{ value: "ms", label: "BM" },
			{ value: "en-ms", label: "EN + BM" },
		],
	},
};

/** In panel order. */
export const SETTINGS = [DEFS.preset, DEFS.radius, DEFS.density, DEFS.locale] as const;

export const ACCENT_SHORTCUT = "a";

export const DEFAULT_SETTINGS: SiteSettings = { preset: "default", accent: DEFAULT_ACCENT, radius: DEFAULT_RADIUS, density: "default", locale: "en" };

export const SETTINGS_KEY = "cynco-docs-settings";
/** The theme CSS from the last write, so the boot script paints it before any module loads. */
const THEME_CSS_KEY = "cynco-docs-theme-css";
export const SETTINGS_EVENT = "site-settings";
/** The <style> the boot script fills (SettingsBoot.astro). */
export const THEME_STYLE_ID = "cy-site-theme";

function pick<K extends SegmentedKey>(def: SettingDef<K>, value: unknown): SiteSettings[K] {
	const match = def.options.find((o) => o.value === value);
	return match ? match.value : DEFAULT_SETTINGS[def.key];
}

export function parseSettings(raw: string | null): SiteSettings {
	let data: unknown = null;
	try {
		data = raw ? JSON.parse(raw) : null;
	} catch {
		data = null;
	}
	const rec = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {};
	return {
		preset: pick(DEFS.preset, rec.preset),
		accent: isAccent(rec.accent) ? rec.accent : DEFAULT_SETTINGS.accent,
		radius: pick(DEFS.radius, rec.radius),
		density: pick(DEFS.density, rec.density),
		locale: pick(DEFS.locale, rec.locale),
	};
}

export function readSettings(): SiteSettings {
	try {
		return parseSettings(localStorage.getItem(SETTINGS_KEY));
	} catch {
		return DEFAULT_SETTINGS;
	}
}

export function writeSettings(next: SiteSettings) {
	try {
		localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
	} catch {
		/* storage blocked: the change still applies to this page */
	}
	cacheTheme(applySettings(next));
	window.dispatchEvent(new CustomEvent<SiteSettings>(SETTINGS_EVENT, { detail: next }));
}

/** Stores the theme CSS for the boot script. Only the frame that changed a setting, or a page load, writes it. */
export function cacheTheme(css: string) {
	try {
		localStorage.setItem(THEME_CSS_KEY, css);
	} catch {
		/* storage blocked */
	}
}

/** Puts the settings that restyle components on this document: the Modern class and the theme CSS, which it returns. */
export function applySettings(s: SiteSettings): string {
	document.documentElement.classList.toggle("preset-modern", s.preset === "modern");
	const css = themeCss(s);
	let style = document.getElementById(THEME_STYLE_ID);
	if (!style) {
		style = document.createElement("style");
		style.id = THEME_STYLE_ID;
		document.body.prepend(style);
	}
	if (style.textContent !== css) style.textContent = css;
	return css;
}

/** Subscribes to settings changes from this page (custom event) and from other frames (storage event). */
export function onSettings(listener: (s: SiteSettings) => void): () => void {
	const local = (e: Event) => listener((e as CustomEvent<SiteSettings>).detail);
	const remote = (e: StorageEvent) => {
		if (e.key !== SETTINGS_KEY) return;
		const s = parseSettings(e.newValue);
		applySettings(s);
		listener(s);
	};
	window.addEventListener(SETTINGS_EVENT, local);
	window.addEventListener("storage", remote);
	return () => {
		window.removeEventListener(SETTINGS_EVENT, local);
		window.removeEventListener("storage", remote);
	};
}

/**
 * Inline script at the top of <body>: applies the Modern class and the cached theme CSS before first paint, so a
 * page never flashes the defaults. It sits in <body> so its <style> comes after the stylesheets in <head>.
 */
export const SETTINGS_BOOT = `try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(SETTINGS_KEY)})||"{}");if(s.preset==="modern")document.documentElement.classList.add("preset-modern");document.getElementById(${JSON.stringify(THEME_STYLE_ID)}).textContent=localStorage.getItem(${JSON.stringify(THEME_CSS_KEY)})||""}catch(e){}`;

// ------------------------------------------------------------------ export

const accentName = (a: Accent) => (isAccentPreset(a) ? ACCENTS[a].label : a.toUpperCase());

/** The setup steps the CSS can't carry, one line each. */
function setupSteps(s: SiteSettings): string[] {
	const steps: string[] = [];
	if (s.preset === "modern") steps.push('Add `preset-modern` to the classes on <html> (with `dark` for dark mode, or `data-theme="modern"` / `"modern-dark"`).');
	if (s.density !== "default") steps.push(`Wrap the app in \`<DensityProvider density="${s.density}">\` from @cynco-labs/ui.`);
	if (s.locale !== "en") steps.push(`Set \`locale: "${s.locale}"\` in the \`DocumentBrandProvider\` brand, so documents print in ${s.locale === "ms" ? "Bahasa Melayu" : "English and Bahasa Melayu"}.`);
	return steps;
}

/** What Copy theme puts on the clipboard: the CSS, with the other steps as comments. */
export function themeSnippet(s: SiteSettings): string {
	const css = themeCss(s);
	const steps = setupSteps(s);
	if (!css && !steps.length) return '/* Cynco UI with its default theme: @import "@cynco-labs/ui/theme.css" is all it needs. */\n';
	const choice = [s.accent !== DEFAULT_ACCENT && `${accentName(s.accent)} accent`, s.radius !== DEFAULT_RADIUS && `${RADII[s.radius].label} radius`].filter(Boolean).join(", ");
	return [
		`/* Cynco UI theme${choice ? `: ${choice}` : ""}. Paste after @import "@cynco-labs/ui/theme.css". */`,
		...steps.map((l) => `/* ${l} */`),
		...(css ? [css] : []),
		"",
	].join("\n");
}

/** The section the Copy prompt buttons append when the visitor has changed a setting. */
export function themePrompt(s: SiteSettings): string {
	const css = themeCss(s);
	const steps = setupSteps(s);
	if (!css && !steps.length) return "";
	return [
		"",
		"",
		"## Theme",
		"",
		"Use the theme I picked on the docs site.",
		"",
		...(css ? ['- Add this CSS after `@import "@cynco-labs/ui/theme.css";`:', "", "```css", css, "```", ""] : []),
		...steps.map((l) => `- ${l}`),
	].join("\n");
}
