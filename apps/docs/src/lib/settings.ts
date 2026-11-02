import type { Density, DocLocale } from "@cynco-labs/ui";

/**
 * Site-wide settings that every demo on the site follows: the inline demos on the home page, and the
 * iframes on component pages (same origin, so they read the same localStorage and hear `storage` events).
 * Light and dark stay on the header toggle (`theme` in localStorage); these sit on top of it.
 */
export type Preset = "default" | "modern";

export interface SiteSettings {
	preset: Preset;
	density: Density;
	locale: DocLocale;
}

interface Option<V extends string> {
	value: V;
	label: string;
}

interface SettingDef<K extends keyof SiteSettings> {
	key: K;
	label: string;
	/** Single key that cycles the value, shown beside the control. */
	shortcut: string;
	options: readonly Option<SiteSettings[K]>[];
}

export const SETTINGS: readonly [SettingDef<"preset">, SettingDef<"density">, SettingDef<"locale">] = [
	{
		key: "preset",
		label: "Theme",
		shortcut: "t",
		options: [
			{ value: "default", label: "Default" },
			{ value: "modern", label: "Modern" },
		],
	},
	{
		key: "density",
		label: "Density",
		shortcut: "d",
		options: [
			{ value: "compact", label: "Compact" },
			{ value: "default", label: "Default" },
			{ value: "comfortable", label: "Roomy" },
		],
	},
	{
		key: "locale",
		label: "Documents",
		shortcut: "l",
		options: [
			{ value: "en", label: "EN" },
			{ value: "ms", label: "BM" },
			{ value: "en-ms", label: "EN + BM" },
		],
	},
];

export const DEFAULT_SETTINGS: SiteSettings = { preset: "default", density: "default", locale: "en" };

export const SETTINGS_KEY = "cynco-docs-settings";
export const SETTINGS_EVENT = "site-settings";

function isOption<K extends keyof SiteSettings>(def: SettingDef<K>, value: unknown): value is SiteSettings[K] {
	return def.options.some((o) => o.value === value);
}

export function parseSettings(raw: string | null): SiteSettings {
	let data: unknown = null;
	try {
		data = raw ? JSON.parse(raw) : null;
	} catch {
		data = null;
	}
	const rec = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {};
	const [preset, density, locale] = SETTINGS;
	return {
		preset: isOption(preset, rec.preset) ? rec.preset : DEFAULT_SETTINGS.preset,
		density: isOption(density, rec.density) ? rec.density : DEFAULT_SETTINGS.density,
		locale: isOption(locale, rec.locale) ? rec.locale : DEFAULT_SETTINGS.locale,
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
	applyPreset(next.preset);
	window.dispatchEvent(new CustomEvent<SiteSettings>(SETTINGS_EVENT, { detail: next }));
}

export function applyPreset(preset: Preset) {
	document.documentElement.classList.toggle("preset-modern", preset === "modern");
}

/** Subscribes to settings changes from this page (custom event) and from other frames (storage event). */
export function onSettings(listener: (s: SiteSettings) => void): () => void {
	const local = (e: Event) => listener((e as CustomEvent<SiteSettings>).detail);
	const remote = (e: StorageEvent) => {
		if (e.key !== SETTINGS_KEY) return;
		const s = parseSettings(e.newValue);
		applyPreset(s.preset);
		listener(s);
	};
	window.addEventListener(SETTINGS_EVENT, local);
	window.addEventListener("storage", remote);
	return () => {
		window.removeEventListener(SETTINGS_EVENT, local);
		window.removeEventListener("storage", remote);
	};
}

/** Inline <head> script: applies the preset before first paint so a Modern page never flashes Default. */
export const PRESET_BOOT = `try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(SETTINGS_KEY)})||"{}");if(s.preset==="modern")document.documentElement.classList.add("preset-modern")}catch(e){}`;
