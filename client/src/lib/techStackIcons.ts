import type { LucideIcon } from "lucide-react";
import {
	Code2,
	Code,
	Server,
	Database,
	Zap,
	Radio,
	Box,
	Cloud,
	Palette,
	Brain,
	Layers,
	Lightbulb,
} from "lucide-react";
import type { ProjectCategory } from "@shared/dto";

export interface IconMetadata {
	icon: LucideIcon;
	color: string;
	label: string;
}

// Tech stack to icon mappings
export const TECH_ICONS: Record<string, IconMetadata> = {
	react: {
		icon: Code2,
		color: "#3B82F6",
		label: "React",
	},
	typescript: {
		icon: Code,
		color: "#3B82F6",
		label: "TypeScript",
	},
	"node.js": {
		icon: Server,
		color: "#10B981",
		label: "Node.js",
	},
	nodejs: {
		icon: Server,
		color: "#10B981",
		label: "Node.js",
	},
	postgresql: {
		icon: Database,
		color: "#64748B",
		label: "PostgreSQL",
	},
	python: {
		icon: Code,
		color: "#EAB308",
		label: "Python",
	},
	fastapi: {
		icon: Zap,
		color: "#EAB308",
		label: "FastAPI",
	},
	bun: {
		icon: Zap,
		color: "#F59E0B",
		label: "Bun",
	},
	websocket: {
		icon: Radio,
		color: "#A855F7",
		label: "WebSocket",
	},
	redis: {
		icon: Zap,
		color: "#EF4444",
		label: "Redis",
	},
	docker: {
		icon: Box,
		color: "#3B82F6",
		label: "Docker",
	},
	aws: {
		icon: Cloud,
		color: "#F97316",
		label: "AWS",
	},
	tailwind: {
		icon: Palette,
		color: "#06B6D4",
		label: "Tailwind CSS",
	},
	transformers: {
		icon: Brain,
		color: "#A855F7",
		label: "Transformers",
	},
};

// Category to icon mappings
export const CATEGORY_ICONS: Record<ProjectCategory, IconMetadata> = {
	fullstack: {
		icon: Layers,
		color: "#3B82F6",
		label: "Full-Stack",
	},
	ai_ml: {
		icon: Brain,
		color: "#A855F7",
		label: "AI/ML",
	},
	backend: {
		icon: Server,
		color: "#10B981",
		label: "Backend",
	},
	frontend: {
		icon: Code2,
		color: "#3B82F6",
		label: "Frontend",
	},
	experiment: {
		icon: Lightbulb,
		color: "#A855F7",
		label: "Experiment",
	},
};

/**
 * Get icon metadata for a technology
 * Normalizes input (lowercase, replaces underscores with dots)
 * Returns fallback if tech not found
 */
export function getTechIcon(
	tech: string,
	fallback?: IconMetadata,
): IconMetadata {
	const normalized = tech.toLowerCase().trim().replace(/_/g, ".");
	return (
		TECH_ICONS[normalized] ||
		fallback || {
			icon: Code,
			color: "#64748B",
			label: tech,
		}
	);
}

/**
 * Get icon metadata for a category
 */
export function getCategoryIcon(category: ProjectCategory): IconMetadata {
	return CATEGORY_ICONS[category] || CATEGORY_ICONS.experiment;
}
