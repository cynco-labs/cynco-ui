import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { DocumentBrandProvider, ForeignCurrencyNote } from "../index";

const note = (
	<ForeignCurrencyNote currency="USD" rate="1.3400" rows={[{ label: "totalMyr", value: "1340.00", strong: true }]} />
);

describe("ForeignCurrencyNote", () => {
	test("converts into MYR when the brand sets no base currency", () => {
		const { container } = render(
			<DocumentBrandProvider brand={{ company: { name: "Maju Sdn Bhd" } }}>{note}</DocumentBrandProvider>,
		);
		expect(container.textContent).toContain("1 USD = 1.3400 MYR");
		expect(container.textContent).toContain("RM");
	});

	test("converts into the brand's base currency", () => {
		const { container } = render(
			<DocumentBrandProvider brand={{ company: { name: "Lion Pte Ltd" }, baseCurrency: "SGD" }}>
				{note}
			</DocumentBrandProvider>,
		);
		expect(container.textContent).toContain("1 USD = 1.3400 SGD");
		expect(container.textContent).not.toContain("RM");
	});
});
