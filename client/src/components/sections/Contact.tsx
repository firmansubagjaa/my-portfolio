import { motion } from "motion/react";
import { useScrollInView } from "@/hooks/useScrollInView";
import { Mail, Code2, Share2, Radio } from "lucide-react";

interface ContactLink {
	label: string;
	href: string;
	icon: React.ReactNode;
	ariaLabel: string;
}

const contactLinks: ContactLink[] = [
	{
		label: "Email",
		href: "mailto:firman.subagja@outlook.com",
		icon: <Mail size={24} />,
		ariaLabel: "Send email to Firman Subagja",
	},
	{
		label: "LinkedIn",
		href: "https://linkedin.com/in/firmansubagja",
		icon: <Share2 size={24} />,
		ariaLabel: "Visit Firman Subagja on LinkedIn",
	},
	{
		label: "GitHub",
		href: "https://github.com/firmansubagja",
		icon: <Code2 size={24} />,
		ariaLabel: "Visit Firman Subagja on GitHub",
	},
	{
		label: "X",
		href: "https://x.com/firmansubagja",
		icon: <Radio size={24} />,
		ariaLabel: "Follow Firman Subagja on X",
	},
];

export function Contact() {
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
			id="contact"
			className="w-full py-20 md:py-24 scroll-mt-20"
		>
			<div className="mx-auto max-w-6xl px-4">
				{/* Heading */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
					transition={{ duration: 0.6, ease: "easeOut" }}
					className="mb-4"
				>
					<h2 className="text-3xl md:text-4xl font-bold text-fg">Let's Talk</h2>
					<div className="h-1 w-12 bg-accent rounded-full mt-2" />
				</motion.div>

				{/* Subheading */}
				<motion.p
					initial={{ opacity: 0, y: 20 }}
					animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
					transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
					className="text-base md:text-lg text-muted max-w-2xl mb-12 leading-relaxed"
				>
					I'm open to interesting projects and collaboration opportunities.
				</motion.p>

				{/* Contact Links */}
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate={inView ? "visible" : "hidden"}
					className="flex flex-wrap gap-6 justify-center md:justify-start"
				>
					{contactLinks.map((link) => (
						<motion.a
							key={link.label}
							href={link.href}
							target={link.href.startsWith("mailto:") ? undefined : "_blank"}
							rel={link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
							aria-label={link.ariaLabel}
							variants={itemVariants}
							whileHover={{
								scale: 1.15,
								transition: { duration: 0.2 },
							}}
							className="p-4 rounded-lg border border-border bg-surface hover:border-accent hover:text-accent transition-all duration-200 cursor-pointer text-muted focus:outline-2 focus:outline-offset-2 focus:outline-accent"
						>
							{link.icon}
						</motion.a>
					))}
				</motion.div>
			</div>
		</section>
	);
}
