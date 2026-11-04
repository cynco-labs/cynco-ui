import { buildSalesTotals, InvoiceTotalsPanel, SearchableSelect } from "@cynco-labs/ui";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

describe("InvoiceTotalsPanel", () => {
	test("only deductions carry a minus sign", () => {
		const rows = buildSalesTotals({ subtotal: "100.00", discount: "10.00", taxes: [{ label: "SST 8%", amount: "0" }] });
		const { container } = render(<InvoiceTotalsPanel rows={rows} currency="MYR" />);
		const values = [...container.querySelectorAll("dd")].map((dd) => dd.textContent?.replace(/\u00a0/g, " "));
		expect(values).toEqual(["RM 100.00", "−RM 10.00", "RM 0.00", "RM 90.00"]);
	});
});

describe("SearchableSelect", () => {
	const options = [{ id: "c1", name: "Kedai Runcit Maju Jaya" }];

	test("a custom renderValue with nothing selected still shows the placeholder", () => {
		render(
			<SearchableSelect
				value={null}
				onValueChange={() => {}}
				options={options}
				getOptionValue={(c) => c.id}
				getOptionLabel={(c) => c.name}
				renderValue={(c) => c?.name}
				placeholder="Select a customer…"
			/>,
		);
		expect(screen.getByText("Select a customer…")).toBeTruthy();
	});
});
