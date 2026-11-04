# InputOTP

One-time-code input built on input-otp: grouped slots with an optional separator.

```tsx
import { InputOTP } from "@cynco-labs/ui";
```

## Usage

```tsx
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@cynco-labs/ui";
import { useState } from "react";

export default function InputOTPDemo() {
	const [s, setS] = useState("3141");
	return (
		<InputOTP maxLength={6} value={s} onChange={setS} aria-label="Verification code">
			<InputOTPGroup>
				{[0, 1, 2].map((i) => (
					<InputOTPSlot key={i} index={i} />
				))}
			</InputOTPGroup>
			<InputOTPSeparator />
			<InputOTPGroup>
				{[3, 4, 5].map((i) => (
					<InputOTPSlot key={i} index={i} />
				))}
			</InputOTPGroup>
		</InputOTP>
	);
}
```

## Use

Sign-in OTP entry.

## Props

`maxLength`, `value`, `onChange`; children `InputOTPGroup` of `InputOTPSlot index`, `InputOTPSeparator`.

- `containerClassName?`: `string`
- Also accepts `ComponentProps<typeof OTPInput>`.

## Accessibility

The slots are plain divs that paint the character and a blinking fake caret; the real control is the single input rendered by the input-otp package, so aria-label, autoComplete="one-time-code" and any error wiring belong on InputOTP itself. The separator carries role="separator", and the whole group dims when that input is disabled.

Category: Components · Inputs. Source: `packages/ui/src/base/components/ui/input-otp.tsx:8-23`.
