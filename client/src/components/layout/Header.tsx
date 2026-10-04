import { Link, NavLink, type NavLinkRenderProps } from "react-router";

export function Header() {
	return (
		<header className="bg-surface border-b border-border">
			<nav
				className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between"
				aria-label="Navigasi utama"
			>
				<Link to="/" className="font-bold text-lg hover:text-accent">
					Portfolio
				</Link>
				<div className="flex gap-6">
					<NavLink
						to="/"
						className={({ isActive }: NavLinkRenderProps) =>
							`hover:text-accent transition-colors ${isActive ? "text-fg" : "text-muted"}`
						}
					>
						{({ isActive }: NavLinkRenderProps) => (
							<span aria-current={isActive ? "page" : undefined}>Beranda</span>
						)}
					</NavLink>
					<NavLink
						to="/projects"
						className={({ isActive }: NavLinkRenderProps) =>
							`hover:text-accent transition-colors ${isActive ? "text-fg" : "text-muted"}`
						}
					>
						{({ isActive }: NavLinkRenderProps) => (
							<span aria-current={isActive ? "page" : undefined}>Proyek</span>
						)}
					</NavLink>
				</div>
			</nav>
		</header>
	);
}
