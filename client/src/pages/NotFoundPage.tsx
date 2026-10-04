import { Link } from "react-router";

export default function NotFoundPage() {
	return (
		<div className="max-w-6xl mx-auto px-4 py-16 text-center">
			<h1 className="text-4xl font-bold text-[--color-fg] mb-4">Halaman Tidak Ditemukan</h1>
			<p className="text-[--color-muted] text-lg mb-8">Maaf, halaman yang Anda cari tidak ada.</p>
			<Link
				to="/"
				className="inline-block bg-[--color-accent] text-[--color-bg] px-6 py-3 rounded hover:bg-[--color-accent]/90 transition-colors"
			>
				Kembali ke Beranda
			</Link>
		</div>
	);
}
