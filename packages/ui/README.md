# @cynco-labs/ui

Cynco's design system for accounting and ERP interfaces.

```bash
pnpm add @cynco-labs/ui @phosphor-icons/react react react-dom
```

```css
@import "tailwindcss";
@import "@cynco-labs/ui/fonts.css"; /* optional */
@import "@cynco-labs/ui/theme.css";
```

Or, without Tailwind: `import "@cynco-labs/ui/styles.css";`

```tsx
import { Button, DataList, TaxInvoiceDocument, formatCurrency } from "@cynco-labs/ui";
import { Conversation, PromptInput } from "@cynco-labs/ui/ai";
```

The `/ai` entry needs its own peers: `pnpm add ai streamdown shiki use-stick-to-bottom tokenlens nanoid @xyflow/react`.

Themes: light by default; add `class="dark"` or `data-theme="dark" | "modern" | "modern-dark"` on a parent.

CLI: `npx cynco-ui list`, `npx cynco-ui docs data-list`, `npx cynco-ui search payslip`.

Docs for every component: see the docs site, or `registry/docs/<slug>.md` in this package.
