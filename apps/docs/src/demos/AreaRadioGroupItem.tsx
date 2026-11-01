import { AreaRadioGroupItem, RadioGroup } from "@cynco-labs/ui";

export default function AreaRadioGroupItemDemo() {
	return (
		<RadioGroup defaultValue="exclusive" className="flex flex-col gap-2 max-w-[440px]">
			<AreaRadioGroupItem
				value="exclusive"
				label="Tax exclusive"
				description="SST is added on top of each line amount."
			/>
			<AreaRadioGroupItem
				value="inclusive"
				label="Tax inclusive"
				description="Line amounts already include SST."
			/>
			<AreaRadioGroupItem
				value="exempt"
				label="Exempt"
				description="Coming soon"
				disabled
				disabledReason="Your business is SST-registered"
			/>
		</RadioGroup>
	);
}
