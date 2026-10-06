import { m } from "motion/react";
import { useScrollInView } from "@/hooks/useScrollInView";
import { Code2, Link2, Download } from "lucide-react";

interface ContactLink {
	label: string;
	href: string;
	icon: React.ReactNode;
	ariaLabel: string;
}

const contactLinks: ContactLink[] = [
	{
		label: "LinkedIn",
		href: "https://www.linkedin.com/in/firmannnn/",
		icon: <Link2 size={24} />,
		ariaLabel: "Visit Firman Subagja on LinkedIn",
	},
	{
		label: "GitHub",
		href: "https://github.com/firmansubagjaa",
		icon: <Code2 size={24} />,
		ariaLabel: "Visit Firman Subagja on GitHub",
	},
	{
		label: "Download CV",
		href: "https://drive.google.com/file/d/1WG_zgy7cRf93RH65tDSpBiTqZvizfDCM/view?usp=drive_link",
		icon: <Download size={24} />,
		ariaLabel: "Download Firman's CV from Google Drive",
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
				<m.div
					initial={{ opacity: 0, y: 20 }}
					animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
					transition={{ duration: 0.6, ease: "easeOut" }}
					className="mb-4"
				>
					<h2 className="text-3xl md:text-4xl font-bold text-fg">Let's Talk</h2>
					<div className="h-1 w-12 bg-accent rounded-full mt-2" />
				</m.div>

				{/* Subheading */}
				<m.p
					initial={{ opacity: 0, y: 20 }}
					animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
					transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
					className="text-base md:text-lg text-muted max-w-2xl mb-12 leading-relaxed"
				>
					I'm open to interesting projects and collaboration opportunities.
				</m.p>

				{/* Contact Links */}
				<m.div
					variants={containerVariants}
					initial="hidden"
					animate={inView ? "visible" : "hidden"}
					className="flex flex-wrap gap-6 justify-center md:justify-start"
				>
					{contactLinks.map((link) => (
						<m.a
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
						</m.a>
					))}
				</m.div>
			</div>
		</section>
	);
}
