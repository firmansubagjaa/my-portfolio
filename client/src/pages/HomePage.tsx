import { Link } from "react-router";
import { BentoGrid } from "@/components/bento/BentoGrid";
import { BentoSkeleton } from "@/components/bento/BentoSkeleton";
import { useProjects } from "@/hooks/queries/use-projects";

export default function HomePage() {
	const { data, isLoading } = useProjects({ limit: 6, page: 1 });
	const projects = data?.items || [];

	return (
		<div className="max-w-6xl mx-auto px-4 py-16">
			<h1 className="text-4xl font-bold text-fg mb-6">Selamat Datang</h1>
			<p className="text-muted text-lg max-w-2xl mb-8">
				Ini adalah portfolio profesional yang menampilkan proyek-proyek terbaik saya. Jelajahi
				berbagai karya dan temukan bagaimana saya dapat membantu Anda mewujudkan ide menjadi
				kenyataan.
			</p>
			<Link
				to="/projects"
				className="inline-block bg-accent text-bg px-6 py-3 rounded hover:bg-accent/90 transition-colors"
			>
				Lihat Semua Proyek
			</Link>

			{/* Featured Projects */}
			<div className="mt-16">
				<h2 className="text-2xl font-bold text-fg mb-6">Proyek Unggulan</h2>

				{isLoading ? <BentoSkeleton /> : <BentoGrid projects={projects} prioritizeFirst />}
			</div>
		</div>
	);
}
