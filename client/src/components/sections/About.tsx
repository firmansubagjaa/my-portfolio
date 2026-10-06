import { motion } from "motion/react";
import { useScrollInView } from "@/hooks/useScrollInView";

const aboutParagraphs = [
	"I started my journey in web development and gradually expanded into full-stack and AI/ML engineering. This blend allows me to solve end-to-end problems — from crafting responsive frontends to building scalable backends and training data pipelines. I'm driven by the challenge of connecting sophisticated algorithms with performant, user-centric interfaces.",
	"My approach is problem-first: I ask why before building, prioritize code quality and comprehensive documentation, and measure success by impact rather than features shipped. I believe that clean code and clear communication are not optional luxuries — they're foundational to sustainable engineering and team collaboration.",
	"Outside of coding, I'm invested in technical communities, always learning from peers, and exploring emerging technologies. I'm particularly excited about the intersection of AI, web infrastructure, and developer experience — where elegant solutions and rigorous engineering meet real-world impact.",
];

export function About() {
	const { ref, inView } = useScrollInView({
		threshold: 0.2,
		triggerOnce: true,
	});

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.15,
				delayChildren: inView ? 0 : 0,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: 20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: { duration: 0.6, ease: "easeOut" },
		},
	};

	return (
		<section
			ref={ref}
			id="about"
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
					<h2 className="text-3xl md:text-4xl font-bold text-fg mb-2">About</h2>
					<div className="h-1 w-12 bg-accent rounded-full" />
				</motion.div>

				{/* Paragraphs */}
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate={inView ? "visible" : "hidden"}
					className="max-w-3xl space-y-6"
				>
					{aboutParagraphs.map((paragraph, index) => (
						<motion.p
							key={index}
							variants={itemVariants}
							className="text-base md:text-lg text-muted leading-relaxed"
						>
							{paragraph}
						</motion.p>
					))}
				</motion.div>
			</div>
		</section>
	);
}
