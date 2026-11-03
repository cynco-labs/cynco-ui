"use client";

import { useSyncExternalStore } from "react";
import { isMacPlatform } from "../lib/utils";

// Browser-only values for render: the server snapshot is used on the server and during hydration, so the
// hydrated markup always matches the server HTML; React then re-renders with the real value.
const noSubscribe = () => () => {};
export const useIsMac = () => useSyncExternalStore(noSubscribe, isMacPlatform, () => false);
export const useIsClient = () => useSyncExternalStore(noSubscribe, () => true, () => false);
