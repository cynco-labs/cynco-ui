import * as React from "react";

/**
 * The `render` value for a Base UI component that also accepts Radix's `asChild`, so markup ported from
 * either library keeps working and no component carries its own copy of the rule.
 *
 * With `asChild` and a single element child, that child becomes the rendered element. Otherwise an explicit
 * `render` wins. Otherwise the result is `undefined` and the component renders its own tag.
 *
 * The caller still passes `children` unless the result *is* the children, which is what `asChild` means.
 * An explicit `render` is a different case: the element is a shell and the children go inside it, so
 * `{...(element === children ? {} : { children })}` is the condition, not a plain `element ?`.
 */
export function renderProp<R = React.ReactElement>(
	asChild: boolean | undefined,
	children: React.ReactNode,
	render?: R,
): R | React.ReactElement | undefined {
	return asChild && React.isValidElement(children) ? children : render;
}
