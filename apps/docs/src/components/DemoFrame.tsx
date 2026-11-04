import { DensityProvider, TooltipProvider } from "@cynco-labs/ui";
import { Component, type ComponentType, type ReactNode, useEffect, useState, useSyncExternalStore } from "react";
import { type Controls, type ControlValues, type DemoPropsMessage, isToggle, resolveControls } from "../lib/controls";
import { DEFAULT_SETTINGS, onSettings, readSettings, type SiteSettings } from "../lib/settings";

/** A demo module: the component and its optional playground controls. */
export interface DemoModule {
	default: ComponentType<ControlValues>;
	controls?: Controls;
}

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
 * Renders one demo inside the site settings (density, document language) and the demo's own controls.
 * Each generated island in src/islands imports its demo statically and renders it through this frame, so
 * /demo/<slug> and the home page ship only that demo's code.
 *
 * `matrix` names one of the demo's select controls and renders the demo once per option, labelled. The
 * component page frames that in /matrix/<slug>, so a reader sees every variant without clicking through.
 */
export function DemoFrame({ name, mod, matrix }: { name: string; mod: DemoModule; matrix?: string }) {
	const settings = useSiteSettings();
	const overrides = useOverrides();
	const Body = mod.default;
	const values = resolveControls(mod.controls, settings, overrides);
	const control = matrix ? mod.controls?.[matrix] : undefined;
	return (
		<TooltipProvider>
			<Boundary name={name}>
				<Ready>
					<DensityProvider density={settings.density}>
						{control && !isToggle(control) ? (
							<div className="cy-matrix">
								{control.options.map((option) => (
									<section key={option.value} className="min-w-0">
										<h2 className="mb-2 text-xs font-medium text-tertiary-foreground">{option.label}</h2>
										<Body {...values} {...{ [matrix as string]: option.value }} />
									</section>
								))}
							</div>
						) : (
							<Body {...values} />
						)}
					</DensityProvider>
				</Ready>
			</Boundary>
		</TooltipProvider>
	);
}
