"use client";

/**
 * Cynco UI — LHDN MyInvois filing for one invoice or note. Presentational port of
 * cynco-labs/cynco remix/app/components/invoice; primitives and tokens only.
 */
import { ArrowSquareOutIcon, SealCheckIcon } from "@phosphor-icons/react";
import * as React from "react";
import {
	Badge,
	Button,
	cn,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	StatusChip,
	type StatusGlyph,
	type StatusTone,
	useControllableState,
} from "../../base";
import { ActionBar, FieldError, formatDate, KeyValueList } from "../../lib/shared";
import type { DivProps } from "./shared";

type EnvName = "sandbox" | "production";
export interface EInvoiceEnvStatus {
	status: "valid" | "invalid" | "submitted" | "pending" | "failed" | "cancelled" | null;
	documentUuid?: string | null;
	longId?: string | null;
	validatedAt?: string | null;
	/** The document's public MyInvois validation link; shown as "View on MyInvois" once valid. */
	validationUrl?: string | null;
	rejectionRequestedAt?: string | null;
	rejectionReason?: string | null;
	validationErrors?: string[];
	unconfirmed?: boolean;
	withinCancelWindow?: boolean;
}
const ENV_LABEL: Record<EnvName, string> = { sandbox: "Sandbox", production: "Production" };

function einvoiceState(
	s: EInvoiceEnvStatus | undefined,
): { label: string; tone: StatusTone; glyph: StatusGlyph } | null {
	if (!s?.status) return null;
	switch (s.status) {
		case "valid":
			return s.rejectionRequestedAt
				? { label: "Buyer requested rejection", tone: "amber", glyph: "alert" }
				: { label: "E-invoice valid", tone: "green", glyph: "check" };
		case "invalid":
			return { label: "E-invoice rejected", tone: "red", glyph: "x" };
		case "submitted":
			return { label: "E-invoice pending validation", tone: "blue", glyph: "clock" };
		case "pending":
			return { label: "E-invoice submission in progress", tone: "blue", glyph: "spinner" };
		case "failed":
			return s.unconfirmed
				? { label: "E-invoice submission unconfirmed", tone: "amber", glyph: "alert" }
				: { label: "E-invoice submission failed", tone: "red", glyph: "alert" };
		case "cancelled":
			return { label: "E-invoice cancelled", tone: "neutral", glyph: "ban" };
	}
	return null;
}

const linkClass = "rounded-sm text-primary outline-none hover:underline focus-ring";

