import { cn } from "../../lib/utils";

type InfoRowProps = Omit<React.ComponentProps<"div">, "children"> & {
	icon?: React.ReactNode;
	label: string;
	value: React.ReactNode;
	/** Classes for the value (`className` goes on the row). */
	valueClassName?: string;
	mono?: boolean;
};

export function InfoRow({ icon, label, value, className, valueClassName, mono, ...props }: InfoRowProps) {
	const isText = typeof value === "string" || typeof value === "number";
	return (
		<div data-slot="info-row" className={cn("flex items-center gap-2 min-w-0 overflow-hidden", className)} {...props}>
			{icon && (
				<div aria-hidden="true" className="text-subtle shrink-0">
					{icon}
				</div>
			)}
			<div className="flex min-w-0 items-center overflow-hidden">
				<div className="text-tertiary-foreground text-sm font-medium w-24 shrink-0 whitespace-nowrap">{label}</div>
				<div
					className={cn("text-foreground text-sm wrap-break-word", isText && mono && "font-mono text-xs", valueClassName)}
				>
					{value}
				</div>
			</div>
		</div>
	);
}
