"use client";

import * as React from "react";

export type Density = "compact" | "default" | "comfortable";
const DensityContext = React.createContext<Density>("default");

/** Sets row density for every DataList (and anything reading useDensity) inside it. */
export function DensityProvider({ density, children }: { density: Density; children: React.ReactNode }) {
	return <DensityContext.Provider value={density}>{children}</DensityContext.Provider>;
}
/** The density set by the nearest DensityProvider ("default" outside one). */
export const useDensity = () => React.useContext(DensityContext);
export const ROW_PAD: Record<Density, string> = { compact: "py-1", default: "py-2.5", comfortable: "py-3.5" };
