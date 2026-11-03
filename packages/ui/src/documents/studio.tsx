"use client";

/**
 * Cynco UI — Document studio: the brand editor for every printed document.
 *
 * One `DocBrand` (logo, layout, typeface, language, footer note, signature). Documents print in black ink only;
 * the customer's own logo is the only colour on the page. The brand drives invoices, receipts,
 * statements, payslips and reports alike. The studio edits that brand with a live preview of any document,
 * so it can sit in Settings → Documents. It is controlled or uncontrolled and knows nothing about the
 * documents themselves: you pass `documents` as render functions.
 */
import * as React from "react";
import { Button, GroupedTabButton, Input, cn } from "../base";
import { ArrowCounterClockwiseIcon, ImageSquareIcon, PrinterIcon, TrashIcon } from "@phosphor-icons/react";
import { DocumentBrandProvider, ScrollRow, type DocBrand, type DocFont, type DocLayout, type DocLocale, type DocumentStamp, type PaperSize } from "../lib/shared";

/* ═════════════ Types ═════════════ */

export type StudioRenderOptions = { stamp?: DocumentStamp; size?: PaperSize };

export type StudioDocument = {
	id: string;
	label: string;
	/** Render the document with sample (or real) data. The studio wraps it in the brand being edited. */
	render: (opts: StudioRenderOptions) => React.ReactNode;
	/** Paper sizes this document supports; the first is the default. */
	sizes?: PaperSize[];
	/** Stamps worth previewing for this document. */
	stamps?: DocumentStamp[];
};

export type DocumentStudioProps = Omit<React.ComponentProps<"div">, "defaultValue" | "onChange"> & {
	/** Controlled brand. */
	brand?: DocBrand;
	/** Uncontrolled starting brand. */
	defaultBrand?: DocBrand;
	onBrandChange?: (brand: DocBrand) => void;
	documents: StudioDocument[];
	defaultDocumentId?: string;
	/** Called when the user presses Print (defaults to window.print, which prints only the previewed document). */
	onPrint?: () => void;
};

/* ═════════════ Small controls ═════════════ */

/**
 * A labelled control. `htmlFor` makes the label a real `<label>` for a single input; otherwise the label carries
 * `labelId` so a group of buttons can point at it with `aria-labelledby`.
 */
function Field({ label, labelId, htmlFor, children, hint }: { label: string; labelId?: string; htmlFor?: string; children: React.ReactNode; hint?: React.ReactNode }) {
	const labelClass = "text-xs font-medium text-muted-foreground";
	return (
		<div className="flex min-w-0 flex-col gap-1.5">
			<div className="flex items-baseline justify-between gap-2">
				{htmlFor ? (
					<label id={labelId} htmlFor={htmlFor} className={labelClass}>
						{label}
					</label>
				) : (
					<span id={labelId} className={labelClass}>
						{label}
					</span>
				)}
				{hint && <span className="text-2xs text-tertiary-foreground">{hint}</span>}
			</div>
			{children}
		</div>
	);
}

/**
 * Arrow-key movement for a group with one tab stop (APG radio group and tabs): arrows move focus and select,
 * wrapping at the ends; Home / End jump to the first / last. The selected item is the group's only tab stop.
 */
function onRovingKeyDown<T extends string>(e: React.KeyboardEvent<HTMLElement>, role: "radio" | "tab", values: readonly T[], current: T, select: (v: T) => void) {
	if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
	const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
	const at = values.indexOf(current);
	const next = e.key === "Home" ? 0 : e.key === "End" ? values.length - 1 : step ? (at + step + values.length) % values.length : -1;
	if (next < 0 || values.length === 0) return;
	e.preventDefault();
	select(values[next]);
	e.currentTarget.parentElement?.querySelectorAll<HTMLElement>(`[role="${role}"]`)[next]?.focus();
}

