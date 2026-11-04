export type JsonRecord = Record<string, unknown>;

export const isRecord = (value: unknown): value is JsonRecord =>
	typeof value === "object" && value !== null && !Array.isArray(value);

export const num = (record: JsonRecord, key: string): number | undefined => {
	const value = record[key];
	return typeof value === "number" && Number.isFinite(value) ? value : undefined;
};

export const str = (record: JsonRecord, key: string): string | undefined => {
	const value = record[key];
	return typeof value === "string" ? value : undefined;
};

export const rec = (record: JsonRecord, key: string): JsonRecord | undefined => {
	const value = record[key];
	return isRecord(value) ? value : undefined;
};

export function parseJson(text: string): unknown {
	try {
		return JSON.parse(text);
	} catch {
		return undefined;
	}
}
