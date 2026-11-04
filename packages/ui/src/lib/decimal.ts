/**
 * Fixed-point decimals at 6 places (a bigint holding value × 10⁶) for working figures that are rounded to the
 * sen once, at the end. Internal to the package: the public money API is ./money.
 */

export const SCALE = 1_000_000n;

/**
 * "1,234.5" | 1234.5 → 1_234_500_000n; anything that isn't a plain decimal → null. Digits past the 6th are dropped,
 * not rounded, so the single rounding to the sen sees the true value ("1.0049995" stays below 1.005).
 */
export function toFixedPoint(value: string | number): bigint | null {
	// toFixed(6) reads a float at its shortest decimal (1.005 → "1.005000"), not its binary value (1.00499…).
	const s =
		typeof value === "number" ? (Number.isFinite(value) ? value.toFixed(6) : "") : value.trim().replace(/,/g, "");
	const m = /^([-+])?(\d*)(?:\.(\d*))?$/.exec(s);
	if (!m || (!m[2] && !m[3])) return null;
	const v = BigInt(m[2] || "0") * SCALE + BigInt((m[3] ?? "").padEnd(6, "0").slice(0, 6));
	return m[1] === "-" ? -v : v;
}

/** Like toFixedPoint, with invalid or missing input as zero. */
export const fixed = (value: string | number | null | undefined): bigint =>
	value == null || value === "" ? 0n : (toFixedPoint(value) ?? 0n);

export const mul = (a: bigint, b: bigint): bigint => (a * b) / SCALE;

export const div = (a: bigint, b: bigint): bigint => (a * SCALE) / b;

/** Round to whole sen, half away from zero (1.005 → 101n, -1.005 → -101n). */
export function roundToSen(v: bigint): bigint {
	const step = SCALE / 100n;
	const a = v < 0n ? -v : v;
	const sen = a / step + ((a % step) * 2n >= step ? 1n : 0n);
	return v < 0n ? -sen : sen;
}
