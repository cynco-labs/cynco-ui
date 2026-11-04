import { InvoiceLineItems, type SalesLineItem } from "@cynco-labs/ui";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, test } from "vitest";

const blank: SalesLineItem = { name: "", quantity: 1, price: "0" };

function Lines({ showErrors }: { showErrors?: boolean }) {
	const [items, setItems] = useState<SalesLineItem[]>([blank]);
	return <InvoiceLineItems items={items} onChange={setItems} showErrors={showErrors} />;
}

describe("InvoiceLineItems, the missing-name error", () => {
	test("a fresh blank line is not flagged", () => {
		render(<Lines />);
		expect(screen.queryByText("Enter an item name")).toBeNull();
		expect(screen.getByLabelText("Item name, line 1").getAttribute("aria-invalid")).toBeNull();
	});

	test("the line is flagged once its name field loses focus empty", async () => {
		const user = userEvent.setup();
		render(<Lines />);
		await user.click(screen.getByLabelText("Item name, line 1"));
		await user.tab();
		expect(screen.getByText("Enter an item name")).toBeTruthy();
		expect(screen.getByLabelText("Item name, line 1").getAttribute("aria-invalid")).toBe("true");
	});

	test("typing a name clears the error", async () => {
		const user = userEvent.setup();
		render(<Lines />);
		await user.click(screen.getByLabelText("Item name, line 1"));
		await user.tab();
		await user.type(screen.getByLabelText("Item name, line 1"), "Consulting");
		expect(screen.queryByText("Enter an item name")).toBeNull();
	});

	test("showErrors flags blank lines before anyone touches them", () => {
		render(<Lines showErrors />);
		expect(screen.getByText("Enter an item name")).toBeTruthy();
	});
});
