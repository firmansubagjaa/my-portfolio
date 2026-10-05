// File: /client/src/components/form/MarkdownEditorField.tsx
import MDEditor from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";
import { Label } from "../ui/Label";
import { FieldError } from "../ui/FieldError";

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
	return (
		<div className="flex flex-col gap-2">
			{label && <Label required={required}>{label}</Label>}
			<div
				data-color-mode="dark"
				className="border border-neutral-700 rounded-md overflow-hidden"
			>
				<MDEditor
					value={value}
					onChange={(val) => onChange(val || "")}
					preview="live"
					hideToolbar={false}
					visibleDragbar={true}
					height={300}
					textareaProps={{
						placeholder,
					}}
					className={`bg-neutral-950 text-white ${
						error ? "border border-red-500" : ""
					}`}
				/>
			</div>
			<FieldError error={error} />
		</div>
	);
}
