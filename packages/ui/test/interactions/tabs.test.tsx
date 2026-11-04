import { Tabs, TabsContent, TabsList, TabsTrigger } from "@cynco-labs/ui";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { describe, expect, test, vi } from "vitest";

function Fixture(props: {
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: unknown) => void;
}) {
	return (
		<Tabs {...props}>
			<TabsList>
				<TabsTrigger value="overview">Overview</TabsTrigger>
				<TabsTrigger value="lines">Lines</TabsTrigger>
				<TabsTrigger value="audit">Audit</TabsTrigger>
			</TabsList>
			<TabsContent value="overview">Overview panel</TabsContent>
			<TabsContent value="lines">Lines panel</TabsContent>
			<TabsContent value="audit">Audit panel</TabsContent>
		</Tabs>
	);
}

/**
 * The panels a user can actually read. A panel leaving the screen stays mounted through its
 * close transition, marked `inert`, so "the other panels are gone" is a question about what
 * is reachable, not about what is in the DOM.
 */
const readablePanels = () =>
	Array.from(document.querySelectorAll<HTMLElement>('[role="tabpanel"]'))
		.filter((p) => !p.hasAttribute("inert") && !p.hasAttribute("hidden"))
		.map((p) => p.textContent);

describe("Tabs", () => {
	test("shows only the active tab's panel", () => {
		render(<Fixture defaultValue="lines" />);

		expect(readablePanels()).toEqual(["Lines panel"]);
	});

	test("arrow keys move focus between tabs", async () => {
		const user = userEvent.setup();
		render(<Fixture defaultValue="overview" />);

		await user.tab();
		expect(document.activeElement).toBe(
			screen.getByRole("tab", { name: "Overview" }),
		);

		await user.keyboard("{ArrowRight}");
		expect(document.activeElement).toBe(
			screen.getByRole("tab", { name: "Lines" }),
		);

		await user.keyboard("{ArrowRight}");
		expect(document.activeElement).toBe(
			screen.getByRole("tab", { name: "Audit" }),
		);

		await user.keyboard("{ArrowLeft}");
		expect(document.activeElement).toBe(
			screen.getByRole("tab", { name: "Lines" }),
		);
	});

	test("arrow keys wrap around the ends of the list", async () => {
		const user = userEvent.setup();
		render(<Fixture defaultValue="overview" />);

		await user.tab();
		await user.keyboard("{ArrowLeft}");
		expect(document.activeElement).toBe(
			screen.getByRole("tab", { name: "Audit" }),
		);

		await user.keyboard("{ArrowRight}");
		expect(document.activeElement).toBe(
			screen.getByRole("tab", { name: "Overview" }),
		);
	});

	// Manual activation (ARIA APG): arrows move focus, Enter or Space selects. Arrowing
	// through tabs must not swap panels, or a keyboard user mounts every panel in passing.
	test("arrowing leaves the panel alone until Enter activates the focused tab", async () => {
		const user = userEvent.setup();
		render(<Fixture defaultValue="overview" />);

		await user.tab();
		await user.keyboard("{ArrowRight}");
		expect(readablePanels()).toEqual(["Overview panel"]);

		await user.keyboard("{Enter}");
		expect(readablePanels()).toEqual(["Lines panel"]);
		expect(
			screen.getByRole("tab", { name: "Lines" }).getAttribute("aria-selected"),
		).toBe("true");
	});

	test("Space activates the focused tab", async () => {
		const user = userEvent.setup();
		render(<Fixture defaultValue="overview" />);

		await user.tab();
		await user.keyboard("{ArrowRight}{ArrowRight}");
		await user.keyboard(" ");

		expect(readablePanels()).toEqual(["Audit panel"]);
	});

	test("the tab list is one Tab stop: Tab leaves it rather than walking the tabs", async () => {
		const user = userEvent.setup();
		render(
			<>
				<Fixture defaultValue="overview" />
				<button type="button">After</button>
			</>,
		);

		await user.tab();
		expect(document.activeElement).toBe(
			screen.getByRole("tab", { name: "Overview" }),
		);

		await user.tab();
		expect(document.activeElement).not.toBe(
			screen.getByRole("tab", { name: "Lines" }),
		);
	});

	test("controlled value round-trips through onValueChange", async () => {
		const user = userEvent.setup();
		const onValueChange = vi.fn();

		function Controlled() {
			const [value, setValue] = React.useState("overview");
			return (
				<Fixture
					value={value}
					onValueChange={(next) => {
						onValueChange(next);
						setValue(next as string);
					}}
				/>
			);
		}
		render(<Controlled />);

		await user.click(screen.getByRole("tab", { name: "Audit" }));

		expect(onValueChange.mock.calls[0]?.[0]).toBe("audit");
		expect(readablePanels()).toEqual(["Audit panel"]);
	});

	test("a controlled value the parent refuses to change keeps the panel put", async () => {
		const user = userEvent.setup();
		const onValueChange = vi.fn();
		render(<Fixture value="overview" onValueChange={onValueChange} />);

		await user.click(screen.getByRole("tab", { name: "Lines" }));

		expect(onValueChange.mock.calls[0]?.[0]).toBe("lines");
		expect(readablePanels()).toEqual(["Overview panel"]);
	});
});
