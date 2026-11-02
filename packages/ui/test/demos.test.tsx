import { DensityProvider, TooltipProvider } from "@cynco-labs/ui";
import { render } from "@testing-library/react";
import axe from "axe-core";
import type { ComponentType } from "react";
import { describe, expect, test } from "vitest";

/**
 * Every docs demo renders once with its default controls, then runs axe over the result.
 * The demos are the library's example of each component, so a crash or an accessibility
 * violation here is one a reader of the docs would hit.
 */
type ControlValue = string | boolean;
interface DemoModule {
	default: ComponentType<Record<string, ControlValue>>;
	controls?: Record<string, { default: ControlValue }>;
}

const demos = import.meta.glob<DemoModule>("../../../apps/docs/src/demos/*.tsx", { eager: true });

// Rules about the page rather than the component: a demo is a fragment, often shows two variants side by side,
// and jsdom does not evaluate the container queries that hide DataList's alternate layout, so landmarks repeat.
const PAGE_RULES = [
	"color-contrast",
	"region",
	"landmark-one-main",
	"landmark-unique",
	"landmark-no-duplicate-banner",
	"page-has-heading-one",
	"document-title",
	"html-has-lang",
	"bypass",
];
const axeOptions: axe.RunOptions = { rules: Object.fromEntries(PAGE_RULES.map((id) => [id, { enabled: false }])) };

function defaults(mod: DemoModule): Record<string, ControlValue> {
	return Object.fromEntries(Object.entries(mod.controls ?? {}).map(([key, c]) => [key, c.default]));
}

function describeViolation(v: axe.Result): string {
	const targets = v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(", ");
	return `${v.id}: ${v.help} (${targets})`;
}

describe("docs demos", () => {
	const entries = Object.entries(demos).map(([path, mod]) => [path.replace(/^.*\/(\w+)\.tsx$/, "$1"), mod] as const);
	expect(entries.length).toBeGreaterThan(200);

	test.each(entries)("%s renders and passes axe", async (_name, mod) => {
		const Demo = mod.default;
		render(
			<TooltipProvider>
				<DensityProvider density="default">
					<Demo {...defaults(mod)} />
				</DensityProvider>
			</TooltipProvider>,
		);
		// Overlays portal into the body, so the whole document is the surface under test.
		expect(document.body.childElementCount).toBeGreaterThan(0);
		const result = await axe.run(document.body, axeOptions);
		expect(result.violations.map(describeViolation)).toEqual([]);
	});
});
