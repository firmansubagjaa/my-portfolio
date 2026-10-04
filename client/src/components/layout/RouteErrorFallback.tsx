import type { FallbackProps } from "react-error-boundary";
import { Button } from "@/components/ui/Button";

export function RouteErrorFallback({ resetErrorBoundary }: FallbackProps) {
	return (
		<div className="min-h-[70vh] flex items-center justify-center px-4">
			<div className="text-center max-w-md">
				<h1 className="text-3xl font-bold text-fg mb-4">Terjadi kesalahan</h1>
				<p className="text-muted mb-8">Terjadi kesalahan saat memuat halaman. Silakan coba lagi.</p>
				<Button onClick={resetErrorBoundary} variant="primary">
					Coba Lagi
				</Button>
			</div>
		</div>
	);
}
