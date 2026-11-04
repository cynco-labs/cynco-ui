const escapeHtml = (s: string) =>
	s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Minimal inline Markdown for registry copy: `code`, **bold**, *em*, and paragraphs on blank lines. */
export function inlineMd(text: string): string {
	return text
		.split(/\n\s*\n/)
		.map((p) => {
			const parts = p.split(/(`[^`]+`)/g).map((part) => {
				if (part.startsWith("`") && part.endsWith("`") && part.length > 1)
					return `<code>${escapeHtml(part.slice(1, -1))}</code>`;
				return escapeHtml(part)
					.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
					.replace(/(^|[\s(])\*([^*\s][^*]*)\*/g, "$1<em>$2</em>");
			});
			return `<p>${parts.join("")}</p>`;
		})
		.join("");
}

export const GITHUB = "https://github.com/cynco-labs/cynco-ui";
export const sourceUrl = (path: string) => `${GITHUB}/blob/main/${path}`;