/** Thumbnail of a layout: a tiny sheet that shows where colour and weight sit. Decorative: the option's name is its label. */
function LayoutThumb({ layout }: { layout: DocLayout }) {
	const accent = "#1a1a1a";
	const line = (w: string, cls = "") => <div className={cn("h-[3px] rounded-full bg-black/15", cls)} style={{ width: w }} />;
	return (
		<div aria-hidden="true" className="relative flex h-[58px] w-full flex-col gap-[5px] overflow-hidden rounded-[4px] bg-white p-[7px] shadow-[0_0_0_1px_rgba(0,0,0,.08)]">
			{layout === "modern" && (
				<>
										<div className="flex items-start justify-between">
						<div className="size-[10px] border-[1.5px]" style={{ borderColor: accent }} />
						<div className="h-[6px] w-[22px] rounded-[1px] bg-black/70" />
					</div>
					<div className="h-[7px] rounded-[2px]" style={{ borderTop: "1px solid rgba(0,0,0,.12)", borderBottom: "1px solid rgba(0,0,0,.12)" }} />
					<div className="h-[1.5px]" style={{ background: accent }} />
					{line("70%")}
					<div className="ml-auto w-[40%] border-t-[1.5px] pt-[2px]" style={{ borderColor: accent }}><div className="ml-auto h-[4px] w-[60%] rounded-[1px] bg-black/70" /></div>
				</>
			)}
			{layout === "classic" && (
				<>
					<div className="mx-auto size-[10px] rounded-full border" style={{ borderColor: accent }} />
					<div className="flex items-center gap-1">
						<div className="h-px flex-1 bg-black/60" />
						<div className="h-[5px] w-[24px] rounded-[1px] bg-black/60" />
						<div className="h-px flex-1 bg-black/60" />
					</div>
					<div className="h-px bg-black/15" />
					{line("80%")}
					{line("64%")}
					<div className="ml-auto w-[40%] border-y border-black/60 py-[1px]">
						<div className="h-[2px]" />
					</div>
				</>
			)}
			{layout === "minimal" && (
				<>
					<div className="flex items-start justify-between">
						<div className="text-[9px] leading-none font-semibold text-black/80">
							Ab<span className="text-black/40">.</span>
						</div>
						<div className="h-[6px] w-[26px] rounded-[1px] bg-black/50" />
					</div>
					<div className="h-px bg-black/10" />
					{line("76%")}
					{line("60%")}
					<div className="h-px bg-black/50" />
					<div className="ml-auto h-[5px] w-[30%] rounded-[1px] bg-black/60" />
				</>
			)}
		</div>
	);
}

const FONT_SAMPLES: Array<{ value: DocFont; label: string; family: string }> = [
	{ value: "inter", label: "Inter", family: "'Inter', sans-serif" },
	{ value: "geist", label: "Geist", family: "'Geist', 'Inter', sans-serif" },
	{ value: "serif", label: "Newsreader", family: "'Newsreader', Georgia, serif" },
];

const STAMP_LABEL: Record<DocumentStamp, string> = { paid: "Paid", void: "Void", draft: "Draft", copy: "Copy", overdue: "Overdue" };
const SIZE_LABEL: Record<PaperSize, string> = { a4: "A4", "a4-landscape": "A4 landscape", a5: "A5", letter: "Letter", receipt: "80mm" };
const LAYOUTS: readonly DocLayout[] = ["minimal", "classic", "modern"];
const FONT_VALUES: readonly DocFont[] = FONT_SAMPLES.map((f) => f.value);

/* ═════════════ Studio ═════════════ */

/**
 * Brand editor with a live document preview. Left: logo, colour, layout, typeface, language, footer note.
 * Right: the chosen document on paper, with paper size and stamp toggles. Stacks on narrow containers.
 */
