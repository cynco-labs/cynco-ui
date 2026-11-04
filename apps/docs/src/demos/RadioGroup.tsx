import { RadioGroup, RadioGroupItem } from "@cynco-labs/ui";

export default function RadioGroupDemo() {
	return (
		<RadioGroup defaultValue="immediate" className="flex flex-col gap-2">
			{["immediate", "end_of_cycle", "never"].map((v, i) => (
				<label key={v} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
					<RadioGroupItem value={v} />
					{["Cash basis", "Accrual basis", "Both"][i]}
				</label>
			))}
		</RadioGroup>
	);
}
