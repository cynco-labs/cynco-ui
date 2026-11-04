"use client";

import * as React from "react";

/** One callback ref that sets every ref passed (local RefObjects and the caller's forwarded ref). */
export function useMergedRef<T>(...refs: Array<React.Ref<T> | undefined>): React.RefCallback<T> {
	return React.useCallback((node: T | null) => {
		for (const ref of refs) {
			if (typeof ref === "function") ref(node);
			else if (ref) ref.current = node;
		}
	}, refs);
}
