import { cn } from "../../lib/utils";

export const StepBadge = ({ children, className, ...props }: React.ComponentProps<"div">) => {
	return (
		<div
			data-slot="step-badge"
			className={cn(
				"w-6 h-6 p-2.5 bg-interactive-secondary rounded-md shadow-bevel border inline-flex justify-center items-center gap-2.5",
				className,
			)}
			{...props}
		>
			<div className="justify-start text-primary text-sm font-semibold">{children}</div>
		</div>
	);
};
