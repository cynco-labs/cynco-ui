import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";
import { renderProp } from "../../lib/render";

function Collapsible({ asChild, children, render, ...props }: CollapsiblePrimitive.Root.Props & { asChild?: boolean }) {
	const element = renderProp(asChild, children, render);
	return (
		<CollapsiblePrimitive.Root
			data-slot="collapsible"
			render={element}
			{...props}
			{...(element === children ? {} : { children })}
		/>
	);
}

function CollapsibleTrigger({
	asChild,
	children,
	render,
	...props
}: CollapsiblePrimitive.Trigger.Props & { asChild?: boolean }) {
	const element = renderProp(asChild, children, render);
	return (
		<CollapsiblePrimitive.Trigger
			data-slot="collapsible-trigger"
			render={element}
			{...props}
			{...(element === children ? {} : { children })}
		/>
	);
}

function CollapsibleContent({
	asChild,
	children,
	render,
	...props
}: CollapsiblePrimitive.Panel.Props & { asChild?: boolean }) {
	const element = renderProp(asChild, children, render);
	return (
		<CollapsiblePrimitive.Panel
			data-slot="collapsible-content"
			render={element}
			{...props}
			{...(element === children ? {} : { children })}
		/>
	);
}

export { Collapsible, CollapsibleContent, CollapsibleTrigger };
