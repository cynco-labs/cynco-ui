import { Skeleton } from "@cynco-labs/ui";

export default function SkeletonDemo() {
	return (
		<div className="flex flex-col gap-2 max-w-[320px]">
			<Skeleton className="h-4 w-3/4" />
			<Skeleton className="h-4 w-1/2" />
			<Skeleton className="h-8 w-full" />
		</div>
	);
}
