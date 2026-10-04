import { Navigate } from "react-router";
import { Spinner } from "@/components/ui/Spinner";
import { useMe } from "@/hooks/queries/use-auth";

interface ProtectedRouteProps {
	children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { data, isLoading, error } = useMe();

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Spinner />
			</div>
		);
	}

	if (error || !data) {
		return <Navigate to="/admin/login" replace />;
	}

	return children;
}
