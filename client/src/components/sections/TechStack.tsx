import { motion } from "motion/react";
import { useScrollInView } from "@/hooks/useScrollInView";
import { getTechIcon, CATEGORY_ICONS } from "@/lib/techStackIcons";

interface TechStackCategory {
	id: string; // Display category ID (not tied to ProjectCategory enum)
	name: string;
	techs: string[];
}

const techStackCategories: TechStackCategory[] = [
	{
		id: "frontend",
		name: "Frontend",
		techs: ["React", "TypeScript", "Tailwind CSS", "Next.js"],
	},
	{
		id: "backend",
		name: "Backend",
		techs: ["Node.js", "Bun", "PostgreSQL", "Redis"],
	},
	{
		id: "ai_ml",
		name: "AI/ML & Data",
		techs: ["Python", "FastAPI", "Transformers", "Pandas", "PyTorch"],
	},
	{
		id: "infrastructure", // Infrastructure uses cloud/layers icon
		name: "Infrastructure & Tools",
		techs: ["Docker", "AWS", "Git", "GitHub Actions"],
	},
];

export function TechStack() {
	const { ref, inView } = useScrollInView({
		threshold: 0.2,
		triggerOnce: true,
	});

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: inView ? 0 : 0,
			},
		},
	};

	const categoryVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.6, ease: "easeOut" },
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, scale: 0.95 },
		visible: {
			opacity: 1,
			scale: 1,
			transition: { duration: 0.4, ease: "easeOut" },
		},
	};

	return (
		<section
			ref={ref}
			id="skills"
			className="w-full py-20 md:py-24 scroll-mt-20"
		>
			<div className="mx-auto max-w-6xl px-4">
				{/* Heading */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
					transition={{ duration: 0.6, ease: "easeOut" }}
					className="mb-12"
				>
					<h2 className="text-3xl md:text-4xl font-bold text-fg mb-2">Tech Stack</h2>
					<div className="h-1 w-12 bg-accent rounded-full" />
				</motion.div>

				{/* Categories Grid */}
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate={inView ? "visible" : "hidden"}
					className="grid grid-cols-1 md:grid-cols-2 gap-8"
				>
					{techStackCategories.map((category) => {
						const categoryIcon = CATEGORY_ICONS[category.id];
						if (!categoryIcon) {
							console.warn(`Icon metadata not found for category: ${category.id}`);
							return null;
						}
						const CategoryIconComponent = categoryIcon.icon;

						return (
							<motion.div
								key={category.id}
								variants={categoryVariants}
								className="bg-surface border border-border rounded-lg p-6 md:p-8"
							>
								{/* Category Header */}
								<div className="flex items-center gap-3 mb-6">
									<div
										className="p-2 rounded-lg"
										style={{ backgroundColor: `${categoryIcon.color}15` }}
									>
										<CategoryIconComponent
											size={24}
											style={{ color: categoryIcon.color }}
										/>
									</div>
									<h3 className="text-lg md:text-xl font-semibold text-fg">
										{category.name}
									</h3>
								</div>

								{/* Tech Items Grid */}
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
									{category.techs.map((tech) => {
										const techIcon = getTechIcon(tech);
										const TechIconComponent = techIcon.icon;

										return (
											<motion.div
												key={tech}
												variants={itemVariants}
												whileHover={{
													scale: 1.05,
													transition: { duration: 0.2 },
												}}
												className="flex items-center gap-3 p-3 rounded-md hover:bg-border/50 transition-colors cursor-default group"
											>
												<div
													className="p-1.5 rounded transition-all group-hover:scale-110"
													style={{
														backgroundColor: `${techIcon.color}20`,
													}}
												>
													<TechIconComponent
														size={18}
														style={{ color: techIcon.color }}
														className="group-hover:text-accent transition-colors"
													/>
												</div>
												<span className="text-sm md:text-base font-medium text-muted group-hover:text-fg transition-colors">
													{tech}
												</span>
											</motion.div>
										);
									})}
								</div>
							</motion.div>
						);
					})}
				</motion.div>
			</div>
		</section>
	);
}
