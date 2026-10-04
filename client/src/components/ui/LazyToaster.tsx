// File: /client/src/components/ui/LazyToaster.tsx
// sonner (~8 KB gzip) is only needed once a toast fires (admin login/logout, mutations),
// so the Toaster is loaded after first paint instead of shipping in the entry bundle.
// `toast()` callers import "sonner" directly and share the same module instance.
import { lazy, Suspense } from "react";

const Toaster = lazy(() => import("sonner").then((mod) => ({ default: mod.Toaster })));

export function LazyToaster() {
	return (
		<Suspense fallback={null}>
			<Toaster
				theme="dark"
				position="bottom-right"
				toastOptions={{
					style: { background: "#1C1917", border: "1px solid #292524", color: "#FAFAF9" },
				}}
			/>
		</Suspense>
	);
}
