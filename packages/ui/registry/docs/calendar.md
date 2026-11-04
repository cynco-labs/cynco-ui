# Calendar

Month calendar on react-day-picker 8, selected day filled with `primary`.

```tsx
import { Calendar } from "@cynco-labs/ui";
```

## Usage

```tsx
import { Calendar } from "@cynco-labs/ui";
import { useState } from "react";

export default function CalendarDemo() {
	const [s, setS] = useState<Date | undefined>(new Date(2026, 9, 29));
	return (
		<Calendar
			mode="single"
			selected={s}
			onSelect={setS}
			defaultMonth={new Date(2026, 9, 1)}
			className="w-fit rounded-lg border bg-interactive-secondary"
		/>
	);
}
```

## Use

Inside date popovers; inline when a date is the main input.

## Props

react-day-picker props: `mode`, `selected`, `onSelect`, `defaultMonth`, `disabled`.

## Accessibility

The dropdown caption renders an sr-only aria-live="polite" element holding the month name, which also labels the month grid, so paging announces the new month. The previous and next buttons take their names from react-day-picker's own labelPrevious and labelNext, and the month and year selects from labelMonthDropdown and labelYearDropdown, so a localised picker stays localised. Every chevron is aria-hidden and each day button keeps its own focus ring.

## Notes

Outside days shown by default.

Category: Components · Inputs. Source: `packages/ui/src/base/components/ui/calendar.tsx:133-196`.
