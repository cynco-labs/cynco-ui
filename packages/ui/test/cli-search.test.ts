import { describe, expect, it } from "vitest";
import { rank } from "../bin/search.mjs";
import registry from "../registry/components.json";

const names = (text: string) => rank(registry, text).hits.map((c) => c.name);

describe("cynco-ui search", () => {
	it("matches words in any order, across name and description", () => {
		expect(names("date picker")[0]).toBe("DateInputUnix");
		expect(names("reconcile bank")).toContain("BankReconciliationYearStrip");
		expect(names("money input")[0]).toBe("AmountInput");
	});

	it("ranks a name hit above a description hit, and the primitive first", () => {
		expect(names("table").slice(0, 2)).toEqual(["Table", "DataTable"]);
		const invoice = names("invoice");
		expect(invoice.slice(0, 10).every((n) => n.includes("Invoice"))).toBe(true);
		expect(invoice.indexOf("IconButton")).toBeGreaterThan(invoice.indexOf("TaxInvoiceDocument"));
		expect(names("amount input")[0]).toBe("AmountInput");
	});

	it("ignores filler words", () => {
		expect(names("the invoice list")[0]).toBe("InvoiceListTable");
	});

	it("falls back to the components matching the most words, and says so", () => {
		const r = rank(registry, "invoice qrcode");
		expect(r.partial).toBe(true);
		expect(r.hits.map((c) => c.name)).toContain("InvoiceListTable");
		expect(rank(registry, "invoice").partial).toBe(false);
		expect(rank(registry, "zzz").hits).toEqual([]);
	});
});
