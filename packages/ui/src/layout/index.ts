/**
 * Cynco UI — layout primitives.
 *
 * Every component that shows tabular data, KPI tiles or a toolbar is built from these, so
 * responsiveness and surface styling live in ONE place. All of them respond to the width of
 * their CONTAINER (CSS container queries), not the viewport: the same component works in a
 * full page, a side sheet or a 360px phone.
 */

export { ActionBar } from "./action-bar";
export type { DataColumn, DataListProps } from "./data-list";
export { DataList } from "./data-list";
export type { Density } from "./density";
export { DensityProvider, useDensity } from "./density";
export { useHotkey } from "./hotkey";
export { Kbd } from "./kbd";
export { KeyValueList } from "./key-value-list";
export { ScrollRow } from "./scroll-row";
export type { StatGridProps, StatTileProps, ToneDotProps } from "./stats";
export { StatGrid, StatTile, ToneDot, toneBg } from "./stats";
export type { SectionPanelProps } from "./surfaces";
export { negativeClass, SectionPanel, surfaces } from "./surfaces";
