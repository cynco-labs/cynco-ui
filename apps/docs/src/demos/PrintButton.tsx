import { PrintButton } from "@cynco-labs/ui";
import { useState } from "react";

export default function PrintButtonDemo() {
	const [n, setN] = useState(0);
	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-wrap items-center gap-2">
				<PrintButton
					onPrint={() => {
						setN((x) => x + 1);
					}}
				/>
				<PrintButton
					variant="primary"
					onPrint={() => {
						setN((x) => x + 1);
					}}
				>
					Download PDF
				</PrintButton>
				<PrintButton
					showShortcut={false}
					onPrint={() => {
						setN((x) => x + 1);
					}}
				>
					Print receipt
				</PrintButton>
			</div>
			<p className="text-xs text-tertiary-foreground" role="status">
				{n
					? `onPrint called ${n}× (here instead of window.print())`
					: "Try: click, or press Ctrl/⌘+P — with onPrint set, the shortcut runs it instead of the browser dialog"}
			</p>
		</div>
	);
}
