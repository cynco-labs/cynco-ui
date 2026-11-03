/**
 * The settings that restyle the components themselves: the accent (the primary colour) and the corner radius.
 * `themeCss` turns them into CSS that overrides the theme tokens. The site injects it live, and Copy theme hands
 * the same text to a project, so what a visitor sees is exactly what they paste. Pure and server-safe.
 */

/** A 6-digit hex colour, the only custom accent shape the site stores. */
export type Hex = `#${string}`;

export const isHex = (value: unknown): value is Hex => typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);

/** One accent, as the three values the theme needs: the fill on light, the fill on dark, and text on dark. */
export interface AccentColors {
	light: Hex;
	dark: Hex;
	darkText: Hex;
}

/**
 * Presets in hue order. Blue is the theme's own, so choosing it writes no CSS. The others are mixed so white text
 * on the fill passes 4.5:1, the light fill passes 4.5:1 as text, and the dark fill passes 3:1 as a focus ring
 * (theme.test.ts checks every one).
 */
export const ACCENTS = {
	blue: { label: "Blue", light: "#0067d1", dark: "#0074e3", darkText: "#2f92ff" },
	indigo: { label: "Indigo", light: "#5f57e7", dark: "#655ee8", darkText: "#8b93ff" },
	violet: { label: "Violet", light: "#8244ee", dark: "#884cef", darkText: "#a78bfa" },
	teal: { label: "Teal", light: "#0b7970", dark: "#0b7e74", darkText: "#2dd4bf" },
	green: { label: "Green", light: "#117c39", dark: "#12823b", darkText: "#4ade80" },
	orange: { label: "Orange", light: "#bb460a", dark: "#c3490a", darkText: "#fb923c" },
	rose: { label: "Rose", light: "#d21b43", dark: "#dc1c46", darkText: "#fb7185" },
} as const satisfies Record<string, AccentColors & { label: string }>;

export type AccentPreset = keyof typeof ACCENTS;
/** A preset name, or a custom colour. */
export type Accent = AccentPreset | Hex;

export const ACCENT_ORDER = Object.keys(ACCENTS) as AccentPreset[];
export const DEFAULT_ACCENT: AccentPreset = "blue";

export const isAccentPreset = (value: unknown): value is AccentPreset => typeof value === "string" && value in ACCENTS;
export const isAccent = (value: unknown): value is Accent => isAccentPreset(value) || isHex(value);

/** The corner scale. Components use `rounded-sm` … `rounded-2xl`, which read these tokens. */
const RADIUS_KEYS = ["xs", "sm", "md", "lg", "xl", "2xl"] as const;
type RadiusScale = Record<(typeof RADIUS_KEYS)[number], string> & { base: string };

export const RADII = {
	sharp: { label: "Sharp", base: "2px", xs: "0px", sm: "0px", md: "1px", lg: "2px", xl: "3px", "2xl": "4px" },
	default: { label: "Default", base: "0.375rem", xs: "0.125rem", sm: "2px", md: "4px", lg: "6px", xl: "10px", "2xl": "12px" },
	round: { label: "Round", base: "10px", xs: "3px", sm: "4px", md: "7px", lg: "10px", xl: "14px", "2xl": "18px" },
} as const satisfies Record<string, RadiusScale & { label: string }>;

export type Radius = keyof typeof RADII;
export const RADIUS_ORDER = Object.keys(RADII) as Radius[];
export const DEFAULT_RADIUS: Radius = "default";
export const isRadius = (value: unknown): value is Radius => typeof value === "string" && value in RADII;

// ------------------------------------------------------------------ contrast

/** The surfaces a primary fill, focus ring or primary text sits on, per theme (tokens.css). */
export const LIGHT_SURFACES: readonly Hex[] = ["#ffffff", "#fafaf9", "#f8f8f7", "#f2f2f2"];
export const DARK_SURFACES: readonly Hex[] = ["#161616", "#121212", "#1a1a1a", "#1c1c1d", "#1d1d1d"];

