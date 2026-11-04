# TimePickerInput

A two-digit time segment input (hours, minutes, 12-hour) with arrow-key stepping.

```tsx
import { TimePickerInput } from "@cynco-labs/ui";
```

## Usage

```tsx
import { TimePickerInput } from "@cynco-labs/ui";
import { useState } from "react";

export default function TimePickerInputDemo() {
	const [s, setS] = useState<Date | undefined>(new Date(2026, 9, 29, 9, 30));
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

- `picker`: `"minutes" | "seconds" | "hours" | "12hours"`
- `date`: `Date`. Default `new Date(new Date().setHours(0, 0, 0, 0))`.
- `setDate`: `(date: Date | undefined) => void`
- `period?`: `"AM" | "PM"`
- `onRightFocus?`: `() => void`
- `onLeftFocus?`: `() => void`
- Also accepts `InputHTMLAttributes<HTMLInputElement>`.

## Accessibility

| Key | Does |
| --- | --- |
| Arrow Up / Arrow Down | Step the segment up or down by one. |
| Arrow Left / Arrow Right | Move focus to the previous or next segment. |
| 0 to 9 | Type the segment two digits at a time, then move focus on to the next one. |
| Tab | Leaves the segment, as do modifier chords such as paste and select all. |

Each segment is an input named for its own kind, so it is announced as "Hours", "Minutes" or "Seconds", and it falls back to a generated id and the picker name when the caller gives neither. The caret is hidden and every key other than Tab and modifier chords is handled by the component, so the value only changes through the arrow and digit keys. The file adds no live region, so announcing the assembled time is the surrounding control's job.

## Notes

Adapted from openstatusHQ/time-picker (MIT).

Category: Components · Inputs. Source: `packages/ui/src/base/components/general/time-picker-input.tsx:29-142`.
