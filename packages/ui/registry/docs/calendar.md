# Calendar

Month calendar on react-day-picker 8, selected day filled with `primary`.

```tsx
import { Calendar } from "@cynco-labs/ui";
```

## Usage

```tsx
import { useState } from "react";
import { Calendar } from "@cynco-labs/ui";

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

## Notes

Outside days shown by default.

Category: Components · Inputs. Source: `packages/ui/src/base/components/ui/calendar.tsx`.
