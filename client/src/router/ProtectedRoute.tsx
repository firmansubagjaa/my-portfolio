// File: /client/src/router/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from "react-router";
import { Spinner } from "@/components/ui/Spinner";
import { useMe } from "@/hooks/queries/use-auth";

// Layout route guarding /admin/*: session is read from GET /auth/me (cookie is HTTP-only)
export function ProtectedRoute() {
	const location = useLocation();
	const { data, isPending, isError } = useMe();

	if (isPending) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg text-muted">
				<Spinner label="Memeriksa sesi" />
				<p aria-hidden="true" className="text-sm">
					Memeriksa sesi…
				</p>
			</div>
		);
	}

	if (isError || !data) {
		return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
	}

	return <Outlet />;
}
