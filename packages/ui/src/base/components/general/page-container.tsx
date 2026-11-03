import { cn } from "../../lib/utils";

export function PageContainer({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				// Percentage padding resolves against the parent's width, so the gutter follows the space the page gets.
				"flex flex-col gap-4 relative w-full pb-8 max-w-[1600px] mx-auto pt-[clamp(1rem,3%,2rem)] px-[clamp(1rem,4%,2.5rem)]",
				className,
			)}
			{...props}
		/>
	);
}
