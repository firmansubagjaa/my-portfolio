// File: /client/src/components/form/TagInput.tsx
import { useRef } from "react";
import { Badge } from "../ui/Badge";
import { Label } from "../ui/Label";
import { FieldError } from "../ui/FieldError";

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
	const inputRef = useRef<HTMLInputElement>(null);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		const input = e.currentTarget.value.trim();

		if ((e.key === "Enter" || e.key === ",") && input) {
			e.preventDefault();

			// Check for duplicates
			if (value.includes(input)) {
				alert("Tag sudah ada");
				e.currentTarget.value = "";
				return;
			}

			// Check max tags
			if (value.length >= maxTags) {
				alert(`Maksimal ${maxTags} tag`);
				return;
			}

			onChange([...value, input]);
			e.currentTarget.value = "";
		}
	};

	const removeTag = (index: number) => {
		onChange(value.filter((_, i) => i !== index));
	};

	return (
		<div className="flex flex-col gap-2">
			{label && <Label required={required}>{label}</Label>}

			<div className="flex flex-wrap gap-2 p-2 border border-neutral-300 rounded-md bg-white">
				{value.map((tag, index) => (
					<Badge
						key={index}
						variant="default"
						className="cursor-pointer hover:opacity-80"
						onClick={() => removeTag(index)}
					>
						{tag} ×
					</Badge>
				))}

				<input
					ref={inputRef}
					type="text"
					placeholder={placeholder}
					onKeyDown={handleKeyDown}
					className="flex-1 min-w-fit outline-none bg-transparent text-neutral-900 placeholder-neutral-400"
				/>
			</div>

			{value.length > 0 && (
				<p className="text-xs text-neutral-500">
					{value.length} / {maxTags} tag
				</p>
			)}

			<FieldError error={error} />
		</div>
	);
}
