import { jsx as _jsx } from "react/jsx-runtime";
/**
 * Empty state component shown when no projects are found
 */
export function EmptyState({ message = "Tidak ada proyek tersedia saat ini." }) {
	return _jsx("div", {
		className:
			"flex min-h-96 items-center justify-center rounded-lg border border-[--color-border] bg-[--color-surface]",
		children: _jsx("p", { className: "text-center text-[--color-muted]", children: message }),
	});
}
