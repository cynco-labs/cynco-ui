import type { SiteSettings } from "./settings";

/**
 * Playground controls. A demo declares them as a plain object next to its default export:
 *
 *   export const controls = {
 *     layout: { label: "Layout", options: [{ value: "minimal", label: "Minimal" }, …], default: "minimal" },
 *     loading: { label: "Loading", default: false },
 *   };
 *   export default function Demo({ layout = "minimal", loading = false }) { … }
 *
 * The component page renders the controls under the preview and sends values to the iframe, which passes
 * them to the demo as props. A control named after a site setting (`locale`, `density`) takes its default
 * from that setting, so switching the site to BM switches every document that has not been set by hand.
 */
export interface SelectControl {
	label: string;
	options: readonly { value: string; label: string }[];
	default: string;
}

export interface ToggleControl {
	label: string;
	default: boolean;
}

export type Control = SelectControl | ToggleControl;
export type Controls = Record<string, Control>;
export type ControlValue = string | boolean;
export type ControlValues = Record<string, ControlValue>;

export const isToggle = (c: Control): c is ToggleControl => typeof c.default === "boolean";

const FROM_SETTINGS = ["locale", "density"] as const satisfies readonly (keyof SiteSettings)[];

/** Values a demo renders with: its defaults, then the site settings, then anything set by hand. */
export function resolveControls(controls: Controls | undefined, settings: SiteSettings, overrides: ControlValues = {}): ControlValues {
	const values: ControlValues = {};
	for (const [key, c] of Object.entries(controls ?? {})) {
		const setting = (FROM_SETTINGS as readonly string[]).includes(key) ? settings[key as (typeof FROM_SETTINGS)[number]] : undefined;
		const fromSetting = setting !== undefined && !isToggle(c) && c.options.some((o) => o.value === setting) ? setting : undefined;
		values[key] = overrides[key] ?? fromSetting ?? c.default;
	}
	return values;
}

/** Message the component page posts into a demo iframe when a control changes. */
export interface DemoPropsMessage {
	type: "cynco-demo-props";
	overrides: ControlValues;
}

/** Control values set in the page URL (`?layout=minimal&loading=1`), so a configured playground can be linked. */
export function controlsFromQuery(controls: Controls, query: URLSearchParams): ControlValues {
	const values: ControlValues = {};
	for (const [key, c] of Object.entries(controls)) {
		const raw = query.get(key);
		if (raw === null) continue;
		if (isToggle(c)) {
			if (raw === "1" || raw === "0") values[key] = raw === "1";
		} else if (c.options.some((o) => o.value === raw)) values[key] = raw;
	}
	return values;
}

/** `query` with the controls' keys replaced by the values set by hand; other parameters are kept. */
export function controlsToQuery(controls: Controls, overrides: ControlValues, query: URLSearchParams): URLSearchParams {
	const next = new URLSearchParams(query);
	for (const key of Object.keys(controls)) next.delete(key);
	for (const [key, v] of Object.entries(overrides)) if (key in controls) next.set(key, typeof v === "boolean" ? (v ? "1" : "0") : v);
	return next;
}
