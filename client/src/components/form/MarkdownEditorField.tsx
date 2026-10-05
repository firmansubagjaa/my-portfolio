// File: /client/src/components/form/MarkdownEditorField.tsx
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { useId } from "react";
import { cn } from "@/lib/cn";
import { FieldError } from "../ui/FieldError";
import { Label } from "../ui/Label";

interface MarkdownEditorFieldProps {
	label?: string;
	value: string;
	onChange: (value: string) => void;
	error?: { message?: string };
	required?: boolean;
	placeholder?: string;
}

export function MarkdownEditorField({
	label,
	value,
	onChange,
	error,
	required,
	placeholder = "Tulis konten di sini...",
}: MarkdownEditorFieldProps) {
	const id = useId();
	const errorId = `${id}-error`;
	const hasError = !!error?.message;

	return (
		<div className="flex flex-col gap-1.5">
			{label && (
				<Label htmlFor={id} required={required}>
					{label}
				</Label>
			)}
			{/* data-color-mode selects the editor's dark palette; .admin-md-editor maps it to site tokens (globals.css) */}
			<div
				data-color-mode="dark"
				className={cn(
					"admin-md-editor overflow-hidden rounded-md border transition-colors focus-within:ring-2",
					hasError
						? "border-red-500 focus-within:ring-red-500/30"
						: "border-border focus-within:border-accent focus-within:ring-accent/30",
				)}
			>
				<MDEditor
					value={value}
					onChange={(val) => onChange(val || "")}
					preview="live"
					hideToolbar={false}
					visibleDragbar={true}
					height={360}
					textareaProps={{
						id,
						placeholder,
						"aria-invalid": hasError || undefined,
						"aria-describedby": hasError ? errorId : undefined,
					}}
				/>
			</div>
			<FieldError id={errorId} error={error} />
		</div>
	);
}
