import { useState } from "react";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@cynco-labs/ui";

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