export function DocumentStudio({ brand: brandProp, defaultBrand, onBrandChange, documents, defaultDocumentId, onPrint, className, ...props }: DocumentStudioProps) {
	const [inner, setInner] = React.useState<DocBrand>(() => defaultBrand ?? brandProp ?? { company: { name: "Your company" } });
	const brand = brandProp ?? inner;
	const initial = React.useRef(brand);
	const update = (patch: Partial<DocBrand>) => {
		const next = { ...brand, ...patch };
		if (!brandProp) setInner(next);
		onBrandChange?.(next);
	};

	const [docId, setDocId] = React.useState(defaultDocumentId ?? documents[0]?.id);
	const doc = documents.find((d) => d.id === docId) ?? documents[0];
	const sizes = doc?.sizes ?? ["a4"];
	const [sizeByDoc, setSizeByDoc] = React.useState<Record<string, PaperSize>>({});
	const size: PaperSize = (doc ? sizeByDoc[doc.id] : undefined) ?? sizes[0];
	const [stamp, setStamp] = React.useState<DocumentStamp | "none">("none");

	const layout = brand.layout ?? "minimal";
	const font: DocFont = brand.font ?? (layout === "classic" ? "serif" : "inter");
	const locale: DocLocale = brand.locale ?? "en";
	const fileRef = React.useRef<HTMLInputElement>(null);
	const uid = React.useId();
	const ids = { logo: `${uid}-logo`, layout: `${uid}-layout`, font: `${uid}-font`, language: `${uid}-language`, footer: `${uid}-footer`, panel: `${uid}-panel`, tab: (id: string) => `${uid}-tab-${id}` };
	const docIds = documents.map((d) => d.id);
	const setLayout = (l: DocLayout) => update({ layout: l, font: l === "classic" ? "serif" : brand.font === "serif" ? "inter" : brand.font });

	const onLogo = (file: File | undefined) => {
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => update({ logo: String(reader.result) });
		reader.readAsDataURL(file);
	};

	return (
		<div data-slot="cy-document-studio" className={cn("@container min-w-0", className)} {...props}>
			<div className="grid gap-4 @3xl:grid-cols-[17.5rem_minmax(0,1fr)]">
				{/* ── Controls ── */}
				<aside aria-label="Document brand" className="flex min-w-0 flex-col gap-5 rounded-xl border border-border bg-card p-4">
					<div className="flex items-center justify-between gap-2">
						<div className="min-w-0">
							<div className="text-sm font-semibold text-foreground">Brand</div>
							<div className="text-xs text-tertiary-foreground">Applies to every document</div>
						</div>
						<Button variant="skeleton" size="sm" onClick={() => update(initial.current)} aria-label="Reset brand" className="gap-1.5">
							<ArrowCounterClockwiseIcon size={14} aria-hidden />
							Reset
						</Button>
					</div>

					<Field label="Logo" labelId={ids.logo} hint={typeof brand.logo === "string" ? "Image" : "Monogram"}>
						<div role="group" aria-labelledby={ids.logo} className="flex items-center gap-2">
							{/* Hidden, not visually hidden: the button below is the one keyboard stop, so focus never lands on an invisible input. */}
							<input ref={fileRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" hidden onChange={(e) => onLogo(e.target.files?.[0])} />
							<Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()} aria-label={brand.logo ? "Replace logo" : "Upload logo"} className="gap-1.5">
								<ImageSquareIcon size={14} aria-hidden />
								{brand.logo ? "Replace" : "Upload"}
							</Button>
							{brand.logo && (
								<Button variant="skeleton" size="sm" onClick={() => update({ logo: undefined })} className="gap-1.5">
									<TrashIcon size={14} aria-hidden />
									Use monogram
								</Button>
							)}
						</div>
					</Field>

					<Field label="Layout" labelId={ids.layout}>
						<div role="radiogroup" aria-labelledby={ids.layout} className="grid grid-cols-3 gap-2">
							{LAYOUTS.map((l) => (
								<button
									key={l}
									type="button"
									role="radio"
									aria-checked={layout === l}
									tabIndex={layout === l ? 0 : -1}
									onKeyDown={(e) => onRovingKeyDown(e, "radio", LAYOUTS, layout, setLayout)}
									onClick={() => setLayout(l)}
									className={cn(
										"flex cursor-pointer flex-col gap-1.5 rounded-lg border p-1.5 text-left outline-none transition-colors focus-ring",
										layout === l ? "border-primary bg-active-primary" : "border-border hover:bg-interactive-secondary-hover",
									)}
								>
									<LayoutThumb layout={l} />
									<span className="px-0.5 text-xs font-medium text-foreground capitalize">{l}</span>
								</button>
							))}
						</div>
					</Field>

					<Field label="Typeface" labelId={ids.font}>
						<div role="radiogroup" aria-labelledby={ids.font} className="grid grid-cols-3 gap-2">
							{FONT_SAMPLES.map((f) => (
								<button
									key={f.value}
									type="button"
									role="radio"
									aria-checked={font === f.value}
									tabIndex={font === f.value ? 0 : -1}
									onKeyDown={(e) => onRovingKeyDown(e, "radio", FONT_VALUES, font, (v) => update({ font: v }))}
									onClick={() => update({ font: f.value })}
									className={cn(
										"flex cursor-pointer flex-col items-start gap-0.5 rounded-lg border px-2.5 py-2 outline-none transition-colors focus-ring",
										font === f.value ? "border-primary bg-active-primary" : "border-border hover:bg-interactive-secondary-hover",
									)}
								>
									<span aria-hidden="true" className="text-lg leading-none text-foreground" style={{ fontFamily: f.family }}>
										Aa
									</span>
									<span className="text-2xs text-tertiary-foreground">{f.label}</span>
								</button>
							))}
						</div>
					</Field>

					<Field label="Language" labelId={ids.language}>
						<div role="group" aria-labelledby={ids.language}>
							<GroupedTabButton
								value={locale}
								onValueChange={(v) => update({ locale: v as DocLocale })}
								options={[
									{ value: "en", label: "English" },
									{ value: "ms", label: <span lang="ms">Melayu</span> },
									{ value: "en-ms", label: "Both" },
								]}
							/>
						</div>
					</Field>

					<Field label="Footer note" htmlFor={ids.footer}>
						<Input id={ids.footer} value={typeof brand.footerNote === "string" ? brand.footerNote : ""} placeholder="Thank you for your business." onChange={(e) => update({ footerNote: e.target.value || undefined })} />
					</Field>
				</aside>

				{/* ── Preview ── */}
				<section aria-label="Preview" className="flex min-w-0 flex-col gap-3">
					<ScrollRow role="tablist" aria-label="Document">
						{documents.map((d) => {
							const selected = d.id === doc?.id;
							return (
								<Button
									key={d.id}
									id={ids.tab(d.id)}
									role="tab"
									aria-selected={selected}
									aria-controls={ids.panel}
									tabIndex={selected ? 0 : -1}
									onKeyDown={(e) => doc && onRovingKeyDown(e, "tab", docIds, doc.id, setDocId)}
									variant={selected ? "secondary" : "skeleton"}
									size="sm"
									onClick={() => setDocId(d.id)}
									className="shrink-0"
								>
									{d.label}
								</Button>
							);
						})}
					</ScrollRow>
					<div className="flex flex-wrap items-center gap-2">
						{sizes.length > 1 && (
								<GroupedTabButton aria-label="Paper size" value={size} onValueChange={(v) => doc && setSizeByDoc((m) => ({ ...m, [doc.id]: v as PaperSize }))} options={sizes.map((s) => ({ value: s, label: SIZE_LABEL[s] }))} />
						)}
						{doc?.stamps && doc.stamps.length > 0 && (
								<GroupedTabButton aria-label="Stamp" value={stamp} onValueChange={(v) => setStamp(v as DocumentStamp | "none")} options={[{ value: "none", label: "No stamp" }, ...doc.stamps.map((s) => ({ value: s, label: STAMP_LABEL[s] }))]} />
						)}
						<Button variant="secondary" size="sm" className="ml-auto gap-1.5" onClick={() => (onPrint ? onPrint() : window.print())}>
							<PrinterIcon size={14} aria-hidden />
							Print / PDF
						</Button>
					</div>
					{/* The sheet brings its own Fit width / Actual size control (DocumentPage). */}
					<div
						id={ids.panel}
						role="tabpanel"
						aria-labelledby={doc ? ids.tab(doc.id) : undefined}
						tabIndex={0}
						className={cn(
							"min-w-0 rounded-xl bg-[color-mix(in_srgb,var(--muted)_70%,transparent)] p-[clamp(8px,3cqi,28px)] outline-none focus-ring-inset",
							size === "receipt" && "flex justify-center",
						)}
					>
						<div className={cn("min-w-0", size === "receipt" && "w-full max-w-[340px]")}>
							<DocumentBrandProvider brand={brand}>{doc?.render({ stamp: stamp === "none" ? undefined : stamp, size })}</DocumentBrandProvider>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
