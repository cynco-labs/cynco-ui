/**
 * Cynco UI — navigation productivity: the ⌘K command palette, the "?" shortcuts sheet with
 * two-key "g then i" jumps, and saved views for any list.
 *
 * Route names, keybinds and keywords follow Cynco's command registry
 * (remix/app/services/commands/navigationCatalog.*.ts and shortcuts.ts), so these can replace
 * KumoSearchPalette / KeyboardShortcutsSheet without retraining anyone's fingers.
 */

export type {
	CommandPaletteItem,
	CommandPaletteProps,
	CommandPaletteRecord,
	CommandPaletteRecordType,
	CommandPaletteTriggerProps,
} from "./command-palette";
export { CommandPalette, CommandPaletteTrigger } from "./command-palette";
export type { SavedView, SavedViewFilter, SavedViewsBarProps } from "./saved-views-bar";
export { SavedViewsBar } from "./saved-views-bar";
export type { ShortcutsDialogItem, ShortcutsDialogProps, ShortcutsDialogSection } from "./shortcuts-dialog";
export { ShortcutsDialog } from "./shortcuts-dialog";
export { useGoToShortcuts } from "./use-go-to-shortcuts";
