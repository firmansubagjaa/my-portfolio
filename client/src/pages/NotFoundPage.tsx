import { Link } from "react-router";

export default function NotFoundPage() {
	return (
		<div className="max-w-6xl mx-auto px-4 py-16 text-center">
			<h1 className="text-4xl font-bold text-fg mb-4">Halaman Tidak Ditemukan</h1>
			<p className="text-muted text-lg mb-8">Maaf, halaman yang Anda cari tidak ada.</p>
			<Link
				to="/"
				className="inline-block bg-accent text-bg px-6 py-3 rounded hover:bg-accent/90 transition-colors"
			>
				Kembali ke Beranda
			</Link>
		</div>
	);
}
