import { fixed, mul, roundToSen } from "../lib/decimal";
import { type Amount, fromSen, sumAmounts, toSen } from "../lib/money";

/* Sales maths, exact to the sen. No React here: server code can call all of it. */

export type SalesLineItem = {
	name: string;
	description?: string;
	quantity: number;
	price: Amount;
	discount?: Amount;
	discountType?: "percentage" | "fixed";
	/** Tax code value from `taxCodes`, or "exempt". */
	taxCode?: string;
	/** Estimated profit health from item cost (ADR 0010). */
	margin?: "healthy" | "below_target" | "below_cost";
};

export type SalesTaxCode = { value: string; label: string; rate: number };

/** Malaysian SST codes, the default for `taxCodes`. Pass your own for any other tax regime. */
export const DEFAULT_SALES_TAX_CODES: readonly SalesTaxCode[] = [
	{ value: "none", label: "No tax", rate: 0 },
	{ value: "sst8", label: "SST 8%", rate: 8 },
	{ value: "sst6", label: "SST 6%", rate: 6 },
	{ value: "st10", label: "Sales 10%", rate: 10 },
	{ value: "exempt", label: "Exempt", rate: 0 },
];

/** Line amount after the line's discount and tax, rounded half-up to the sen once: 1 × 1.15 at 10% → "1.27". */
export function salesLineAmount(
	item: SalesLineItem,
	taxCodes: readonly SalesTaxCode[] = DEFAULT_SALES_TAX_CODES,
): string {
	const gross = mul(fixed(item.quantity), fixed(item.price));
	const discount = item.discountType === "fixed" ? fixed(item.discount) : mul(gross, fixed(item.discount)) / 100n;
	const net = gross > discount ? gross - discount : 0n;
	const rate = fixed(taxCodes.find((t) => t.value === item.taxCode)?.rate ?? 0);
	return fromSen(roundToSen(net + mul(net, rate) / 100n));
}

export type SalesTotalKind = "subtotal" | "discount" | "tax" | "total" | "deposit" | "balance";

/** One totals line. `value` is the magnitude; `negative` prints it with a minus sign. */
export type SalesTotalRow = {
	kind: SalesTotalKind;
	label: string;
	value: Amount;
	bold?: boolean;
	accent?: boolean;
	negative?: boolean;
};

export type SalesTotalLabels = Record<Exclude<SalesTotalKind, "tax">, string>;

const TOTAL_LABELS: SalesTotalLabels = {
	subtotal: "Subtotal",
	discount: "Discount",
	total: "Total",
	deposit: "Deposit",
	balance: "Balance Due",
};

/**
 * Totals rows for an invoice: Subtotal, Discount, one row per tax, Total, then Deposit and Balance Due when there
 * is a deposit. Exact to the sen. Pass `labels` to translate the fixed rows.
 */
export function buildSalesTotals(
	input: {
		subtotal: Amount;
		discount?: Amount;
		discountPercent?: Amount;
		taxes?: { label: string; amount: Amount }[];
		deposit?: Amount;
	},
	labels: Partial<SalesTotalLabels> = {},
): SalesTotalRow[] {
	const l = { ...TOTAL_LABELS, ...labels };
	const rows: SalesTotalRow[] = [{ kind: "subtotal", label: l.subtotal, value: fromSen(toSen(input.subtotal)) }];
	const discount = toSen(input.discount);
	if (discount > 0n)
		rows.push({
			kind: "discount",
			label: `${l.discount}${input.discountPercent ? ` (${input.discountPercent}%)` : ""}`,
			value: fromSen(discount),
			negative: true,
		});
	const taxes = (input.taxes ?? []).filter((t) => toSen(t.amount) > 0n);
	for (const t of taxes) rows.push({ kind: "tax", label: t.label, value: fromSen(toSen(t.amount)) });
	const total = toSen(input.subtotal) - discount + toSen(sumAmounts(taxes.map((t) => t.amount)));
	rows.push({ kind: "total", label: l.total, value: fromSen(abs(total)), bold: true, negative: total < 0n });
	const deposit = toSen(input.deposit);
	if (deposit > 0n) {
		const balance = total - deposit;
		rows.push({ kind: "deposit", label: l.deposit, value: fromSen(deposit), negative: true });
		rows.push({
			kind: "balance",
			label: l.balance,
			value: fromSen(abs(balance)),
			bold: true,
			accent: true,
			negative: balance < 0n,
		});
	}
	return rows;
}

const abs = (sen: bigint) => (sen < 0n ? -sen : sen);
