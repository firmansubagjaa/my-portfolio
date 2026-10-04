// File: /client/src/components/bento/BentoGrid.tsx
import { AnimatePresence, LayoutGroup } from "motion/react";
import * as m from "motion/react-m";
import type { ProjectListItemDTO } from "@/types/api";
import { BENTO_GRID_CLASS, bentoCellClass } from "./bento-layout";
import { ProjectCard } from "./ProjectCard";

interface BentoGridProps {
	projects: ProjectListItemDTO[];
	/** Give the first card eager loading + high fetch priority (LCP) */
	prioritizeFirst?: boolean;
}

export function BentoGrid({ projects, prioritizeFirst = false }: BentoGridProps) {
	const firstFeaturedId = projects.find((p) => p.is_featured)?.id;

	return (
		<LayoutGroup>
			{/* biome-ignore lint/a11y/noRedundantRoles: role restores list semantics removed by list-style:none in Safari */}
			<ul role="list" className={BENTO_GRID_CLASS}>
				<AnimatePresence mode="popLayout" initial={false}>
					{projects.map((project, index) => (
						<m.li
							layout
							key={project.id}
							initial={{ opacity: 0, scale: 0.98 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.98 }}
							className={bentoCellClass(project.is_featured, project.id === firstFeaturedId)}
						>
							<ProjectCard project={project} priority={prioritizeFirst && index === 0} />
						</m.li>
					))}
				</AnimatePresence>
			</ul>
		</LayoutGroup>
	);
}
