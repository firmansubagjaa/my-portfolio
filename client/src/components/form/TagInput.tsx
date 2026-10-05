// File: /client/src/components/form/TagInput.tsx
import { useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { FieldError } from "../ui/FieldError";
import { describedBy } from "../ui/field-styles";
import { Label } from "../ui/Label";

interface TagInputProps {
	label?: string;
	value: string[];
	onChange: (tags: string[]) => void;
	error?: { message?: string };
	required?: boolean;
	maxTags?: number;
	placeholder?: string;
}

const DEFAULT_MAX_TAGS = 20;

export function TagInput({
	label,
	value,
	onChange,
	error,
	required,
	maxTags = DEFAULT_MAX_TAGS,
	placeholder = "Ketik tag dan tekan Enter atau koma",
}: TagInputProps) {
	const id = useId();
	const hintId = `${id}-hint`;
	const noticeId = `${id}-notice`;
	const errorId = `${id}-error`;
	const inputRef = useRef<HTMLInputElement>(null);
	const [notice, setNotice] = useState<string | null>(null);
	const hasError = !!error?.message;

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		const input = e.currentTarget.value.trim();

		if ((e.key === "Enter" || e.key === ",") && input) {
			e.preventDefault();

			if (value.includes(input)) {
				setNotice("Tag sudah ada");
				e.currentTarget.value = "";
				return;
			}

			if (value.length >= maxTags) {
				setNotice(`Maksimal ${maxTags} tag`);
				return;
			}

			setNotice(null);
			onChange([...value, input]);
			e.currentTarget.value = "";
			return;
		}

		// Enter on an empty input must not submit the whole form
		if (e.key === "Enter") {
			e.preventDefault();
			return;
		}

		if (e.key === "Backspace" && e.currentTarget.value === "" && value.length > 0) {
			onChange(value.slice(0, -1));
		}
	};

	const removeTag = (index: number) => {
		onChange(value.filter((_, i) => i !== index));
		setNotice(null);
		inputRef.current?.focus();
	};

	return (
		<div className="flex flex-col gap-1.5">
			{label && (
				<Label htmlFor={id} required={required}>
					{label}
				</Label>
			)}

			{/* biome-ignore lint/a11y/noStaticElementInteractions: clicking the padding focuses the input (mouse convenience only) */}
			{/* biome-ignore lint/a11y/useKeyWithClickEvents: the input itself is keyboard reachable */}
			<div
				onClick={() => inputRef.current?.focus()}
				className={cn(
					"flex min-h-10 cursor-text flex-wrap items-center gap-2 rounded-md border bg-bg px-2 py-1.5 transition-colors focus-within:ring-2",
					hasError
						? "border-red-500 focus-within:ring-red-500/30"
						: "border-border hover:border-muted/50 focus-within:border-accent focus-within:ring-accent/30",
				)}
			>
				{value.map((tag, index) => (
					<button
						key={tag}
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							removeTag(index);
						}}
						aria-label={`Hapus tag ${tag}`}
						className="inline-flex cursor-pointer items-center gap-1 rounded border border-border bg-surface px-2 py-0.5 font-mono text-xs text-code transition-colors hover:border-red-500/60 hover:text-red-300"
					>
						{tag}
						<svg
							aria-hidden="true"
							className="h-3 w-3"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5"
							strokeLinecap="round"
						>
							<path d="M18 6 6 18" />
							<path d="m6 6 12 12" />
						</svg>
					</button>
				))}

				<input
					ref={inputRef}
					id={id}
					type="text"
					placeholder={value.length === 0 ? placeholder : "Tambah tag…"}
					onKeyDown={handleKeyDown}
					onChange={() => notice && setNotice(null)}
					aria-invalid={hasError || undefined}
					aria-describedby={describedBy(hintId, !!notice && noticeId, hasError && errorId)}
					className="min-w-32 flex-1 bg-transparent py-0.5 text-sm text-fg outline-none placeholder:text-muted/70 focus:outline-none focus-visible:outline-none"
				/>
			</div>

			<div className="flex items-center justify-between gap-3 text-xs">
				<p id={hintId} className="text-muted">
					Enter atau koma untuk menambah, Backspace untuk menghapus terakhir.
				</p>
				<p className="shrink-0 text-muted">
					{value.length} / {maxTags} tag
				</p>
			</div>

			{notice && (
				<p id={noticeId} role="status" className="text-xs text-yellow-400">
					{notice}
				</p>
			)}

			<FieldError id={errorId} error={error} />
		</div>
	);
}
