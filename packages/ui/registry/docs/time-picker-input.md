# TimePickerInput

A two-digit time segment input (hours, minutes, 12-hour) with arrow-key stepping.

```tsx
import { TimePickerInput } from "@cynco-labs/ui";
```

## Usage

```tsx
import { useState } from "react";
import { TimePickerInput } from "@cynco-labs/ui";

export default function TimePickerInputDemo() {
	const [s, setS] = useState(new Date(2026, 9, 29, 9, 30));
	return (
		<div className="flex flex-wrap items-center gap-2">
			<TimePickerInput picker="hours" date={s} setDate={setS} />
			<span className="text-tertiary-foreground">:</span>
			<TimePickerInput picker="minutes" date={s} setDate={setS} />
		</div>
	);
}
```

## Use

Composing a time picker; used inside DateInputUnix.

## Props

`picker`, `date`, `setDate`, optional `period`, focus hand-off callbacks.

## Notes

Adapted from openstatusHQ/time-picker (MIT).

Category: Components · Inputs. Source: `packages/ui/src/base/components/general/time-picker-input.tsx`.
