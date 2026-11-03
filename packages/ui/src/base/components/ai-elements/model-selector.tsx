import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
	CommandShortcut,
} from "../ui/command";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { cn } from "../../lib/utils";
import type { ComponentProps, ReactNode } from "react";

export type ModelSelectorProps = ComponentProps<typeof Dialog>;

export const ModelSelector = (props: ModelSelectorProps) => (
	<Dialog {...props} />
);

export type ModelSelectorTriggerProps = ComponentProps<typeof DialogTrigger>;

export const ModelSelectorTrigger = (props: ModelSelectorTriggerProps) => (
	<DialogTrigger {...props} />
);

export type ModelSelectorContentProps = ComponentProps<typeof DialogContent> & {
	title?: ReactNode;
};

export const ModelSelectorContent = ({
	className,
	children,
	title = "Model Selector",
	...props
}: ModelSelectorContentProps) => (
	<DialogContent className={cn("p-0", className)} {...props}>
		<DialogTitle className="sr-only">{title}</DialogTitle>
		{/* cmdk labels its combobox input and listbox from this; empty, they are unnamed. */}
		<Command
			className="**:data-[slot=command-input-wrapper]:h-auto"
			label={typeof title === "string" ? title : "Model Selector"}
		>
			{children}
		</Command>
	</DialogContent>
);

export type ModelSelectorDialogProps = ComponentProps<typeof CommandDialog>;

export const ModelSelectorDialog = (props: ModelSelectorDialogProps) => (
	<CommandDialog {...props} />
);

export type ModelSelectorInputProps = ComponentProps<typeof CommandInput>;

export const ModelSelectorInput = ({
	className,
	...props
}: ModelSelectorInputProps) => (
	<CommandInput className={cn("h-auto py-3.5", className)} {...props} />
);

export type ModelSelectorListProps = ComponentProps<typeof CommandList>;

export const ModelSelectorList = (props: ModelSelectorListProps) => (
	<CommandList {...props} />
);

export type ModelSelectorEmptyProps = ComponentProps<typeof CommandEmpty>;

export const ModelSelectorEmpty = (props: ModelSelectorEmptyProps) => (
	<CommandEmpty {...props} />
);

export type ModelSelectorGroupProps = ComponentProps<typeof CommandGroup>;

export const ModelSelectorGroup = (props: ModelSelectorGroupProps) => (
	<CommandGroup {...props} />
);

export type ModelSelectorItemProps = ComponentProps<typeof CommandItem>;

export const ModelSelectorItem = (props: ModelSelectorItemProps) => (
	<CommandItem {...props} />
);

export type ModelSelectorShortcutProps = ComponentProps<typeof CommandShortcut>;

export const ModelSelectorShortcut = (props: ModelSelectorShortcutProps) => (
	<CommandShortcut {...props} />
);

export type ModelSelectorSeparatorProps = ComponentProps<
	typeof CommandSeparator
>;

export const ModelSelectorSeparator = (props: ModelSelectorSeparatorProps) => (
	<CommandSeparator {...props} />
);

export type ModelSelectorLogoProps = ComponentProps<"img"> & {
	provider:
		| "moonshotai-cn"
		| "lucidquery"
		| "moonshotai"
		| "zai-coding-plan"
		| "alibaba"
		| "xai"
		| "vultr"
		| "nvidia"
		| "upstage"
		| "groq"
		| "github-copilot"
		| "mistral"
		| "vercel"
		| "nebius"
		| "deepseek"
		| "alibaba-cn"
		| "google-vertex-anthropic"
		| "venice"
		| "chutes"
		| "cortecs"
		| "github-models"
		| "togetherai"
		| "azure"
		| "baseten"
		| "huggingface"
		| "opencode"
		| "fastrouter"
		| "google"
		| "google-vertex"
		| "cloudflare-workers-ai"
		| "inception"
		| "wandb"
		| "openai"
		| "zhipuai-coding-plan"
		| "perplexity"
		| "openrouter"
		| "zenmux"
		| "v0"
		| "iflowcn"
		| "synthetic"
		| "deepinfra"
		| "zhipuai"
		| "submodel"
		| "zai"
		| "inference"
		| "requesty"
		| "morph"
		| "lmstudio"
		| "anthropic"
		| "aihubmix"
		| "fireworks-ai"
		| "modelscope"
		| "llama"
		| "scaleway"
		| "amazon-bedrock"
		| "cerebras"
		| (string & {});
};

/**
 * The provider's logo. By default it loads from models.dev at render; pass `src` to serve it yourself
 * (a strict Content-Security-Policy blocks the default, and it tells models.dev who is viewing).
 */
export const ModelSelectorLogo = ({
	provider,
	className,
	alt,
	src = `https://models.dev/logos/${provider}.svg`,
	...props
}: ModelSelectorLogoProps) => (
	<img
		{...props}
		// Pass alt="" when the provider name is printed beside the logo.
		alt={alt ?? `${provider} logo`}
		className={cn("size-3 dark:invert", className)}
		height={12}
		src={src}
		width={12}
	/>
);

export type ModelSelectorLogoGroupProps = ComponentProps<"div">;

export const ModelSelectorLogoGroup = ({
	className,
	...props
}: ModelSelectorLogoGroupProps) => (
	<div
		className={cn(
			"-space-x-1 flex shrink-0 items-center [&>img]:rounded-full [&>img]:bg-background [&>img]:p-px [&>img]:ring-1 dark:[&>img]:bg-foreground",
			className,
		)}
		{...props}
	/>
);

export type ModelSelectorNameProps = ComponentProps<"span">;

export const ModelSelectorName = ({
	className,
	...props
}: ModelSelectorNameProps) => (
	<span className={cn("flex-1 truncate text-left", className)} {...props} />
);
