"use client";

import { ArrowDownIcon } from "@phosphor-icons/react";
import { useReducedMotion } from "motion/react";
import type { ComponentProps } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { StickToBottom, useStickToBottomContext } from "use-stick-to-bottom";
import { cn } from "../../lib/utils";
import { LiveStatus } from "../general/live-status";
import { Button } from "../ui/button";

/** How long the transcript must stay unchanged before new assistant text is announced. */
const ANNOUNCE_SETTLE_MS = 1000;

/**
 * Announces new assistant text once streaming pauses or ends, instead of letting
 * the log read every token. History present at mount is never announced.
 */
const ConversationAnnouncer = () => {
	const statusRef = useRef<HTMLSpanElement>(null);
	const [announcement, setAnnouncement] = useState("");

	useEffect(() => {
		// Watch the Conversation root (this region's parent), which always exists, rather than the
		// content element, which may mount later (e.g. after an empty state).
		const content = statusRef.current?.parentElement;
		if (!content) {
			return;
		}

		const readLatest = () => {
			const messages = content.querySelectorAll<HTMLElement>('[data-from="assistant"]');
			const latest = messages[messages.length - 1] ?? null;
			if (!latest) {
				return { message: null, text: "" };
			}
			const parts = latest.querySelectorAll('[data-slot="message-content"]');
			const text =
				parts.length > 0 ? Array.from(parts, (part) => part.textContent ?? "").join(" ") : (latest.textContent ?? "");
			return { message: latest, text: text.trim() };
		};

		let { message: announcedMessage, text: announcedText } = readLatest();
		let timer: number | undefined;

		const observer = new MutationObserver(() => {
			window.clearTimeout(timer);
			timer = window.setTimeout(() => {
				const { message, text } = readLatest();
				if (!(message && text)) {
					return;
				}
				if (message !== announcedMessage) {
					announcedMessage = message;
					announcedText = "";
				}
				if (text === announcedText) {
					return;
				}
				// Announce only what is new since the last pause.
				const fresh = text.startsWith(announcedText) ? text.slice(announcedText.length).trim() : text;
				announcedText = text;
				if (fresh) {
					setAnnouncement(fresh);
				}
			}, ANNOUNCE_SETTLE_MS);
		});

		observer.observe(content, {
			characterData: true,
			childList: true,
			subtree: true,
		});

		return () => {
			observer.disconnect();
			window.clearTimeout(timer);
		};
	}, []);

	return <LiveStatus ref={statusRef}>{announcement}</LiveStatus>;
};

export type ConversationProps = ComponentProps<typeof StickToBottom>;

export const Conversation = ({ className, children, ...props }: ConversationProps) => {
	const reduceMotion = useReducedMotion();
	const animation = reduceMotion ? "instant" : "smooth";

	return (
		<StickToBottom
			className={cn("relative flex-1 overflow-y-hidden", className)}
			initial={animation}
			resize={animation}
			role="log"
			// The log keeps its semantics; announcements go through ConversationAnnouncer
			// so streamed tokens are not read one by one.
			aria-live="off"
			{...props}
		>
			{(context) => (
				<>
					{typeof children === "function" ? children(context) : children}
					<ConversationAnnouncer />
				</>
			)}
		</StickToBottom>
	);
};

export type ConversationContentProps = ComponentProps<typeof StickToBottom.Content>;

export const ConversationContent = ({ className, scrollClassName, ...props }: ConversationContentProps) => {
	const { scrollRef } = useStickToBottomContext();

	// The scroller is rendered by use-stick-to-bottom without prop forwarding;
	// make it reachable so keyboard users can scroll plain-text history.
	useEffect(() => {
		const scroller = scrollRef.current;
		if (scroller && !scroller.hasAttribute("tabindex")) {
			scroller.tabIndex = 0;
		}
	}, [scrollRef]);

	return (
		<StickToBottom.Content
			className={cn("flex flex-col gap-8 p-4", className)}
			scrollClassName={cn("outline-none focus-ring-inset", scrollClassName)}
			{...props}
		/>
	);
};

export type ConversationEmptyStateProps = ComponentProps<"div"> & {
	title?: string;
	description?: string;
	icon?: React.ReactNode;
};

export const ConversationEmptyState = ({
	className,
	title = "No messages yet",
	description = "Start a conversation to see messages here",
	icon,
	children,
	...props
}: ConversationEmptyStateProps) => (
	<div className={cn("flex size-full flex-col items-center justify-center gap-3 p-8 text-center", className)} {...props}>
		{children ?? (
			<>
				{icon && (
					<div aria-hidden="true" className="text-muted-foreground">
						{icon}
					</div>
				)}
				<div className="space-y-1">
					<h3 className="font-medium text-sm">{title}</h3>
					{description && <p className="text-muted-foreground text-sm">{description}</p>}
				</div>
			</>
		)}
	</div>
);

export type ConversationScrollButtonProps = ComponentProps<typeof Button>;

export const ConversationScrollButton = ({ className, ...props }: ConversationScrollButtonProps) => {
	const { isAtBottom, scrollToBottom, scrollRef } = useStickToBottomContext();
	const reduceMotion = useReducedMotion();

	const handleScrollToBottom = useCallback(() => {
		// The button unmounts once the log reaches the bottom; hand focus to the
		// scroller first so keyboard users are not dropped onto <body>.
		scrollRef.current?.focus({ preventScroll: true });
		scrollToBottom(reduceMotion ? "instant" : undefined);
	}, [scrollToBottom, scrollRef, reduceMotion]);

	return (
		!isAtBottom && (
			<Button
				aria-label="Scroll to bottom"
				className={cn("absolute bottom-4 left-[50%] translate-x-[-50%] rounded-full", className)}
				onClick={handleScrollToBottom}
				size="icon"
				type="button"
				variant="secondary"
				{...props}
			>
				<ArrowDownIcon className="size-4" />
			</Button>
		)
	);
};
