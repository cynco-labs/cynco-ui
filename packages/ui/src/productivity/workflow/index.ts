/**
 * Cynco UI — workflow quality-of-life primitives.
 *
 * - BulkActionBar: what you can do with the rows you ticked (count, money total, actions, Esc to clear).
 * - UndoToast (+ UndoToastProvider, UndoToastViewport, useUndoToast): "do it, then offer Undo" instead of
 *   "are you sure?" dialogs. The real write happens late, in onCommit, when the toast is dismissed,
 *   pushed out of the stack or (only with an explicit `duration`) times out.
 * - DensityToggle: Compact / Default / Comfortable rows, feeding DensityProvider.
 * - PrintButton: prints the document on screen (documents themselves live in the document kit, ./documents).
 */

export type { BulkAction, BulkActionBarProps } from "./bulk-action-bar";
export { BulkActionBar } from "./bulk-action-bar";
export type { DensityToggleProps } from "./density-toggle";
export { DensityToggle } from "./density-toggle";
export type { PrintButtonProps } from "./print-button";
export { PrintButton } from "./print-button";
export type { UndoToastOptions, UndoToastProps, UndoToastProviderProps, UndoToastViewportProps } from "./undo-toast";
export { UndoToast, UndoToastProvider, UndoToastViewport, useUndoToast } from "./undo-toast";
