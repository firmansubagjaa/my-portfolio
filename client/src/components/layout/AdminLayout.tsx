import { ErrorBoundary } from "react-error-boundary";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { useLogout, useMe } from "@/hooks/queries/use-auth";
import { cn } from "@/lib/cn";
import { RouteErrorFallback } from "./RouteErrorFallback";
import { SkipLink } from "./SkipLink";

function navLinkClasses({ isActive }: { isActive: boolean }) {
	return cn(
		"rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
		isActive ? "bg-surface text-fg" : "text-muted hover:text-fg",
	);
}

export function AdminLayout() {
	const location = useLocation();
	const navigate = useNavigate();
	const { data: user } = useMe();
	const { mutate: logout, isPending: isLoggingOut } = useLogout();

	const handleLogout = () => {
		logout(undefined, {
			onSuccess: () => {
				toast.success("Berhasil keluar");
				navigate("/admin/login", { replace: true });
			},
			onError: () => toast.error("Gagal keluar. Coba lagi."),
		});
	};

	return (
		<div className="flex min-h-screen flex-col bg-bg text-fg">
			<SkipLink />
			<header className="sticky top-0 z-40 border-b border-border bg-bg/95 backdrop-blur">
				<div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
					<div className="flex min-w-0 items-center gap-4 sm:gap-6">
						<Link
							to="/admin"
							className="flex shrink-0 items-center gap-2 font-bold text-fg transition-colors hover:text-accent"
						>
							<span aria-hidden="true" className="h-2 w-2 rounded-full bg-accent" />
							<span>
								Portfolio <span className="text-muted">Admin</span>
							</span>
						</Link>
						<nav aria-label="Navigasi admin" className="flex items-center gap-1">
							<NavLink to="/admin" end className={navLinkClasses}>
								Proyek
							</NavLink>
						</nav>
					</div>

					<div className="flex items-center gap-1 sm:gap-3">
						<a
							href="/"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-1.5 text-sm text-muted transition-colors hover:text-fg"
						>
							{/* Icon-only on phones; the sr-only text keeps the accessible name */}
							<span className="sr-only sm:not-sr-only">Lihat Situs</span>
							<svg
								aria-hidden="true"
								className="h-4 w-4 sm:h-3.5 sm:w-3.5"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path d="M15 3h6v6" />
								<path d="M10 14 21 3" />
								<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
							</svg>
							<span className="sr-only">(tab baru)</span>
						</a>
						{user && (
							<span className="hidden border-l border-border pl-3 text-sm text-muted sm:inline">
								{user.username}
							</span>
						)}
						<Button variant="ghost" size="sm" onClick={handleLogout} isLoading={isLoggingOut}>
							Logout
						</Button>
					</div>
				</div>
			</header>

			<ErrorBoundary FallbackComponent={RouteErrorFallback} resetKeys={[location.pathname]}>
				<main
					id="main"
					tabIndex={-1}
					className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 focus:outline-none md:px-6"
				>
					<Outlet />
				</main>
			</ErrorBoundary>
		</div>
	);
}
