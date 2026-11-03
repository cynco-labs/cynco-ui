---
"@cynco-labs/ui": minor
---

Polish before launch: one icon set, a lighter install, react-day-picker 10, and composable components throughout.

- **Icons:** every component now uses Phosphor (already a peer dependency); `lucide-react` is no longer a dependency. Types that referred to Lucide (`CheckpointIconProps`, the `icon` prop of `ChainOfThoughtStep` and `Artifact` actions, `SmallSpinner` props) now use Phosphor's `Icon` and `IconProps`.
- **Lighter install:** `ai`, `streamdown`, `shiki`, `use-stick-to-bottom`, `tokenlens`, `nanoid` and `@xyflow/react` are optional peer dependencies. Install them only if you use `@cynco-labs/ui/ai`.
- **Breaking:** `react-day-picker` 8 → 10, which fixes the date-fns 4 peer conflict. `Calendar` takes react-day-picker 10 props: `captionLayout="dropdown"` (formerly `"dropdown-buttons"`) and `startMonth` / `endMonth` (formerly `fromYear` / `toYear`). `DateInputUnix` opens on the selected month.
- **Tooltip** respects the nearest `TooltipProvider`'s delay; `delayDuration` still overrides it for one tooltip.
- **Copy buttons** show "Copied" only when the clipboard write succeeded, and no longer throw on insecure origins.
- **Saved table columns** no longer cause a hydration mismatch: the server renders the defaults and the browser then applies the saved set. A failed save keeps the toggles on screen, marked unsaved.
- **No console output:** `PromptInputSpeechButton` reports recognition errors through `onSpeechError`, and dictated text now reaches a controlled textarea. `CodeBlock` falls back to plain text quietly. `ModelSelectorLogo` takes `src` so you can self-host the logos. The package no longer adds `SpeechRecognition` to the global `Window` type.
- **Native props and `className` everywhere:** documents (`TaxInvoiceDocument` … `PayslipDocument` accept every `DocumentPage` option plus `<article>` props), document parts, `Money`, `AmountCell`, `ReportAmount`, `DetailRow`, `SectionLabel`, `DocStatus`, the accounting list tables, `KeyValueList`, `FilterChip`, `PageHeader`, `PageContainer`, `StepBadge`, `SectionTag`, `BetaBadge`, `LoadingShimmerText`, `CopyablePre`, `IconTooltipButton`, `SandboxBanner` and the table toolbar parts. **Breaking:** `InfoRow`'s `className` now styles the row; use `valueClassName` for the value.
- **Controlled and uncontrolled:** `JournalLineEditor` (`defaultLines`), `AccountPickerField` and `ChartOfAccountsTree` (`defaultSelectedId`), `PeriodCloseAttentionCard` (`defaultNote`), `PurchaseOrderLines` (`defaultLineItems`), `TagInput` (`defaultValue`), `SearchableSelect` (`defaultValue`), `AreaCheckbox` and `IconCheckbox` (`defaultChecked`). These now follow later prop changes instead of keeping their first value. **Breaking:** `TagInput` and `TagSelect` report changes through `onValueChange` (was `onChange`). `CoaAccountPanel` shows `account.isActive` and reports Activate / Deactivate through `onActiveChange`.
- `Money`, `AmountCell`, `ReportAmount`, `BracketedFigure` and `formatBracketed` accept decimal strings and format them exactly.
- **Type scale:** every component now uses the theme's sizes. `Badge size="sm"` is 11px (was 10px), `DialogDescription` 13px (was 12.5px), and `StackBadge` inherits the theme font instead of forcing Inter. A new `text-display` (28px) covers hero figures such as `CashRunwayPosition`'s balance.
- **Container-responsive:** `DialogFooter` places its buttons side by side while they fit and stacks them, primary on top, when they don't, whatever the viewport. `PageContainer`'s gutter follows the width it is given. `PanelButton` shrinks with its row (down to 80px wide) instead of staying 124×72. `TablePaginationFooter` hides its "Showing" and "Rows" labels by its own width.
- `AgedReceivablesReport` prints each bucket's total and share without the shaded bars, per the black-ink rule for documents.
- `RecentActivityFeed` no longer throws on an empty status.
