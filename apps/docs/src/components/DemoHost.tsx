import { DensityProvider, TooltipProvider } from "@cynco-labs/ui";
import { Component, Suspense, lazy, useEffect, useMemo, useState, useSyncExternalStore, type ComponentType, type ReactNode } from "react";
import { resolveControls, type ControlValues, type Controls, type DemoPropsMessage } from "../lib/controls";
import { DEFAULT_SETTINGS, onSettings, readSettings, type SiteSettings } from "../lib/settings";

interface DemoModule {
	default: ComponentType<ControlValues>;
	controls?: Controls;
}

const modules = import.meta.glob<DemoModule>("../demos/*.tsx");

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

let cached: SiteSettings | null = null;
const subscribe = (onChange: () => void) =>
	onSettings((s) => {
		// Demos read only density and locale; keeping the snapshot otherwise lets React skip the re-render.
		if (!cached || cached.density !== s.density || cached.locale !== s.locale) cached = s;
		onChange();
	});
const snapshot = () => (cached ??= readSettings());
const serverSnapshot = () => DEFAULT_SETTINGS;

function useSiteSettings() {
	return useSyncExternalStore(subscribe, snapshot, serverSnapshot);
}

/** Control values set by hand on the component page, posted into the iframe. */
function useOverrides(): ControlValues {
	const [overrides, setOverrides] = useState<ControlValues>({});
	useEffect(() => {
		const onMessage = (e: MessageEvent<DemoPropsMessage>) => {
			if (e.source === window.parent && e.data?.type === "cynco-demo-props") setOverrides(e.data.overrides);
		};
		window.addEventListener("message", onMessage);
		// Ask the page for anything set before this demo hydrated.
		if (window.parent !== window) window.parent.postMessage({ type: "cynco-demo-ready" }, location.origin);
		return () => window.removeEventListener("message", onMessage);
	}, []);
	return overrides;
}

/**
 * Renders one demo from src/demos by component name, inside the site settings (density, document language)
 * and the demo's own controls. Used by /demo/<slug> (the iframe in every preview) and inline on the home page.
 */
export default function DemoHost({ name }: { name: string }) {
	const Demo = useMemo(() => {
		const load = modules[`../demos/${name}.tsx`];
		if (!load) throw new Error(`No demo for ${name}`);
		return lazy(async () => {
			const mod = await load();
			function Configured() {
				const settings = useSiteSettings();
				const overrides = useOverrides();
				const Body = mod.default;
				return (
					<DensityProvider density={settings.density}>
						<Body {...resolveControls(mod.controls, settings, overrides)} />
					</DensityProvider>
				);
			}
			return { default: Configured };
		});
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
