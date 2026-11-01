import { Button } from "@cynco-labs/ui";
import {
	Plan,
	PlanAction,
	PlanContent,
	PlanDescription,
	PlanFooter,
	PlanHeader,
	PlanTitle,
	PlanTrigger,
} from "@cynco-labs/ui/ai";

export default function PlanDemo() {
	return (
		<Plan defaultOpen className="max-w-[520px]">
			<PlanHeader>
				<div>
					<PlanTitle>Close October 2026</PlanTitle>
					<PlanDescription>3 steps · 2 bank accounts</PlanDescription>
				</div>
				<PlanAction>
					<PlanTrigger />
				</PlanAction>
			</PlanHeader>
			<PlanContent className="text-body">
				<ol className="list-decimal pl-5 flex flex-col gap-1">
					<li>Reconcile Maybank and CIMB</li>
					<li>Post accruals and depreciation</li>
					<li>Lock the period</li>
				</ol>
			</PlanContent>
			<PlanFooter className="px-4">
				<Button variant="primary" size="mini">
					Start close
				</Button>
			</PlanFooter>
		</Plan>
	);
}
