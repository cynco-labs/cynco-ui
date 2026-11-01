import { TooltipProvider } from "@cynco-labs/ui";
import { Component, Suspense, lazy, useEffect, useMemo, type ComponentType, type ReactNode } from "react";

const modules = import.meta.glob<{ default: ComponentType }>("../demos/*.tsx");

class Boundary extends Component<{ name: string; children: ReactNode }, { error: Error | null }> {
	state = { error: null as Error | null };
	static getDerivedStateFromError(error: Error) {
		return { error };
	}
	componentDidCatch(error: Error) {
		console.error(`[demo ${this.props.name}]`, error);
		document.body.dataset.demoError = error.message;
	}
	render() {
		if (this.state.error)
			return (
				<div role="alert" className="rounded-lg border border-border p-4 text-sm text-error-text">
					This demo failed to render: {this.state.error.message}
				</div>
			);
		return this.props.children;
	}
}

function Ready({ children }: { children: ReactNode }) {
	useEffect(() => {
		requestAnimationFrame(() => {
			document.body.dataset.ready = "true";
		});
	}, []);
	return <>{children}</>;
}

/** Renders one demo from src/demos by component name. Used by /demo/<slug> (the iframe in every preview). */
export default function DemoHost({ name }: { name: string }) {
	const Demo = useMemo(() => {
		const load = modules[`../demos/${name}.tsx`];
		if (!load) throw new Error(`No demo for ${name}`);
		return lazy(load);
	}, [name]);
	return (
		<TooltipProvider>
			<Boundary name={name}>
				<Suspense fallback={null}>
					<Ready>
						<Demo />
					</Ready>
				</Suspense>
			</Boundary>
		</TooltipProvider>
	);
}
