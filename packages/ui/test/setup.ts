import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);

// Layout APIs jsdom lacks. Components only need them to exist; nothing in the tests depends on sizes.
class Observer {
	observe() {}
	unobserve() {}
	disconnect() {}
	takeRecords(): never[] {
		return [];
	}
}
window.ResizeObserver ??= Observer as unknown as typeof ResizeObserver;
window.IntersectionObserver ??= Observer as unknown as typeof IntersectionObserver;
window.matchMedia ??= (query: string) =>
	({ matches: false, media: query, onchange: null, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false }) as MediaQueryList;
Element.prototype.scrollIntoView ??= () => {};
HTMLCanvasElement.prototype.getContext = (() => null) as HTMLCanvasElement["getContext"];

Element.prototype.getAnimations ??= () => [];
