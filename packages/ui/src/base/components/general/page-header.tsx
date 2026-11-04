import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

/**
 * Shared page header: leading icon + title on the left, optional actions on
 * the right. Matches Table.Toolbar + Table.Heading styles.
 */
export function PageHeader({
	icon,
	title,
	titleAccessory,
	children,
	className,
	...props
}: Omit<React.ComponentProps<"div">, "title"> & {
	icon: ReactNode;
	title: string;
	titleAccessory?: ReactNode;
}) {
	return (
		<div data-slot="page-header" className={cn("flex flex-wrap items-center gap-2 min-h-10 pb-4", className)} {...props}>
			<div className="flex w-full justify-between items-center">
				<div className="text-muted-foreground text-md py-0 px-2 rounded-lg flex gap-2 items-center">
					{icon}
					<h1>{title}</h1>
					{titleAccessory && <div className="ml-2">{titleAccessory}</div>}
				</div>
				<div className="flex items-center gap-2">{children}</div>
			</div>
		</div>
	);
}
