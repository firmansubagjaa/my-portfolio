import { ArrowRight, Download } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";

interface HeroCTA {
	label: string;
	href: string;
	variant: "primary" | "secondary";
	icon?: React.ReactNode;
}

interface HeroProps {
	title?: string;
	subtitle?: string;
	tagline?: string;
	identifier?: string;
	ctas?: HeroCTA[];
}

const defaultCTAs: HeroCTA[] = [
	{
		label: "View My Work",
		href: "/projects",
		variant: "primary",
	},
	{
		label: "Get in Touch",
		href: "#contact",
		variant: "secondary",
	},
	{
		label: "Download CV",
		href: "https://drive.google.com/file/d/1WG_zgy7cRf93RH65tDSpBiTqZvizfDCM/view?usp=drive_link",
		variant: "secondary",
		icon: <Download size={18} />,
	},
];

export function Hero({
	title = "Firman Subagja",
	subtitle = "Full-Stack & AI/ML Engineer",
	tagline = "Building high-performance web products & scalable AI pipelines.",
	identifier = "Indonesia • Full-time & Project-based",
	ctas = defaultCTAs,
}: HeroProps) {
	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
				delayChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.8, ease: "easeOut" },
		},
	};

	return (
		<motion.section
			className="w-full py-16 md:py-20"
			initial="hidden"
			animate="visible"
			variants={containerVariants}
		>
			<div className="mx-auto max-w-6xl px-4">
				<div className="flex flex-col items-center text-center">
					{/* Title */}
					<motion.h1
						className="text-4xl md:text-5xl lg:text-6xl font-bold text-fg mb-4 max-w-4xl leading-tight"
						variants={itemVariants}
					>
						{title}
					</motion.h1>

					{/* Subtitle */}
					<motion.h2
						className="text-xl md:text-2xl lg:text-3xl font-semibold text-accent mb-4"
						variants={itemVariants}
					>
						{subtitle}
					</motion.h2>

					{/* Tagline */}
					<motion.p
						className="text-base md:text-lg text-muted max-w-2xl mb-4 leading-relaxed"
						variants={itemVariants}
					>
						{tagline}
					</motion.p>

					{/* Identifier */}
					<motion.p className="text-sm md:text-base text-muted mb-8" variants={itemVariants}>
						{identifier}
					</motion.p>

					{/* CTAs */}
					<motion.div
						className="flex flex-col sm:flex-row gap-4 items-center justify-center"
						variants={itemVariants}
					>
						{ctas.map((cta, index) => {
							const isInternalLink = cta.href.startsWith("#") || cta.href.startsWith("/");

							return (
								<motion.div
									key={index}
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.98 }}
									transition={{ type: "spring", stiffness: 400, damping: 17 }}
								>
									{isInternalLink ? (
										<Link
											to={cta.href}
											className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 bg-accent text-bg font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-accent/50"
										>
											{cta.variant === "primary" ? (
												<>
													{cta.label}
													<ArrowRight size={18} />
												</>
											) : (
												cta.label
											)}
										</Link>
									) : (
										<a
											href={cta.href}
											target="_blank"
											rel="noopener noreferrer"
											className={`inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 font-semibold rounded-lg transition-all duration-200 ${
												cta.variant === "primary"
													? "bg-accent text-bg hover:shadow-lg hover:shadow-accent/50"
													: "border-2 border-accent text-accent hover:bg-accent/10"
											}`}
										>
											{cta.label}
											{cta.icon ? cta.icon : cta.variant === "primary" && <ArrowRight size={18} />}
										</a>
									)}
								</motion.div>
							);
						})}
					</motion.div>
				</div>
			</div>
		</motion.section>
	);
}
