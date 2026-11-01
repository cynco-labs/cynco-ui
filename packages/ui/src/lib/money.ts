/**
 * Cynco UI — decimal-safe money maths for inputs and totals.
 *
 * Amounts travel as strings ("1234.50") or integer sen, never as floats, so 0.1 + 0.2 is 0.30 and
 * a 500-line journal still balances to the sen. Matches Cynco's decimal.js usage without the dependency:
 * everything here is BigInt at a fixed 6-decimal working scale, rounded half-up to 2 decimals at the end.
 */

const WORK = 6; // working decimals inside expressions
const W = 10n ** BigInt(WORK);

/** "1234.5" | 1234.5 → 123450n (sen). Invalid → 0n. */
export function toSen(amount: string | number | bigint | null | undefined): bigint {
	if (amount == null || amount === "") return 0n;
	if (typeof amount === "bigint") return amount;
	const s = typeof amount === "number" ? amount.toFixed(2) : String(amount).trim();
	const m = /^(-)?(\d*)(?:\.(\d*))?$/.exec(s.replace(/,/g, ""));
	if (!m) return 0n;
	const frac = ((m[3] ?? "") + "000").slice(0, 3);
	let sen = BigInt(m[2] || "0") * 100n + BigInt(frac.slice(0, 2));
	if (Number(frac[2]) >= 5) sen += 1n; // half-up on the third decimal
	return m[1] ? -sen : sen;
}

/** 123450n → "1234.50" */
export function fromSen(sen: bigint): string {
	const neg = sen < 0n;
	const a = neg ? -sen : sen;
	return `${neg ? "-" : ""}${a / 100n}.${String(a % 100n).padStart(2, "0")}`;
}

/** Sum any mix of decimal strings/numbers exactly: sumAmounts(["0.10","0.20"]) → "0.30". */
export function sumAmounts(values: Array<string | number | null | undefined>): string {
	return fromSen(values.reduce<bigint>((t, v) => t + toSen(v), 0n));
}

export type ParsedAmount = { ok: true; value: string; isExpression: boolean; error?: undefined } | { ok: false; error: string; value?: undefined; isExpression?: undefined };

/**
 * What an accountant types → an exact 2-decimal string.
 * Accepts: "1,234.50", "1234", "(500)" or "-500" (negative), "1.2k", "2.5m", "=1200*1.08", "1200*1.08",
 * "100+250.50-20", "(100+50)/3", "12%" of nothing is not meaningful so % is rejected.
 * Empty → { ok: true, value: "" }.
 */
export function parseAmount(input: string): ParsedAmount {
	let s = input.trim().replace(/^RM\s*/i, "").replace(/,/g, "").replace(/\s+/g, "");
	if (s === "") return { ok: true, value: "", isExpression: false };
	if (s.startsWith("=")) s = s.slice(1);
	// Accounting brackets around a plain number mean negative.
	const bracket = /^\((\d*\.?\d+[km]?)\)$/i.exec(s);
	if (bracket) s = "-" + bracket[1];
	const isExpression = /[+*/()x×]|.-/.test(s);
	try {
		const p = new Parser(s);
		const v = p.expr();
		if (!p.done()) throw new Error("Unexpected “" + s.slice(p.i) + "”");
		// v is scaled by W; round half-up (away from zero) to sen.
		const neg = v < 0n;
		const a = neg ? -v : v;
		const step = W / 100n;
		let sen = a / step;
		if ((a % step) * 2n >= step) sen += 1n;
		return { ok: true, value: fromSen(neg ? -sen : sen), isExpression };
	} catch (e) {
		return { ok: false, error: e instanceof Error ? e.message : "Not a number" };
	}
}

/** Recursive-descent parser over BigInt fixed-point numbers. */
class Parser {
	i = 0;
	constructor(private s: string) {}
	done() {
		return this.i >= this.s.length;
	}
	private peek() {
		return this.s[this.i];
	}
	expr(): bigint {
		let v = this.term();
		while (this.peek() === "+" || this.peek() === "-") {
			const op = this.s[this.i++];
			const r = this.term();
			v = op === "+" ? v + r : v - r;
		}
		return v;
	}
	private term(): bigint {
		let v = this.factor();
		while (this.peek() === "*" || this.peek() === "/" || this.peek() === "x" || this.peek() === "×") {
			const op = this.s[this.i++];
			const r = this.factor();
			if (op === "/") {
				if (r === 0n) throw new Error("Can’t divide by zero");
				v = (v * W) / r;
			} else v = (v * r) / W;
		}
		return v;
	}
	private factor(): bigint {
		const c = this.peek();
		if (c === "-") {
			this.i++;
			return -this.factor();
		}
		if (c === "+") {
			this.i++;
			return this.factor();
		}
		if (c === "(") {
			this.i++;
			const v = this.expr();
			if (this.peek() !== ")") throw new Error("Missing “)”");
			this.i++;
			return v;
		}
		const m = /^(\d*\.?\d+|\d+\.)([kKmM]?)/.exec(this.s.slice(this.i));
		if (!m) throw new Error(this.done() ? "Incomplete" : "Unexpected “" + (c ?? "") + "”");
		this.i += m[0].length;
		const [whole, frac = ""] = m[1].split(".");
		let v = BigInt(whole || "0") * W + BigInt((frac + "0".repeat(WORK)).slice(0, WORK) || "0");
		const suf = m[2].toLowerCase();
		if (suf === "k") v *= 1000n;
		if (suf === "m") v *= 1_000_000n;
		return v;
	}
}
