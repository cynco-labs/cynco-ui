import { Loader } from "@cynco-labs/ui/ai";

export default function LoaderDemo() {
	return (
		<div className="flex flex-wrap items-center gap-2">
			<Loader size={14} />
			<Loader size={20} />
			<span className="text-sm text-subtle">Thinking…</span>
		</div>
	);
}
