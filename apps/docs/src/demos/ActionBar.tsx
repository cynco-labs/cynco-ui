import { useState } from "react";
import { ActionBar, Button, ScrollRow } from "@cynco-labs/ui";

const tabs = [
	"All",
	"Draft",
	"Pending",
	"Partially paid",
	"Overdue",
	"Paid",
	"Voided",
	"Cancelled",
	"Refunded",
];

export default function ActionBarDemo() {
	const [s, setS] = useState("Overdue");
	return (
		<div className="flex flex-col gap-3">
			<ActionBar>
				<Button variant="primary" size="sm">
					New invoice
				</Button>
				<Button variant="secondary" size="sm">
					Import
				</Button>
				<Button variant="secondary" size="sm">
					Export CSV
				</Button>
				<Button variant="skeleton" size="sm">
					Columns
				</Button>
			</ActionBar>
			<ScrollRow role="tablist" aria-label="Status">
				{tabs.map((t) => (
					<Button
						key={t}
						role="tab"
						aria-selected={s === t}
						variant={s === t ? "secondary" : "skeleton"}
						size="sm"
						onClick={() => {
							setS(t);
						}}
					>
						{t}
					</Button>
				))}
			</ScrollRow>
		</div>
	);
}
