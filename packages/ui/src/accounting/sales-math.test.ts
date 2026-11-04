import { describe, expect, test } from "vitest";
import { fromSen, toSen } from "../lib/money";
import { buildSalesTotals, type SalesLineItem, salesLineAmount, salesLineTotals } from "./sales-math";

const line = (patch: Partial<SalesLineItem>): SalesLineItem => ({ name: "Item", quantity: 1, price: "0", ...patch });

describe("salesLineAmount", () => {
	test.each<[Partial<SalesLineItem>, string]>([
		[{ price: 1.15, taxCode: "st10" }, "1.27"],
		[{ price: "4.35", taxCode: "st10" }, "4.79"],
		[{ quantity: 3, price: "0.10" }, "0.30"],
		[{ quantity: 2, price: "100", discount: 10 }, "180.00"],
		[{ quantity: 2, price: "100", discount: "15.50", discountType: "fixed", taxCode: "sst8" }, "199.26"],
		[{ price: "10", discount: "20", discountType: "fixed" }, "0.00"],
	])("%o → %s", (patch, expected) => {
		expect(salesLineAmount(line(patch))).toBe(expected);
	});

	test("uses the tax codes it is given", () => {
		expect(salesLineAmount(line({ price: "100", taxCode: "gst" }), [{ value: "gst", label: "GST 9%", rate: 9 }])).toBe(
			"109.00",
		);
	});
});

describe("buildSalesTotals", () => {
	const value = (rows: ReturnType<typeof buildSalesTotals>, kind: string) => rows.find((r) => r.kind === kind);

	test("a deposit equal to the total leaves a zero balance, not a negative one", () => {
		const rows = buildSalesTotals({ subtotal: "0.70", taxes: [{ label: "Tax", amount: "0.10" }], deposit: "0.80" });
		expect(value(rows, "balance")).toMatchObject({ value: "0.00", negative: false });
	});

	test("totals are exact and every row says what it is", () => {
		const rows = buildSalesTotals({
			subtotal: 0.1,
			discount: "0.03",
			taxes: [
				{ label: "SST 8%", amount: 0.2 },
				{ label: "Zero", amount: 0 },
			],
			deposit: "1.00",
		});
		expect(rows.map((r) => [r.kind, r.value, r.negative ?? false])).toEqual([
			["subtotal", "0.10", false],
			["discount", "0.03", true],
			["tax", "0.20", false],
			["tax", "0.00", false],
			["total", "0.27", false],
			["deposit", "1.00", true],
			["balance", "0.73", true],
		]);
	});

	test("labels can be translated", () => {
		expect(value(buildSalesTotals({ subtotal: "1" }, { total: "Jumlah" }), "total")?.label).toBe("Jumlah");
	});
});

describe("salesLineTotals", () => {
	const taxed = (price: string, taxCode: string, quantity = 1): SalesLineItem => ({
		name: "x",
		quantity,
		price,
		taxCode,
	});

	test("subtotal plus taxes equals the sum of the line amounts, to the sen", () => {
		const items = [taxed("1.15", "st10"), taxed("1.15", "st10"), taxed("0.33", "sst8", 3), taxed("5", "none")];
		const { subtotal, taxes } = salesLineTotals(items);
		const total = buildSalesTotals({ subtotal, taxes }).find((r) => r.kind === "total")?.value;
		expect(total).toBe(fromSen(items.reduce((sum, item) => sum + toSen(salesLineAmount(item)), 0n)));
		expect(taxes.map((t) => t.label)).toEqual(["SST 8%", "Sales 10%"]);
	});

	test("a taxed code on a blank line still gets a zero row; untaxed codes get none", () => {
		expect(salesLineTotals([taxed("0", "sst8"), taxed("0", "exempt")])).toEqual({
			subtotal: "0.00",
			taxes: [{ label: "SST 8%", amount: "0.00" }],
		});
	});
});
