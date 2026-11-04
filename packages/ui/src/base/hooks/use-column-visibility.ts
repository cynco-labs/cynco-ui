"use client";

import type { ColumnDef, Updater, VisibilityState } from "@tanstack/react-table";
import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from "react";

const STORAGE_PREFIX = "cynco-ui:table-columns:";

type StoredColumnValue = boolean | { visible: boolean; name: string };

const NONE: VisibilityState = {};

function parseStored(saved: string | null): VisibilityState {
	if (!saved) return NONE;
	try {
		const parsed = JSON.parse(saved) as Record<string, StoredColumnValue>;
		const visibility: VisibilityState = {};
		for (const [key, value] of Object.entries(parsed)) {
			visibility[key] = typeof value === "boolean" ? value : value.visible;
		}
		return visibility;
	} catch {
		return NONE;
	}
}

// useSyncExternalStore needs the same object back while storage is unchanged.
const snapshots = new Map<string, { raw: string | null; value: VisibilityState }>();

function readStored(storageKey: string): VisibilityState {
	let raw: string | null = null;
	try {
		raw = localStorage.getItem(`${STORAGE_PREFIX}${storageKey}`);
	} catch {}
	const hit = snapshots.get(storageKey);
	if (hit && hit.raw === raw) return hit.value;
	const value = parseStored(raw);
	snapshots.set(storageKey, { raw, value });
	return value;
}

// "storage" fires only in other tabs; SAVED tells tables in this tab that share the key.
const SAVED = "cynco-ui:table-columns-saved";

const subscribeToStorage = (onChange: () => void) => {
	window.addEventListener("storage", onChange);
	window.addEventListener(SAVED, onChange);
	return () => {
		window.removeEventListener("storage", onChange);
		window.removeEventListener(SAVED, onChange);
	};
};

function saveToStorage(
	storageKey: string,
	state: VisibilityState,
	columns: { id?: string; header?: unknown }[],
): boolean {
	try {
		const out: Record<string, StoredColumnValue> = {};
		for (const [id, visible] of Object.entries(state)) {
			const col = columns.find((c) => c.id === id);
			const header = typeof col?.header === "string" ? col.header : null;
			out[id] = header ? { visible, name: header } : visible;
		}
		localStorage.setItem(`${STORAGE_PREFIX}${storageKey}`, JSON.stringify(out));
		window.dispatchEvent(new Event(SAVED));
		return true;
	} catch {
		return false;
	}
}

/** Defines a group of columns to be rendered together in a submenu */
export interface ColumnGroup {
	key: string;
	label: string;
	columnIds: string[];
}

interface UseColumnVisibilityOptions<T> {
	columns: ColumnDef<T, unknown>[];
	defaultVisibleColumnIds: string[];
	storageKey?: string;
	columnGroups?: ColumnGroup[];
}

export function useColumnVisibility<T>({
	columns,
	defaultVisibleColumnIds,
	storageKey,
	columnGroups = [],
}: UseColumnVisibilityOptions<T>) {
	// The server and hydration render the defaults (there is no storage there); the browser then
	// re-renders with the saved columns. Client-only renders get the saved columns straight away.
	const stored = useSyncExternalStore(
		subscribeToStorage,
		() => (storageKey ? readStored(storageKey) : NONE),
		() => NONE,
	);
	// Toggles not yet saved; null when the table shows what storage holds.
	const [edited, setEdited] = useState<VisibilityState | null>(null);
	const savedVisibility = edited ?? stored;
	const isDirty = edited !== null;

	// Derive effective visibility synchronously — fills in defaults for any
	// column not yet in savedVisibility, so there's never a render frame where
	// new columns flash visible before being hidden by an async useEffect.
	const columnVisibility = useMemo(() => {
		const result: VisibilityState = {};
		for (const col of columns) {
			if (!col.id) continue;
			if (col.id in savedVisibility) {
				result[col.id] = savedVisibility[col.id];
			} else {
				result[col.id] = defaultVisibleColumnIds.includes(col.id);
			}
		}
		return result;
	}, [columns, savedVisibility, defaultVisibleColumnIds]);

	const columnVisibilityRef = useRef(columnVisibility);
	columnVisibilityRef.current = columnVisibility;

	// Only user-initiated changes (column toggles) flow through this setter,
	// so the dirty flag accurately reflects unsaved user intent.
	const setColumnVisibility = useCallback((updaterOrValue: Updater<VisibilityState>) => {
		const newState = typeof updaterOrValue === "function" ? updaterOrValue(columnVisibilityRef.current) : updaterOrValue;
		setEdited(newState);
	}, []);

	const saveColumnVisibility = useCallback(() => {
		if (!storageKey) return;
		// A failed write (storage full or blocked) keeps the toggles on screen, still marked unsaved.
		if (saveToStorage(storageKey, columnVisibilityRef.current, columns)) setEdited(null);
	}, [storageKey, columns]);

	return {
		columnVisibility,
		setColumnVisibility,
		isDirty,
		saveColumnVisibility,
		columnGroups,
	};
}
