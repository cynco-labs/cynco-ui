import { Button, UndoToastProvider, useUndoToast } from "@cynco-labs/ui";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

type Handlers = { onUndo: () => void; onCommit: () => void; duration?: number };

function Fixture({ onUndo, onCommit, duration }: Handlers) {
	const { show } = useUndoToast();
	return (
		<Button onClick={() => show({ message: "2 invoices voided", onUndo, onCommit, duration })}>Void</Button>
	);
}

/** Shows the toast on mount, so a timer test needs no pointer events while the clock is faked. */
function ShownOnMount({ onUndo, onCommit, duration }: Handlers) {
	const { show } = useUndoToast();
	const shown = React.useRef(false);
	React.useEffect(() => {
		if (shown.current) return;
		shown.current = true;
		show({ message: "2 invoices voided", onUndo, onCommit, duration });
	}, [show, onUndo, onCommit, duration]);
	return null;
}

function setupShown(handlers: Handlers) {
	return render(
		<UndoToastProvider>
			<ShownOnMount {...handlers} />
		</UndoToastProvider>,
	);
}

function setup(handlers: Handlers, providerDuration?: number) {
	return render(
		<UndoToastProvider duration={providerDuration}>
			<Fixture {...handlers} />
		</UndoToastProvider>,
	);
}

const voidButton = () => screen.getByRole("button", { name: "Void" });
const undoButton = () => screen.getByRole("button", { name: /Undo/ });

describe("UndoToast", () => {
	test("the toast offers Undo instead of asking first, and does not write until it closes", async () => {
		const user = userEvent.setup();
		const onUndo = vi.fn();
		const onCommit = vi.fn();
		setup({ onUndo, onCommit });

		await user.click(voidButton());

		expect(screen.getByText("2 invoices voided")).toBeDefined();
		expect(onCommit).not.toHaveBeenCalled();
	});

	test("the Undo button puts things back and never commits", async () => {
		const user = userEvent.setup();
		const onUndo = vi.fn();
		const onCommit = vi.fn();
		setup({ onUndo, onCommit });

		await user.click(voidButton());
		await user.click(undoButton());

		expect(onUndo).toHaveBeenCalledTimes(1);
		expect(onCommit).not.toHaveBeenCalled();
		await waitFor(() => expect(screen.queryByText("2 invoices voided")).toBeNull());
	});

	test("Undo is reachable from the keyboard: F8 moves to it, Enter runs it", async () => {
		const user = userEvent.setup();
		const onUndo = vi.fn();
		const onCommit = vi.fn();
		setup({ onUndo, onCommit });

		await user.click(voidButton());
		await user.keyboard("{F8}");

		await waitFor(() => expect(document.activeElement).toBe(undoButton()));
		await user.keyboard("{Enter}");

		expect(onUndo).toHaveBeenCalledTimes(1);
		expect(onCommit).not.toHaveBeenCalled();
	});

	test("Ctrl/Cmd+Z undoes the toast from anywhere on the page", async () => {
		const user = userEvent.setup();
		const onUndo = vi.fn();
		const onCommit = vi.fn();
		setup({ onUndo, onCommit });

		await user.click(voidButton());
		await user.keyboard("{Control>}z{/Control}");

		expect(onUndo).toHaveBeenCalledTimes(1);
		expect(onCommit).not.toHaveBeenCalled();
	});

	test("Dismiss closes the toast and commits the write", async () => {
		const user = userEvent.setup();
		const onUndo = vi.fn();
		const onCommit = vi.fn();
		setup({ onUndo, onCommit });

		await user.click(voidButton());
		await user.click(screen.getByRole("button", { name: "Dismiss" }));

		expect(onCommit).toHaveBeenCalledTimes(1);
		expect(onUndo).not.toHaveBeenCalled();
		await waitFor(() => expect(screen.queryByText("2 invoices voided")).toBeNull());
	});

	test("with no duration the toast waits indefinitely, so a slow reader keeps Undo", () => {
		vi.useFakeTimers();
		try {
			const onUndo = vi.fn();
			const onCommit = vi.fn();
			setupShown({ onUndo, onCommit });

			act(() => void vi.advanceTimersByTime(60_000));

			expect(screen.getByText("2 invoices voided")).toBeDefined();
			expect(onCommit).not.toHaveBeenCalled();
		} finally {
			vi.useRealTimers();
		}
	});

	describe("with an explicit duration", () => {
		beforeEach(() => vi.useFakeTimers());
		afterEach(() => vi.useRealTimers());

		test("the countdown commits the write and closes the toast", () => {
			const onUndo = vi.fn();
			const onCommit = vi.fn();
			setupShown({ onUndo, onCommit, duration: 4000 });

			expect(screen.getByText("2 invoices voided")).toBeDefined();

			act(() => void vi.advanceTimersByTime(4000));

			expect(onCommit).toHaveBeenCalledTimes(1);
			expect(onUndo).not.toHaveBeenCalled();
			expect(screen.queryByText("2 invoices voided")).toBeNull();
		});

		test("undoing before the countdown ends cancels the write", () => {
			const onUndo = vi.fn();
			const onCommit = vi.fn();
			setupShown({ onUndo, onCommit, duration: 4000 });

			act(() => void vi.advanceTimersByTime(2000));
			act(() => undoButton().click());
			act(() => void vi.advanceTimersByTime(10_000));

			expect(onUndo).toHaveBeenCalledTimes(1);
			expect(onCommit).not.toHaveBeenCalled();
		});
	});
});
