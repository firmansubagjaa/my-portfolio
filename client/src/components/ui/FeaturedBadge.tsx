import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

interface FeaturedBadgeProps {
	text?: string;
	className?: string;
}

export function FeaturedBadge({ text = "Featured", className }: FeaturedBadgeProps) {
	return (
		<div className={cn("inline-flex items-center gap-1", className)}>
			<Star
				size={16}
				className="fill-accent text-accent featured-pulse"
				aria-hidden="true"
			/>
			{text && <span className="text-xs font-medium text-accent">{text}</span>}
		</div>
	);
}