const channels = (hex: Hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

function luminance(hex: Hex): number {
	const [r, g, b] = channels(hex).map((v) => {
		const c = v / 255;
		return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: Hex, b: Hex): number {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
}

const minContrast = (hex: Hex, surfaces: readonly Hex[]) => Math.min(...surfaces.map((s) => contrast(hex, s)));

function mix(from: Hex, to: Hex, t: number): Hex {
	const a = channels(from);
	const b = channels(to);
	return `#${a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, "0")).join("")}`;
}

/** The least mix of `base` toward `to` that satisfies `ok`. */
function nudge(base: Hex, to: Hex, ok: (hex: Hex) => boolean): Hex {
	for (let step = 0; step <= 100; step++) {
		const hex = mix(base, to, step / 100);
		if (ok(hex)) return hex;
	}
	return to;
}

const WHITE: Hex = "#ffffff";
const BLACK: Hex = "#000000";

export const fillsLight = (hex: Hex) => contrast(hex, WHITE) >= 4.5 && minContrast(hex, LIGHT_SURFACES) >= 4.5;
const whiteText = (hex: Hex) => contrast(hex, WHITE) >= 4.5;
const ring = (hex: Hex) => minContrast(hex, DARK_SURFACES) >= 3;
export const fillsDark = (hex: Hex) => whiteText(hex) && ring(hex);
export const readsDark = (hex: Hex) => minContrast(hex, DARK_SURFACES) >= 4.5;

/**
 * The accent values for a custom colour, moved only as far as contrast needs: darker on light, into the window
 * where white text and a focus ring both pass on dark, lighter as text. `adjusted` says whether a fill moved.
 */
export function customAccent(accent: Hex): AccentColors & { adjusted: boolean } {
	const hex = accent.toLowerCase() as Hex;
	const light = nudge(hex, BLACK, fillsLight);
	const dark = whiteText(hex) ? nudge(hex, WHITE, fillsDark) : nudge(hex, BLACK, fillsDark);
	return { light, dark, darkText: nudge(hex, WHITE, readsDark), adjusted: light !== hex || dark !== hex };
}

export const accentColors = (accent: Accent): AccentColors => (isAccentPreset(accent) ? ACCENTS[accent] : customAccent(accent));

// ------------------------------------------------------------------ CSS

export interface ThemeChoice {
	accent: Accent;
	radius: Radius;
}

const LIGHT_SELECTORS = ':root,\n.light:not(.react-flow),\n[data-theme="light"],\n.preset-modern,\n[data-theme="modern"]';
const DARK_SELECTORS = '.dark:not(.react-flow),\n[data-theme$="dark"]';

/** The CSS that applies a choice on top of @cynco-labs/ui/theme.css. Empty when every value is the default. */
export function themeCss({ accent, radius }: ThemeChoice): string {
	const light: string[] = [];
	const dark: string[] = [];
	const corners: string[] = [];
	if (accent !== DEFAULT_ACCENT) {
		const c = accentColors(accent);
		light.push(`--primary: ${c.light};`);
		dark.push(`--primary: ${c.dark};`, `--primary-text: ${c.darkText};`);
	}
	if (radius !== DEFAULT_RADIUS) {
		const r = RADII[radius];
		corners.push(`--radius: ${r.base};`, ...RADIUS_KEYS.map((k) => `--radius-${k}: ${r[k]};`));
	}
	const block = (selector: string, lines: string[]) => (lines.length ? [`${selector} {`, ...lines.map((l) => `\t${l}`), "}"] : []);
	// Every selector tokens.css sets --primary on, light before dark, so each override wins by coming later at
	// equal specificity, on the root and on any themed subtree.
	return [
		...block(LIGHT_SELECTORS, light),
		...block(DARK_SELECTORS, dark),
		...block(":root", corners),
	].join("\n");
}