/** LHDN MyInvois filing for one invoice or note: validation state per environment, the validated stamp, and the submit / cancel actions. */
export function EInvoiceStatusCard({
	credentialEnvironments,
	byEnvironment,
	documentLabel = "invoice",
	hasCorrection = true,
	credentialsHref,
	correctionHref,
	environment,
	defaultEnvironment,
	onEnvironmentChange,
	onSubmit,
	onCancel,
	onCheck,
	className,
	...props
}: DivProps<{
	credentialEnvironments: EnvName[];
	byEnvironment: Partial<Record<EnvName, EInvoiceEnvStatus>>;
	documentLabel?: string;
	hasCorrection?: boolean;
	/** Where MyInvois credentials are set up; links the "not configured" message. */
	credentialsHref?: string;
	/** Where to raise the correcting credit note; links the "window has passed" message. */
	correctionHref?: string;
	/** Controlled environment whose filing the card shows. */
	environment?: EnvName;
	/** Environment shown on first render when uncontrolled. Defaults to the first credentialled one. */
	defaultEnvironment?: EnvName;
	onEnvironmentChange?: (environment: EnvName) => void;
	onSubmit?: (env: EnvName) => void;
	onCancel?: (env: EnvName, reason: string) => void;
	onCheck?: (env: EnvName) => void;
}>) {
	const fallbackEnv = credentialEnvironments[0] ?? "sandbox";
	const [env = fallbackEnv, setEnv] = useControllableState<EnvName>({
		prop: environment,
		defaultProp: defaultEnvironment ?? fallbackEnv,
		onChange: onEnvironmentChange,
	});
	const [cancelReason, setCancelReason] = React.useState<string | null>(null);
	const [reasonError, setReasonError] = React.useState(false);
	const reasonId = React.useId();
	const reasonRef = React.useRef<HTMLInputElement>(null);
	const cancelRef = React.useRef<HTMLButtonElement>(null);
	/** Opening or leaving the cancel form unmounts the control that was pressed; move focus to its replacement. */
	const focusNext = React.useRef<"reason" | "cancel" | null>(null);
	const cancelling = cancelReason !== null;
	React.useEffect(() => {
		const target =
			focusNext.current === "reason" ? reasonRef.current : focusNext.current === "cancel" ? cancelRef.current : null;
		focusNext.current = null;
		target?.focus();
	}, [cancelling]);
	const openCancel = (open: boolean) => {
		focusNext.current = open ? "reason" : "cancel";
		setReasonError(false);
		setCancelReason(open ? "" : null);
	};
	const latest = byEnvironment[env];
	const state = einvoiceState(latest);
	const isValid = latest?.status === "valid";
	const canCancel = latest?.withinCancelWindow ?? false;
	const hasCreds = credentialEnvironments.length > 0;
	const errors = latest?.status === "invalid" ? (latest.validationErrors ?? []) : [];
	const envSelect = (
		<Select
			value={env}
			onValueChange={(v) => {
				setEnv(v as EnvName);
				setCancelReason(null);
			}}
			items={credentialEnvironments.map((e) => ({ value: e, label: ENV_LABEL[e] }))}
			disabled={credentialEnvironments.length < 2}
		>
			<SelectTrigger aria-label="Environment" className="w-36 max-w-full">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{credentialEnvironments.map((e) => (
					<SelectItem key={e} value={e}>
						{ENV_LABEL[e]}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
	return (
		<div
			className={cn("@container flex min-w-0 flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm", className)}
			{...props}
		>
			<ActionBar className="justify-between">
				<h3 className="flex items-center gap-1.5 text-md font-semibold text-foreground">
					<SealCheckIcon size={16} weight="fill" className="text-subtle" aria-hidden="true" />
					MyInvois e-invoice
				</h3>
				{env === "sandbox" && hasCreds && (
					<Badge variant="muted" size="sm" className="text-sandbox-text">
						Sandbox
					</Badge>
				)}
			</ActionBar>

			{state && (
				<ActionBar>
					<StatusChip tone={state.tone} glyph={state.glyph}>
						{state.label}
					</StatusChip>
					{isValid && latest?.validationUrl && (
						<a
							href={latest.validationUrl}
							target="_blank"
							rel="noreferrer"
							className={cn("inline-flex items-center gap-1 text-2xs", linkClass)}
						>
							View on MyInvois
							<ArrowSquareOutIcon size={12} aria-hidden="true" />
							<span className="sr-only">(opens in a new tab)</span>
						</a>
					)}
				</ActionBar>
			)}

			{isValid && latest?.documentUuid && (
				<div className="rounded-lg bg-muted px-3 py-1">
					<KeyValueList
						className="[&>div]:py-1"
						items={[
							{
								label: "UUID",
								value: <span className="font-mono text-2xs font-medium break-all">{latest.documentUuid}</span>,
							},
							...(latest.longId
								? [
										{
											label: "Long ID",
											value: <span className="font-mono text-2xs font-medium break-all">{latest.longId}</span>,
										},
									]
								: []),
							...(latest.validatedAt
								? [
										{
											label: "Validated",
											value: new Date(latest.validatedAt).toLocaleString("en-MY", {
												dateStyle: "medium",
												timeStyle: "short",
												timeZone: "Asia/Kuala_Lumpur",
											}),
										},
									]
								: []),
						]}
					/>
				</div>
			)}

			{isValid && latest?.rejectionRequestedAt && (
				<p className="text-sm font-normal text-tertiary-foreground">
					The buyer asked LHDN to reject this e-invoice on {formatDate(latest.rejectionRequestedAt)}
					{latest.rejectionReason ? ` ("${latest.rejectionReason}")` : ""}. Cancel it within the 72-hour window if they are
					right, or keep it if not.
				</p>
			)}

			{errors.length > 0 && (
				<ul className="flex list-disc flex-col gap-0.5 pl-4 text-sm font-normal text-error-text">
					{errors.map((line) => (
						<li key={line}>{line}</li>
					))}
				</ul>
			)}

			{!hasCreds ? (
				<p className="text-sm font-normal text-tertiary-foreground">
					MyInvois credentials are not configured. Set them up in{" "}
					{credentialsHref ? (
						<a href={credentialsHref} className={linkClass}>
							E-Invoice Credentials
						</a>
					) : (
						"E-Invoice Credentials"
					)}
					.
				</p>
			) : isValid ? (
				<div className="flex flex-col gap-2">
					{envSelect}
					{!canCancel ? (
						<p className="text-2xs text-tertiary-foreground">
							The 72-hour cancellation window has passed.{" "}
							{hasCorrection ? (
								correctionHref ? (
									<a href={correctionHref} className={linkClass}>
										Correct this {documentLabel} with a credit note
									</a>
								) : (
									`Correct this ${documentLabel} with a credit note`
								)
							) : (
								"Correct it with a credit or debit note"
							)}
							.
						</p>
					) : cancelReason === null ? (
						<Button ref={cancelRef} variant="secondary" size="sm" onClick={() => openCancel(true)}>
							Cancel e-invoice
						</Button>
					) : (
						<div className="flex flex-col gap-2">
							<Input
								ref={reasonRef}
								aria-label="Reason for cancelling"
								placeholder="Reason for cancelling (sent to LHDN)"
								maxLength={300}
								value={cancelReason}
								aria-invalid={reasonError || undefined}
								aria-describedby={reasonError ? reasonId : undefined}
								onChange={(e) => {
									setCancelReason(e.target.value);
									if (e.target.value.trim()) setReasonError(false);
								}}
							/>
							{reasonError && <FieldError id={reasonId}>Enter a reason for cancelling.</FieldError>}
							<ActionBar>
								{/* Validated on press, not by disabling: a disabled button gives no reason and cannot be focused. */}
								<Button
									variant="destructive"
									size="sm"
									onClick={() => {
										if (cancelReason.trim() === "") {
											setReasonError(true);
											reasonRef.current?.focus();
											return;
										}
										onCancel?.(env, cancelReason);
									}}
								>
									Confirm cancellation
								</Button>
								<Button variant="secondary" size="sm" onClick={() => openCancel(false)}>
									Keep it
								</Button>
							</ActionBar>
						</div>
					)}
				</div>
			) : (
				<div className="flex flex-col gap-2">
					{latest?.unconfirmed && (
						<p className="text-2xs text-tertiary-foreground">
							An earlier submission to MyInvois never got an answer, so MyInvois may hold this e-invoice. Check whether it was
							received before voiding or submitting again.
						</p>
					)}
					<ActionBar>
						{envSelect}
						{latest?.unconfirmed && (
							<Button variant="secondary" onClick={() => onCheck?.(env)}>
								Check with MyInvois
							</Button>
						)}
						<Button variant="primary" isLoading={latest?.status === "pending"} onClick={() => onSubmit?.(env)}>
							Submit to MyInvois
						</Button>
					</ActionBar>
				</div>
			)}
		</div>
	);
}
