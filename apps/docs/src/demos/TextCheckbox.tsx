import { useState } from "react";
import { TextCheckbox } from "@cynco-labs/ui";

export default function TextCheckboxDemo() {
	const [s, setS] = useState(true);
	return (
		<TextCheckbox checked={s} onCheckedChange={setS}>
			Round totals to the nearest 5 sen
		</TextCheckbox>
	);
}
