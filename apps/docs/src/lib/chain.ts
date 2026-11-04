export interface NavLink {
	label: string;
	href: string;
}

/**
 * Previous and next inside one chain of pages, stopping at its ends. The site keeps one chain per
 * sidebar section, so ← from the first component of a category does not land on an unrelated page.
 */
export function neighboursIn(chains: readonly (readonly NavLink[])[], href: string) {
	for (const chain of chains) {
		const i = chain.findIndex((p) => p.href === href);
		if (i >= 0) return { prev: chain[i - 1], next: chain[i + 1] };
	}
	return { prev: undefined, next: undefined };
}
