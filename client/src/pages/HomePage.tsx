import { BentoGrid } from "@/components/bento/BentoGrid";
import { BentoSkeleton } from "@/components/bento/BentoSkeleton";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { TechStack } from "@/components/sections/TechStack";
import { Contact } from "@/components/sections/Contact";
import { useProjects } from "@/hooks/queries/use-projects";

export default function HomePage() {
	const { data, isLoading } = useProjects({ limit: 6, page: 1 });
	const projects = data?.items || [];

	return (
		<div className="w-full">
			{/* Hero Section */}
			<div className="max-w-6xl mx-auto px-4">
				<Hero />

				{/* Featured Projects */}
				<section className="py-20 md:py-24 scroll-mt-20">
					<h2 className="text-3xl md:text-4xl font-bold text-fg mb-8">Featured Projects</h2>
					{isLoading ? <BentoSkeleton /> : <BentoGrid projects={projects} prioritizeFirst />}
				</section>
			</div>

			{/* Additional Sections */}
			<div className="max-w-6xl mx-auto px-4">
				<About />
				<TechStack />
				<Contact />
			</div>
		</div>
	);
}
