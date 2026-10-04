import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from "react-router";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useLogout, useMe } from "@/hooks/queries/use-auth";
export default function DashboardPage() {
	const { data: user, isLoading } = useMe();
	const { mutate: logout, isPending } = useLogout();
	if (isLoading) {
		return _jsx(Skeleton, { className: "h-96" });
	}
	return _jsxs("div", {
		className: "max-w-6xl mx-auto px-4 py-16",
		children: [
			_jsxs("div", {
				className: "flex justify-between items-center mb-8",
				children: [
					_jsx("h1", {
						className: "text-4xl font-bold text-[--color-fg]",
						children: "Dashboard Admin",
					}),
					_jsx(Button, {
						onClick: () => logout(),
						variant: "secondary",
						isLoading: isPending,
						children: "Logout",
					}),
				],
			}),
			user &&
				_jsxs("div", {
					className: "bg-[--color-surface] border border-[--color-border] rounded p-6 mb-8",
					children: [
						_jsx("h2", {
							className: "text-lg font-semibold text-[--color-fg] mb-2",
							children: "User Info",
						}),
						_jsx("p", { className: "text-[--color-muted]", children: "Welcome back!" }),
					],
				}),
			_jsxs("div", {
				className: "bg-[--color-surface] border border-[--color-border] rounded p-6",
				children: [
					_jsx("h2", {
						className: "text-lg font-semibold text-[--color-fg] mb-4",
						children: "Manajemen Proyek",
					}),
					_jsx("p", {
						className: "text-[--color-muted] mb-4",
						children: "Kelola proyek-proyek Anda di sini.",
					}),
					_jsx(Link, {
						to: "/admin/projects/1/edit",
						className:
							"inline-block bg-[--color-accent] text-[--color-bg] px-6 py-2 rounded hover:bg-[--color-accent]/90 transition-colors",
						children: "Edit Project",
					}),
				],
			}),
		],
	});
}
