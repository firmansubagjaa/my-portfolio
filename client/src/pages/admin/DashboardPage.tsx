import { Link } from "react-router";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useLogout, useMe } from "@/hooks/queries/use-auth";

export default function DashboardPage() {
	const { data: user, isLoading } = useMe();
	const { mutate: logout, isPending } = useLogout();

	if (isLoading) {
		return <Skeleton className="h-96" />;
	}

	return (
		<div className="max-w-6xl mx-auto px-4 py-16">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-4xl font-bold text-[--color-fg]">Dashboard Admin</h1>
				<Button onClick={() => logout()} variant="secondary" isLoading={isPending}>
					Logout
				</Button>
			</div>

			{user && (
				<div className="bg-[--color-surface] border border-[--color-border] rounded p-6 mb-8">
					<h2 className="text-lg font-semibold text-[--color-fg] mb-2">User Info</h2>
					<p className="text-[--color-muted]">Welcome back!</p>
				</div>
			)}

			<div className="bg-[--color-surface] border border-[--color-border] rounded p-6">
				<h2 className="text-lg font-semibold text-[--color-fg] mb-4">Manajemen Proyek</h2>
				<p className="text-[--color-muted] mb-4">Kelola proyek-proyek Anda di sini.</p>
				<Link
					to="/admin/projects/1/edit"
					className="inline-block bg-[--color-accent] text-[--color-bg] px-6 py-2 rounded hover:bg-[--color-accent]/90 transition-colors"
				>
					Edit Project
				</Link>
			</div>
		</div>
	);
}
