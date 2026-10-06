import { getCategoryIcon } from "@/lib/techStackIcons";
import type { ProjectCategory } from "@/types/api";
import { cn } from "@/lib/cn";

interface CategoryBadgeProps {
	category: ProjectCategory;
	className?: string;
}

export function CategoryBadge({ category, className }: CategoryBadgeProps) {
	const { icon: IconComponent, color, label } = getCategoryIcon(category);

	return (
		<div
			className={cn(
				"inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-fg",
				className,
			)}
			style={{
				"--category-color": color,
			} as React.CSSProperties}
		>
			<IconComponent
				size={16}
				className="flex-shrink-0"
				style={{ color }}
				aria-hidden="true"
			/>
			<span>{label}</span>
		</div>
	);
}
