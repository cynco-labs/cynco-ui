export type SearchEntry = { name: string; category: string; group?: string; summary: string; use?: string };

/** Components matching the most query words, best first; `partial` when none matches every word. */
export function rank<T extends SearchEntry>(registry: readonly T[], text: string): { hits: T[]; partial: boolean };
