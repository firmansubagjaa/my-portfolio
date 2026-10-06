import { getTechIcon } from "@/lib/techStackIcons";
import { cn } from "@/lib/cn";

interface TechTagProps {
	tech: string;
	className?: string;
}

export function TechTag({ tech, className }: TechTagProps) {
	const { icon: IconComponent, color } = getTechIcon(tech);

	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-fg cursor-pointer tech-tag-hover",
				className,
			)}
			style={{
				"--icon-color": color,
			} as React.CSSProperties}
		>
			<IconComponent
				size={14}
				className="flex-shrink-0"
				style={{ color }}
				aria-hidden="true"
			/>
			<span>{tech}</span>
		</span>
	);
}
