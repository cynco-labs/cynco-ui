/**
 * Cynco UI — financial reports & the CFO dashboard.
 *
 * Hand-written, presentational ports of cynco-labs/cynco
 * remix/app/components/reports/* and dashboard/overview/*, rebuilt on Cynco UI
 * primitives and the shared Cynco layout primitives (DataList, StatGrid,
 * SectionPanel, ActionBar). Every component responds to its own container width.
 *
 * Conventions kept from Cynco: Dr/Cr columns left blank at zero, bracketed
 * deductions, em-dash zeros, account codes in mono, "RM" via formatCurrency,
 * aging bands Current / 1–30 / 31–60 / 61–90 / 90+.
 */

export * from "./activity-feed";
export * from "./aging";
export * from "./cash-flow";
export * from "./cash-runway";
export * from "./health-checks";
export * from "./kpi-tiles";
export * from "./report-toolbar";
export * from "./statements";
export * from "./trial-balance";
