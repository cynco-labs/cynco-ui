# DateInputUnix

A date (and optional time) picker whose value is a Unix timestamp in milliseconds.

```tsx
import { DateInputUnix } from "@cynco-labs/ui";
```

## Usage

```tsx
import { useState } from "react";
import { DateInputUnix } from "@cynco-labs/ui";

export default function DateInputUnixDemo() {
	const [s, setS] = useState(1798761600000);
	return (
		<div className="max-w-[260px]">
			<DateInputUnix unixDate={s} setUnixDate={setS} />
		</div>
	);
}
```

## Use

Due dates, schedule dates, backdating.

## Props

`unixDate` (ms or null), `setUnixDate`; optional `withTime`, `use24Hour`, `disablePastDates`, `minUnixDate`/`maxUnixDate`, `placeholder`.

- `unixDate`: `number | null`
- `setUnixDate`: `(unixDate: number | null) => void`
- `disabled?`: `boolean`
- `disablePastDates?`: `boolean`
- `disableFutureDates?`: `boolean`
- `minUnixDate?`: `number`
- `maxUnixDate?`: `number`
- `fromYear?`: `number`
- `withTime?`: `boolean`
- `use24Hour?`: `boolean`. Show 24-hour clock (00–23) instead of 12-hour with AM/PM.
- `placeholder?`: `string`. Override the empty-state label (e.g. "Now" when null means immediate).
- Also accepts `ComponentProps<"button">`.

## Notes

Opens a Calendar in a Popover.

Category: Components · Inputs. Source: `packages/ui/src/base/components/general/date-input-unix.tsx`.
