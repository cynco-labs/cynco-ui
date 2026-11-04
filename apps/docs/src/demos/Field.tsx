import { Field, FieldControl, FieldDescription, FieldError, FieldLabel, Input } from "@cynco-labs/ui";
import { useState } from "react";

export default function FieldDemo() {
	const [code, setCode] = useState("");
	const invalid = code.trim().length > 0 && !/^\d{4}$/.test(code.trim());

	return (
		<div className="flex max-w-[320px] flex-col gap-4">
			<Field invalid={invalid}>
				<FieldLabel required hint="Unique within your chart of accounts">
					Account code
				</FieldLabel>
				<FieldDescription>Four digits, e.g. 4000 for revenue.</FieldDescription>
				<FieldControl>
					<Input inputMode="numeric" placeholder="e.g. 4000" value={code} onChange={(e) => setCode(e.target.value)} />
				</FieldControl>
				{invalid && <FieldError>Enter exactly four digits.</FieldError>}
			</Field>

			<Field>
				<FieldLabel>Display name</FieldLabel>
				<FieldDescription>Printed on invoices and statements.</FieldDescription>
				<FieldControl>
					<Input placeholder="e.g. Nusantara Logistik Bhd" />
				</FieldControl>
			</Field>
		</div>
	);
}
