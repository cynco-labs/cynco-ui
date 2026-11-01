---
title: Installation
description: Install @cynco-labs/ui, set up Tailwind CSS or the standalone stylesheet, fonts, themes and providers.
---

Cynco UI is one package, `@cynco-labs/ui`: React 19 components styled with Tailwind CSS v4 and a set of CSS variables. AI chat and workflow components ship in the same package under `@cynco-labs/ui/ai`.

## Install

```bash
pnpm add @cynco-labs/ui @phosphor-icons/react
```

```bash
npm install @cynco-labs/ui @phosphor-icons/react
```

The package is published with restricted access to the `@cynco-labs` npm organisation. Sign in with `npm login` using an account in the organisation, or add a token to your project's `.npmrc`:

```ini
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

### Peer dependencies

| Package | Version | Why |
| --- | --- | --- |
| `react`, `react-dom` | 19 | Components use React 19 APIs. |
| `@phosphor-icons/react` | 2.1 or later | The icon set used by components and in every example. |

Everything else (Base UI, TanStack Table, Recharts, cmdk, date-fns and so on) is a regular dependency and installs with the package. Charts are built with `recharts` and data tables with `@tanstack/react-table`; add them to your app when you build your own charts or tables, as the examples do.

## Tailwind CSS v4

Import Tailwind, then the Cynco UI theme, in your main stylesheet:

```css
@import "tailwindcss";
@import "@cynco-labs/ui/theme.css";
```

`theme.css` brings the design tokens (colours, radii, shadows, type sizes), maps them into Tailwind's theme so utilities such as `bg-card`, `text-tertiary-foreground` and `border-table-row-divider` exist in your own markup, adds the base styles and tells Tailwind to scan the package, so every class a component uses is generated. There is no `content` configuration to maintain.

Then use components anywhere:

```tsx
import { Button, StatusChip } from "@cynco-labs/ui";

export function InvoiceActions() {
	return (
		<div className="flex items-center gap-2">
			<StatusChip tone="green" glyph="check">
				Paid
			</StatusChip>
			<Button variant="primary">Record payment</Button>
		</div>
	);
}
```

## Without Tailwind

Apps that don't use Tailwind can import the precompiled stylesheet once, at the root of the app. It contains the tokens, base styles and every class the components use:

```ts
import "@cynco-labs/ui/styles.css";
```

Your own markup can still use the CSS variables (`var(--foreground)`, `var(--card)`, `var(--primary)`), but only the utility classes that the components themselves use are included.

## Fonts

The UI face is **Inter**; IDs, account codes and code use **JetBrains Mono**. Documents can also use **Geist** and **Newsreader**. All four are bundled (latin subsets, SIL Open Font License). Import them before the theme:

```css
@import "tailwindcss";
@import "@cynco-labs/ui/fonts.css";
@import "@cynco-labs/ui/theme.css";
```

If you already load Inter (for example from your own CDN), skip `fonts.css`: the theme only names the families.

## Dark mode and themes

Light is the default. Themes are CSS variables switched by a class or a `data-theme` attribute, so you can theme the whole page or a single subtree:

| Theme | Class | Attribute |
| --- | --- | --- |
| Light (default) | `light` or none | `data-theme="light"` |
| Dark | `dark` | `data-theme="dark"` |
| Modern (white and near-black grounds) | `preset-modern` | `data-theme="modern"` |
| Modern dark | `preset-modern dark` | `data-theme="modern-dark"` |

```html
<html class="dark">
```

Tailwind's `dark:` variant follows the same class and attribute. Printed documents always stay black on white, whatever the app theme.

## Providers

Most components work on their own. A few features need a provider near the root of your app:

| Provider | When |
| --- | --- |
| `TooltipProvider` | Wrap the app once so tooltips share a delay and only one shows at a time. A lone `Tooltip` brings its own. |
| `UndoToastProvider` | Before using `useUndoToast()` for undoable bulk actions. |
| `DensityProvider` | To set compact, default or comfortable rows for every `DataList` inside (pair with `DensityToggle`). |
| `DocumentBrandProvider` | Company details, logo, layout and language for every printed document inside. |

```tsx
import { TooltipProvider, UndoToastProvider } from "@cynco-labs/ui";

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<TooltipProvider>
			<UndoToastProvider>{children}</UndoToastProvider>
		</TooltipProvider>
	);
}
```

## AI components

Chat, reasoning, tool-call and workflow-canvas components are a separate entry point so apps that don't use them never load their dependencies:

```tsx
import { Conversation, Message, MessageContent, PromptInput } from "@cynco-labs/ui/ai";
```

`Canvas` imports React Flow's stylesheet (`@xyflow/react/dist/style.css`), so your bundler must handle CSS imports from JavaScript. Vite, Next.js and Astro do.

## Framework notes

- **Next.js App Router:** components are client components; use them from files marked `"use client"`, or wrap them in your own client components.
- **Vite, Remix, Astro:** no extra setup. In Astro, render interactive components with a `client:` directive.
- **Server rendering:** components render on the server; overlays (dialogs, sheets, menus) portal to `document.body` when they open.
